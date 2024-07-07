import { createContext, ReactNode, useState } from "react";
import { IGame } from "../models/game.model";
import { useQuery } from "@tanstack/react-query";
import { load10GamesByQuery, retrieveAmountOfGamesByQuery } from "../lib/fetch";
import { useAppSelector } from "../hooks/reduxStore";
import { useStateWithSearchParams } from "../hooks/useStateWithSearchParams";
import { useInput } from "../hooks/useInput";
import generateInitialStateFromSearchParams from "../helpers/generateInitialStateFromSearchParams";
import { actions } from "./mainSearchBarSlice";

export const ProductsContext = createContext<{
  games: IGame[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  pageNr: number | null;
  setPageNr: (value: number) => void;
  hasToChangePage: boolean;
  totalGamesAmountForQuery: number | null;
  minPrice: number;
  handleMinChange: (newMinPrice: string) => void;
  maxPrice: number;
  handleMaxChange: (newMaxPrice: string) => void;
  handleSearchTermChange: (newInputValue: string) => void;
}>({
  games: [],
  isLoading: false,
  isError: false,
  error: null,
  pageNr: 0,
  setPageNr: () => {},
  hasToChangePage: false,
  totalGamesAmountForQuery: null,
  minPrice: 0,
  handleMinChange: () => {},
  maxPrice: 0,
  handleMaxChange: () => {},
  handleSearchTermChange: () => {},
});

export default function ProductsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const searchTerm = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );
  const { handleInputChange, queryDebouncingState: searchTermDebouncingState } =
    useInput({
      stateValue: searchTerm,
      setStateAction: actions.setSearchTerm,
      searchParamName: "query",
    });
  const {
    state: pageNr,
    setStateWithSearchParams: setPageNr,
    searchParams,
  } = useStateWithSearchParams(0, "page", "/products");
  const [min, setMin] = useState<number>(
    generateInitialStateFromSearchParams(NaN, searchParams.get("min"))
  );
  const [max, setMax] = useState<number>(
    generateInitialStateFromSearchParams(NaN, searchParams.get("max"))
  );
  const {
    handleInputChange: handleMinChange,
    queryDebouncingState: minQueryDebouncingState,
  } = useInput({
    stateValue: min,
    setStateValue: setMin,
    searchParamName: "min",
    debouncingTime: 600,
  });
  const {
    handleInputChange: handleMaxChange,
    queryDebouncingState: maxQueryDebouncingState,
  } = useInput({
    stateValue: max,
    setStateValue: setMax,
    searchParamName: "max",
  });

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
  const { data, error, isLoading, isError } = useQuery({
    queryFn: ({ signal, queryKey }) => {
      const [, , searchTerm, pageNr, min, max] = queryKey;
      return load10GamesByQuery(
        searchTerm as string,
        signal,
        pageNr! as number,
        min as number,
        max as number
      );
    },
    queryKey: [
      "games",
      "search",
      searchTermDebouncingState,
      pageNr,
      minQueryDebouncingState,
      maxQueryDebouncingState,
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
        minPrice: min,
        maxPrice: max,
        handleMinChange,
        handleMaxChange,
        handleSearchTermChange: handleInputChange,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}
