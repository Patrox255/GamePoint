import { QueryClient } from "@tanstack/react-query";
import { IGame } from "../models/game.model";
import { API_URL } from "./config";
import generateUrlEndpointWithSearchParams from "../helpers/generateUrlEndpointWithSearchParams";
import { IReview } from "../models/review.model";
import { IActionMutateArgsRegister } from "../pages/RegisterPage";
import { cartDetails, cartStateArr } from "../store/cartSlice";
import { ILoginActionMutateArgs } from "../components/UI/modals/LoginModal";
import { IReviewDataToSend } from "../store/product/AddReviewContext";
import { FormActionBackendResponse } from "../components/UI/FormWithErrorHandling";
import { IActionMutateArgsContactUserPanel } from "../components/userPanel/UserContactInformation";
import { IAdditionalContactInformation } from "../models/additionalContactInformation.model";
import { IGameWithQuantityBasedOnCartDetailsEntry } from "../helpers/generateGamesWithQuantityOutOfCartDetailsEntries";
import { IAdditionalContactInformationFromGuestOrder } from "../components/orderPage/OrderPageContent";
import { IOrder } from "../models/order.model";
import { IOrderCustomizationProperty } from "../hooks/useHandleElementsOrderCustomizationState";
import { IOrdersSortOnlyDebouncedProperties } from "../store/userPanel/UserOrdersManagerOrdersDetailsContext";
import filterOrOnlyIncludeCertainPropertiesFromObj from "../helpers/filterOrOnlyIncludeCertainPropertiesFromObj";
import { IUserPopulated } from "../models/user.model";
import {
  generalInformationModificationModesRelatedToModificationByBtn,
  generalInformationModificationStoredInQueryMode,
  transformGeneralInformationModificationUserFriendlyModeToOneStoredInQuery,
} from "../components/userPanel/admin/users/SelectedUserManagement";
import { INewOrExistingProductManagementStateToSend } from "../components/product/NewOrExistingProductManagementForm";
import { useQueryGetTagsAvailableTagsNames } from "../hooks/searchCustomizationRelated/useQueryGetTagsTypes";

export const queryClient = new QueryClient();

export type IResponseFromFetchFn<T> = {
  data: T;
};

export const defaultFetchErrorMessageContent = "Failed to fetch data.";

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
        (res.status === 403
          ? "You are not allowed to access this functionality!"
          : defaultFetchErrorMessageContent)
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

export type IGetGameDataNecessaryInformation = {
  productSlug?: string;
  productId?: string;
};
export const getGameData = async <T = IGame>({
  signal,
  productSlug,
  productId,
  onlyReviews,
  reviewsPageNr,
  maxReviewsPerPage,
}: {
  signal?: AbortSignal;
  onlyReviews?: boolean;
  reviewsPageNr?: number;
  maxReviewsPerPage?: number;
} & IGetGameDataNecessaryInformation) => {
  const data = await getJSON<IGame>({
    url: generateUrlEndpointWithSearchParams(
      `${API_URL}/products/product-data`,
      {
        onlyReviews,
        reviewsPageNr,
        maxReviewsPerPage,
        productSlug,
        productId,
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
  ordersAmount: number;
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

export type IDataOrErrorObjBackendResponse<T = string> =
  | T
  | { message: string };

export const verifyEmail = async (verifyEmailData: {
  uId: string;
  providedRegistrationCode: string;
  registrationCode: string;
  cartDataToSetNewUserCartTo: cartStateArr;
}) => {
  const data = await getJSON<IDataOrErrorObjBackendResponse>({
    url: `${API_URL}/verify-email`,
    method: "POST",
    body: {
      ...filterOrOnlyIncludeCertainPropertiesFromObj(verifyEmailData, [
        "cartDataToSetNewUserCartTo",
      ]),
      cartData: verifyEmailData.cartDataToSetNewUserCartTo,
    },
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

export type ICartDetailsReceivedObj = {
  cart: cartDetails;
};
export const getCartDetails = async function (
  signal: AbortSignal,
  cart: cartStateArr
) {
  const data = await getJSON<ICartDetailsReceivedObj>({
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

export const manageContactInformation = async function (
  formDataWithPotentialEntryToUpdateId: IActionMutateArgsContactUserPanel
) {
  const data = await getJSON<string>({
    url: `${API_URL}/contact-information/add`,
    body: formDataWithPotentialEntryToUpdateId,
    method: "POST",
  });

  return data;
};

export interface IRetrievedContactInformation {
  additionalContactInformation: IAdditionalContactInformation[];
  activeAdditionalContactInformation: string | null;
}

export interface IRetrieveOrModifyContactInformationCustomUserDataProperties {
  customUserId?: string;
  customUserLogin?: string;
}
export const retrieveContactInformation = async function ({
  signal,
  customUserId,
  customUserLogin,
}: {
  signal: AbortSignal;
} & IRetrieveOrModifyContactInformationCustomUserDataProperties) {
  const data = await getJSON<IRetrievedContactInformation>({
    url: `${API_URL}/contact-information`,
    signal,
    method: "POST",
    body: { customUserId, customUserLogin },
  });

  data.data.additionalContactInformation.forEach(
    (additionalContactInformationEntry) =>
      (additionalContactInformationEntry.dateOfBirth = new Date(
        additionalContactInformationEntry.dateOfBirth
      ))
  );

  return data;
};

export interface IChangeUserActiveAdditionalInformationQueryArg
  extends IRetrieveOrModifyContactInformationCustomUserDataProperties {
  newActiveAdditionalInformationEntryId: string;
}
export const changeUserActiveAdditionalInformation = async function ({
  newActiveAdditionalInformationEntryId,
  customUserId,
  customUserLogin,
}: IChangeUserActiveAdditionalInformationQueryArg) {
  const data = await getJSON<string>({
    url: `${API_URL}/contact-information-active`,
    body: {
      newActiveAdditionalInformationEntryId,
      customUserId,
      customUserLogin,
    },
    method: "POST",
  });

  return data;
};

export const validateContactInformationFromGuestOrder = async function (
  formData: IAdditionalContactInformationFromGuestOrder
) {
  const data = await getJSON<string>({
    url: `${API_URL}/contact-information/validate`,
    method: "POST",
    body: formData,
  });
  return data;
};

export type IOrderToSendData = {
  cartDetailsEntry: IGameWithQuantityBasedOnCartDetailsEntry[];
};
export type IPlaceAnOrderDataObject =
  | {
      contactInformationForGuests: IAdditionalContactInformationFromGuestOrder;
      contactInformationForLoggedUsers?: undefined;
      orderedGamesDetails: IGameWithQuantityBasedOnCartDetailsEntry[];
    }
  | {
      contactInformationForGuests?: undefined;
      contactInformationForLoggedUsers: Omit<
        IAdditionalContactInformation,
        "dateOfBirth"
      > & { dateOfBirth: string };
      orderedGamesDetails: IGameWithQuantityBasedOnCartDetailsEntry[];
    };

export type IOrderResponseLoggedUser = { savedOrderId: string };
export type IOrderResponseGuest = {
  accessCode: string;
  email: string;
} & IOrderResponseLoggedUser;
export type IOrderResponse = IDataOrErrorObjBackendResponse<
  IOrderResponseLoggedUser | IOrderResponseGuest
>;
export type IOrderResponseFromFetchFn = IResponseFromFetchFn<IOrderResponse>;
export const placeAnOrder: (
  params: IPlaceAnOrderDataObject
) => Promise<IOrderResponseFromFetchFn> = async function ({
  orderedGamesDetails,
  contactInformationForGuests,
  contactInformationForLoggedUsers,
}) {
  const data = await getJSON<IOrderResponse>({
    url: `${API_URL}/order`,
    method: "POST",
    body: {
      orderedGamesDetails,
      ...(contactInformationForGuests
        ? { contactInformationForGuests }
        : { contactInformationForLoggedUsers }),
    },
  });
  return data;
};

const parseDatesOfReceivedOrders = (orders: IOrder[]) => {
  orders.forEach((order) => {
    order.date = new Date(order.date);
    order.orderContactInformation.dateOfBirth = new Date(
      order.orderContactInformation.dateOfBirth
    );
  });
};

export type IRetrieveOrdersDetailsBackendResponse = { orders: IOrder[] };
export const retrieveUserOrdersDetails = async function (
  signal: AbortSignal,
  pageNr: number,
  sortProperties: IOrdersSortOnlyDebouncedProperties
) {
  const data = await getJSON<
    IDataOrErrorObjBackendResponse<IRetrieveOrdersDetailsBackendResponse>
  >({
    url: generateUrlEndpointWithSearchParams(`${API_URL}/order`, {
      pageNr,
      sortProperties,
    }),
    signal,
  });
  const orders =
    data.data &&
    typeof data.data === "object" &&
    (data.data as IRetrieveOrdersDetailsBackendResponse).orders;
  if (orders) parseDatesOfReceivedOrders(orders);

  return data;
};

export const retrieveOrderData = async function (
  orderId: string,
  signal: AbortSignal
) {
  const data = await getJSON<IOrder>({
    url: `${API_URL}/order/data`,
    body: { orderId },
    method: "POST",
    signal,
  });

  if (data.data) parseDatesOfReceivedOrders([data.data]);

  return data;
};

export type IRetrieveAvailableUsersPossibleReceivedDataObj = {
  login: string;
  email: string;
};
export type IRetrieveAvailableUsersPossibleReceivedData =
  IRetrieveAvailableUsersPossibleReceivedDataObj[];
export const retrieveAvailableUsersBasedOnLoginOrEmailAddress = async function (
  loginOrEmail: string,
  signal: AbortSignal,
  forOrders?: boolean,
  onlyAmount?: boolean,
  pageNr?: number
) {
  const data = await getJSON<IRetrieveAvailableUsersPossibleReceivedData>({
    url: generateUrlEndpointWithSearchParams(`${API_URL}/retrieve-users`, {
      onlyAmount,
      forOrders,
      pageNr,
    }),
    method: "POST",
    body: { loginOrEmail },
    signal,
  });

  return data;
};

type IRetrieveAvailableOrdersResponse<T extends 1 | undefined> = T extends 1
  ? IResponseFromFetchFn<number>
  : IResponseFromFetchFn<IOrder[]>;

export async function retrieveAvailableOrdersBasedOnSelectedUserAndIdentificator<
  T extends 1 | undefined
>(
  ordererLogin: string = "",
  orderId: string = "",
  sortProperties: IOrdersSortOnlyDebouncedProperties,
  pageNr: number,
  signal: AbortSignal,
  amount?: T
): Promise<IRetrieveAvailableOrdersResponse<T>> {
  const data = await getJSON<IOrder[] | number>({
    url: generateUrlEndpointWithSearchParams(`${API_URL}/retrieve-orders`, {
      pageNr,
      sortProperties,
      amount,
    }),
    body: { ordererLogin, orderId },
    method: "POST",
    signal,
  });
  const orders = data?.data;
  if (orders && Array.isArray(orders) && orders.length > 0)
    parseDatesOfReceivedOrders(orders);

  return data as IRetrieveAvailableOrdersResponse<T>;
}

export async function retrievePossibleOrderStatuses(signal: AbortSignal) {
  const data = await getJSON<string[]>({
    url: `${API_URL}/retrieve-order-statuses`,
    signal,
  });

  return data;
}

export type IUpdateOrderByAdmin = {
  orderId: string;
  newStatus?: string;
  newUserContactInformationEntryId?: string;
  ordererLoginToDeterminePossibleContactInformationEntries?: string;
  modifiedCartItems?: IGameWithQuantityBasedOnCartDetailsEntry[];
};
export async function updateOrderStatus({
  newStatus,
  orderId,
  newUserContactInformationEntryId,
  ordererLoginToDeterminePossibleContactInformationEntries,
  modifiedCartItems,
}: IUpdateOrderByAdmin) {
  const data = await getJSON<string>({
    url: `${API_URL}/order/modify`,
    method: "POST",
    body: {
      newStatus,
      orderId,
      newUserContactInformationEntryId,
      ordererLoginToDeterminePossibleContactInformationEntries,
      modifiedCartItems,
    },
  });

  return data;
}

export const retrieveUserDataByAdmin = async function (
  userLogin: string,
  signal: AbortSignal
) {
  const data = await getJSON<IUserPopulated>({
    url: `${API_URL}/retrieve-user-data`,
    method: "POST",
    body: { userLogin },
    signal,
  });
  const { orders } = data.data;
  if (Array.isArray(orders) && orders.length > 0)
    parseDatesOfReceivedOrders(orders);
  return data;
};

export interface IModifyUserDataByAdminQueryFnArg {
  userLogin: string;
  modificationMode: generalInformationModificationStoredInQueryMode;
  modificationValue?: string;
}
export const modifyUserDataByAdmin = async function ({
  userLogin,
  modificationMode,
  modificationValue,
}: IModifyUserDataByAdminQueryFnArg) {
  const generalInformationModificationModesRelatedToModificationByBtnTransformedToQuery =
    generalInformationModificationModesRelatedToModificationByBtn.map(
      (generalInformationModificationModesRelatedToModificationByBtnEntry) =>
        transformGeneralInformationModificationUserFriendlyModeToOneStoredInQuery(
          generalInformationModificationModesRelatedToModificationByBtnEntry
        )
    );
  const data = await getJSON<string>({
    url: `${API_URL}/modify-user-data-admin`,
    body: {
      userLogin,
      ...(modificationMode === "login" && { login: modificationValue }),
      ...(modificationMode === "e-mail" && { email: modificationValue }),
      ...(generalInformationModificationModesRelatedToModificationByBtnTransformedToQuery.includes(
        modificationMode
      ) && {
        mode:
          modificationMode === "e-mail-verification"
            ? "emailVerification"
            : modificationMode,
      }),
    },
    method: "POST",
  });
  return data;
};

export const productManagement = async function (
  productManagementDataToSend: INewOrExistingProductManagementStateToSend
) {
  const data = await getJSON<IGame>({
    url: `${API_URL}/products-management`,
    method: "POST",
    body: productManagementDataToSend,
  });
  return data;
};

export interface IAddProductTagFnArg {
  tagId: useQueryGetTagsAvailableTagsNames;
  tagName: string;
}
export const addProductTag = async function ({
  tagId,
  tagName,
}: IAddProductTagFnArg) {
  const data = await getJSON<string>({
    url: `${API_URL}/add-product-tag`,
    body: { tagId, tagName },
    method: "POST",
  });
  return data;
};

export const retrieveCartDetailsTotalPrice = async (
  cart: cartStateArr,
  signal: AbortSignal
) => {
  const data = await getJSON<number>({
    url: `${API_URL}/cart-details-price`,
    method: "POST",
    body: { cart },
    signal,
  });
  return data;
};
