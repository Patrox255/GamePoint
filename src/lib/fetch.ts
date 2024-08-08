import { QueryClient } from "@tanstack/react-query";
import { IGame } from "../models/game.model";
import { API_URL } from "./config";
import generateUrlEndpointWithSearchParams from "../helpers/generateUrlEndpointWithSearchParams";
import { IOrderCustomizationProperty } from "../store/products/SearchCustomizationContext";
import { IReview } from "../models/review.model";
import { IActionMutateArgsRegister } from "../pages/RegisterPage";
import { cartDetails, cartStateArr } from "../store/cartSlice";
import { ILoginActionMutateArgs } from "../components/UI/modals/LoginModal";
import { IReviewDataToSend } from "../store/product/AddReviewContext";
import { FormActionBackendResponse } from "../components/UI/FormWithErrorHandling";

export const queryClient = new QueryClient();

export const getJSON = async function <dataInterface>({
  url,
  signal,
  method,
  body,
}: {
  url: string;
  signal?: AbortSignal;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}) {
  const res = await fetch(url, {
    ...(signal && { signal }),
    ...(method && { method }),
    ...(body !== undefined && {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
    credentials: "include",
  });
  const contentType = res.headers.get("Content-Type");
  let data;
  if (contentType && contentType.includes("application/json"))
    data = await res.json();
  else data = await res.text();
  if (!res.ok) {
    if (res.status === 422 && data.errors) throw data.errors;
    throw {
      message: `${
        (data && (data as { message?: string }).message) ||
        "Failed to fetch data."
      }`,
      status: res.status,
    };
  }

  return { data } as { data: dataInterface };
};

export interface ILoaderResult<resultInterface> {
  data?: resultInterface[];
  error?: { message: string; status: number };
}

export const load10MostPopularGames = async (signal?: AbortSignal) => {
  const data = await getJSON<IGame[]>({
    url: `${API_URL}/products?most_popular=1&limit=10`,
    signal,
  });
  return data;
};

export const load10GamesByQuery = async (
  query: string,
  signal?: AbortSignal,
  pageNr: number = 0,
  priceMin?: number,
  priceMax?: number,
  popularityOrder?: IOrderCustomizationProperty,
  priceOrder?: IOrderCustomizationProperty,
  titleOrder?: IOrderCustomizationProperty,
  discount?: number,
  genres?: string[],
  platforms?: string[],
  developers?: string[],
  publishers?: string[]
) => {
  const data = await getJSON<IGame[]>({
    url: generateUrlEndpointWithSearchParams(`${API_URL}/products`, {
      query,
      page: pageNr,
      priceMin,
      priceMax,
      limit: 10,
      popularityOrder,
      priceOrder,
      titleOrder,
      discount,
      genres,
      platforms,
      developers,
      publishers,
    }),
    signal,
  });
  return data;
};

export const retrieveAmountOfGamesByQuery = async (
  query: string,
  signal?: AbortSignal,
  priceMin?: number,
  priceMax?: number,
  discount?: number,
  genres?: string[],
  platforms?: string[],
  developers?: string[],
  publishers?: string[]
) => {
  const data = await getJSON<number>({
    url: generateUrlEndpointWithSearchParams(`${API_URL}/products`, {
      count: 1,
      query,
      priceMax,
      priceMin,
      discount,
      genres,
      platforms,
      developers,
      publishers,
    }),
    signal,
  });
  return data;
};

export const loadTags = async <tagInterface>({
  signal,
  mostPopular,
  query,
  limit,
  gameDocumentTagPropertyName,
}: {
  signal?: AbortSignal;
  mostPopular?: number;
  query?: string;
  limit?: number;
  gameDocumentTagPropertyName: string;
}) => {
  const data = await getJSON<tagInterface[]>({
    url: generateUrlEndpointWithSearchParams(`${API_URL}/tags`, {
      mostPopular,
      query,
      limit,
      gameDocumentTagPropertyName,
    }),
    signal,
  });
  return data;
};

export const retrieveMinAndMaxOfExistingPrices = async (
  signal?: AbortSignal
) => {
  const data = await getJSON<{ min: number; max: number }>({
    url: `${API_URL}/products/price`,
    signal,
  });
  return data;
};

export const getGameData = async <T = IGame>({
  signal,
  productSlug,
  onlyReviews,
  reviewsPageNr,
  maxReviewsPerPage,
}: {
  signal?: AbortSignal;
  productSlug: string;
  onlyReviews?: boolean;
  reviewsPageNr?: number;
  maxReviewsPerPage?: number;
}) => {
  const data = await getJSON<IGame>({
    url: generateUrlEndpointWithSearchParams(
      `${API_URL}/products/${productSlug}`,
      {
        onlyReviews,
        reviewsPageNr,
        maxReviewsPerPage,
      }
    ),
    signal,
  });
  const releaseDate = data.data.releaseDate;
  if (releaseDate) data.data.releaseDate = new Date(releaseDate);
  const reviews = data.data.reviews;
  if (reviews && reviews.length > 0)
    reviews.forEach((review) => (review.date = new Date(review.date)));
  const reviewsArr = data.data;
  if (Array.isArray(reviewsArr))
    (data.data as unknown as IReview[]) = reviewsArr.map((review) => ({
      ...review,
      date: new Date(review.date),
    }));
  return data as { data: T };
};

export const login = async (userData: ILoginActionMutateArgs) => {
  const data = await getJSON<string>({
    url: `${API_URL}/login`,
    method: "POST",
    body: userData,
  });
  return data;
};

export interface IGetAuthDataResponse {
  isAdmin: boolean;
  login: string;
  userId: string;
}

export interface IGetAuthResponse {
  data: IGetAuthDataResponse;
}

export const getAuthData = async (signal: AbortSignal) => {
  const data = await getJSON<IGetAuthDataResponse>({
    signal,
    url: `${API_URL}/auth`,
  });

  return data;
};

export const logout = async () => {
  const data = await getJSON<string>({ url: `${API_URL}/logout` });

  return data;
};

export const register = async (formData: IActionMutateArgsRegister) => {
  const data = await getJSON<{ registrationCode: string; uId: string }>({
    url: `${API_URL}/register`,
    method: "POST",
    body: formData,
  });

  return data;
};

export const getCountries = async function (signal: AbortSignal) {
  const data = await getJSON<object & { name: { common: string } }[]>({
    url: "https://restcountries.com/v3.1/all",
    signal,
  });

  return data;
};

export const verifyEmailGuard = async function (
  signal: AbortSignal,
  uId: string,
  registrationCode: string
) {
  const data = await getJSON<string>({
    signal,
    url: generateUrlEndpointWithSearchParams(`${API_URL}/verify-email-guard`, {
      registrationCode,
      uId,
    }),
  });

  return data;
};

export const verifyEmail = async (verifyEmailData: {
  uId: string;
  providedRegistrationCode: string;
  registrationCode: string;
}) => {
  const data = await getJSON<string | { message: string }>({
    url: `${API_URL}/verify-email`,
    method: "POST",
    body: verifyEmailData,
  });

  return data;
};

export const getCart = async function (signal: AbortSignal) {
  const data = await getJSON<{ cart: cartStateArr }>({
    url: `${API_URL}/cart`,
    signal,
  });

  return data;
};

export const sendCart = async function (
  cart: cartStateArr,
  signal: AbortSignal
) {
  const data = await getJSON({
    url: `${API_URL}/cart`,
    method: "POST",
    body: { cart },
    signal,
  });

  return data;
};

export const getCartDetails = async function (
  signal: AbortSignal,
  cart: cartStateArr
) {
  const data = await getJSON<cartDetails>({
    url: `${API_URL}/cart-details`,
    body: { cart },
    signal,
    method: "POST",
  });

  return data;
};

export const sendReview = async function (reviewData: IReviewDataToSend) {
  const data = await getJSON<string>({
    url: `${API_URL}/add-review`,
    method: "POST",
    body: reviewData,
  });

  return data;
};

export const removeReview = async function (reviewId: string) {
  const data = await getJSON<string>({
    url: `${API_URL}/remove-review`,
    method: "POST",
    body: { reviewId },
  });

  return data as FormActionBackendResponse;
};
