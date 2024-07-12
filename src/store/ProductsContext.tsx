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
    debouncedDiscountActive,
    selectedGenresState: { debouncedStateArr: debouncedGenres },
    selectedPlatformsState: { debouncedStateArr: debouncedPlatforms },
    selectedPublishersState: { debouncedStateArr: debouncedPublishers },
    selectedDevelopersState: { debouncedStateArr: debouncedDevelopers },
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
      const [
        ,
        ,
        ,
        searchTerm,
        min,
        max,
        discount,
        genres,
        platforms,
        developers,
        publishers,
      ] = queryKey;
      return retrieveAmountOfGamesByQuery(
        searchTerm as string,
        signal,
        min as number,
        max as number,
        discount as number,
        genres as string[],
        platforms as string[],
        developers as string[],
        publishers as string[]
      );
    },
    queryKey: [
      "games",
      "search",
      "count",
      searchTermDebouncingState,
      minQueryDebouncingState,
      maxQueryDebouncingState,
      debouncedDiscountActive,
      debouncedGenres,
      debouncedPlatforms,
      debouncedDevelopers,
      debouncedPublishers,
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
        discount,
        genres,
        platforms,
        developers,
        publishers,
      ] = queryKey;
      return load10GamesByQuery(
        searchTerm as string,
        signal,
        pageNr! as number,
        min as number,
        max as number,
        debouncedPopularity as IOrderCustomizationProperty,
        debouncedPrice as IOrderCustomizationProperty,
        debouncedTitle as IOrderCustomizationProperty,
        discount as number,
        genres as string[],
        platforms as string[],
        developers as string[],
        publishers as string[]
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
      debouncedDiscountActive,
      debouncedGenres,
      debouncedPlatforms,
      debouncedDevelopers,
      debouncedPublishers,
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
