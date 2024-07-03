import { QueryClient } from "@tanstack/react-query";
import { IGame } from "../models/game.model";
import { IGenre } from "../models/genre.model";
import { API_URL } from "./config";

export const queryClient = new QueryClient();
queryClient.invalidateQueries({ queryKey: ["games"], exact: false });

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

  return { data } as { data: dataInterface[] };
};

export interface ILoaderResult<resultInterface> {
  data?: resultInterface[];
  error?: { message: string; status: number };
}

export const load10MostPopularGames = async (signal?: AbortSignal) => {
  const data = await getJSON<IGame>(`${API_URL}/products`, signal);
  return data;
};

export const load10MostPopularGenres = async (signal?: AbortSignal) => {
  const data = await getJSON<IGenre>(`${API_URL}/popular-genres`, signal);
  console.log(data);
  return data;
};
