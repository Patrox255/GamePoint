import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

import { IGame } from "../models/game.model";
import { load10GamesByQuery, retrieveAmountOfGamesByQuery } from "../lib/fetch";
import { useStateWithSearchParams } from "../hooks/useStateWithSearchParams";
import {
  IOrderCustomizationProperty,
  SearchCustomizationContext,
} from "./SearchCustomizationContext";

export const ProductsContext = createContext<{
  games: IGame[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  pageNr: number | null;
  setPageNr: (value: number) => void;
  hasToChangePage: boolean;
  totalGamesAmountForQuery: number | null;
}>({
  games: [],
  isLoading: false,
  isError: false,
  error: null,
  pageNr: 0,
  setPageNr: () => {},
  hasToChangePage: false,
  totalGamesAmountForQuery: null,
});

export default function ProductsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    minQueryDebouncingState,
    maxQueryDebouncingState,
    searchTermDebouncingState,
    orderCustomizationState,
  } = useContext(SearchCustomizationContext);
  const { state: pageNr, setStateWithSearchParams: setPageNr } =
    useStateWithSearchParams(0, "page", "/products");

  const {
    data: countGamesData,
    error: countGamesError,
    isError: countGamesIsError,
    isLoading: countGamesIsLoading,
  } = useQuery({
    queryFn: ({ signal, queryKey }) => {
      const [, , , searchTerm, min, max] = queryKey;
      return retrieveAmountOfGamesByQuery(
        searchTerm as string,
        signal,
        min as number,
        max as number
      );
    },
    queryKey: [
      "games",
      "search",
      "count",
      searchTermDebouncingState,
      minQueryDebouncingState,
      maxQueryDebouncingState,
    ],
    enabled: pageNr !== null,
  });

  let hasToChangePage = false;

  if (
    pageNr &&
    countGamesData &&
    pageNr !== 0 &&
    pageNr * 10 > countGamesData.data
  ) {
    hasToChangePage = true;

    setPageNr(0);
  }

  const { debouncedPopularity, debouncedPrice, debouncedTitle } =
    orderCustomizationState;

  const { data, error, isLoading, isError } = useQuery({
    queryFn: ({ signal, queryKey }) => {
      const [
        ,
        ,
        searchTerm,
        pageNr,
        min,
        max,
        debouncedPopularity,
        debouncedPrice,
        debouncedTitle,
      ] = queryKey;
      return load10GamesByQuery(
        searchTerm as string,
        signal,
        pageNr! as number,
        min as number,
        max as number,
        debouncedPopularity as IOrderCustomizationProperty,
        debouncedPrice as IOrderCustomizationProperty,
        debouncedTitle as IOrderCustomizationProperty
      );
    },
    queryKey: [
      "games",
      "search",
      searchTermDebouncingState,
      pageNr,
      minQueryDebouncingState,
      maxQueryDebouncingState,
      debouncedPopularity,
      debouncedPrice,
      debouncedTitle,
    ],
    enabled:
      !countGamesIsLoading &&
      !countGamesIsError &&
      !hasToChangePage &&
      pageNr !== null,
  });

  return (
    <ProductsContext.Provider
      value={{
        games: (data && data!.data) || [],
        error: countGamesError || error,
        isLoading: countGamesIsLoading || isLoading,
        isError: countGamesIsError || isError,
        pageNr,
        setPageNr,
        hasToChangePage,
        totalGamesAmountForQuery:
          (countGamesData && countGamesData.data) || null,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}
