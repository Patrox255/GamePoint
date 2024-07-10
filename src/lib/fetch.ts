import { QueryClient } from "@tanstack/react-query";
import { IGame } from "../models/game.model";
import { IGenre } from "../models/genre.model";
import { API_URL } from "./config";
import generateUrlEndpointWithSearchParams from "../helpers/generateUrlEndpointWithSearchParams";
import { IOrderCustomizationProperty } from "../store/SearchCustomizationContext";

export const queryClient = new QueryClient();
// queryClient.invalidateQueries({ queryKey: ["games"], exact: false });

export const getJSON = async function <dataInterface>(
  url: string,
  signal?: AbortSignal
) {
  const res = await fetch(url, {
    ...(signal && { signal }),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      `${(data as { message?: string }).message || "Failed to fetch data."}, ${
        res.status
      }`
    );

  return { data } as { data: dataInterface };
};

export interface ILoaderResult<resultInterface> {
  data?: resultInterface[];
  error?: { message: string; status: number };
}

export const load10MostPopularGames = async (signal?: AbortSignal) => {
  const data = await getJSON<IGame[]>(
    `${API_URL}/products?most_popular=1&limit=10`,
    signal
  );
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
  genres?: string[]
) => {
  const data = await getJSON<IGame[]>(
    generateUrlEndpointWithSearchParams(`${API_URL}/products`, {
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
    }),
    signal
  );
  return data;
};

export const retrieveAmountOfGamesByQuery = async (
  query: string,
  signal?: AbortSignal,
  priceMin?: number,
  priceMax?: number,
  discount?: number,
  genres?: string[]
) => {
  const data = await getJSON<number>(
    generateUrlEndpointWithSearchParams(`${API_URL}/products`, {
      count: 1,
      query,
      priceMax,
      priceMin,
      discount,
      genres,
    }),
    signal
  );
  return data;
};

export const loadGenres = async ({
  signal,
  mostPopular,
  query,
  limit,
}: {
  signal?: AbortSignal;
  mostPopular?: number;
  query?: string;
  limit?: number;
}) => {
  const data = await getJSON<IGenre[]>(
    generateUrlEndpointWithSearchParams(`${API_URL}/genres`, {
      mostPopular,
      query,
      limit,
    }),
    signal
  );
  console.log(data);
  return data;
};

export const retrieveMinAndMaxOfExistingPrices = async (
  signal?: AbortSignal
) => {
  const data = await getJSON<{ min: number; max: number }>(
    `${API_URL}/products/price`,
    signal
  );
  return data;
};
