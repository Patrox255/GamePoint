import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

import { IGame } from "../../models/game.model";
import {
  load10GamesByQuery,
  retrieveAmountOfGamesByQuery,
} from "../../lib/fetch";
import { useStateWithSearchParams } from "../../hooks/useStateWithSearchParams";
import { SearchCustomizationContext } from "./SearchCustomizationContext";
import { IOrderCustomizationProperty } from "../../hooks/useHandleElementsOrderCustomizationState";
import { calcMaxPossiblePageNr } from "../../components/UI/PagesElement";
import { MAX_GAMES_PER_PAGE } from "../../lib/config";

export const ProductsContext = createContext<{
  games: IGame[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  pageNr: number | null;
  setPageNr: (value: number) => void;
  totalGamesAmountForQuery: number | null;
}>({
  games: [],
  isLoading: false,
  isError: false,
  error: null,
  pageNr: 0,
  setPageNr: () => {},
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
    ...searchCustomizationContextBody
  } = useContext(SearchCustomizationContext);
  const { debouncedStateArr: debouncedGenres } =
    searchCustomizationContextBody.selectedGenresState!;
  const { debouncedStateArr: debouncedPlatforms } =
    searchCustomizationContextBody.selectedPlatformsState!;
  const { debouncedStateArr: debouncedPublishers } =
    searchCustomizationContextBody.selectedPublishersState!;
  const { debouncedStateArr: debouncedDevelopers } =
    searchCustomizationContextBody.selectedDevelopersState!;

  const { state: pageNr, setStateWithSearchParams: setPageNr } =
    useStateWithSearchParams({
      initialStateStable: 0,
      searchParamName: "page",
      pathName: "/products",
    });

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
  const maxPageNr = countGamesData
    ? calcMaxPossiblePageNr(countGamesData.data, MAX_GAMES_PER_PAGE)
    : undefined;

  if (pageNr && maxPageNr && pageNr !== 0 && pageNr > maxPageNr) {
    hasToChangePage = true;

    setPageNr(maxPageNr);
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
        totalGamesAmountForQuery:
          (countGamesData && countGamesData.data) || null,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}
