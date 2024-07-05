import { createContext, ReactNode } from "react";
import { IGame } from "../models/game.model";
import { useQuery } from "@tanstack/react-query";
import { load10GamesByQuery, retrieveAmountOfGamesByQuery } from "../lib/fetch";
import { useAppSelector } from "../hooks/reduxStore";
import { useStateWithSearchParams } from "../hooks/useStateWithSearchParams";

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
  const searchTerm = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );
  const { state: pageNr, setStateWithSearchParams: setPageNr } =
    useStateWithSearchParams(0, "page", "/products");

  const {
    data: countGamesData,
    error: countGamesError,
    isError: countGamesIsError,
    isLoading: countGamesIsLoading,
  } = useQuery({
    queryFn: ({ signal }) => retrieveAmountOfGamesByQuery(searchTerm, signal),
    queryKey: ["games", "search", "count", searchTerm],
    enabled: pageNr !== null,
  });

  let hasToChangePage = false;

  if (
    pageNr &&
    countGamesData &&
    pageNr !== 0 &&
    pageNr * 10 > countGamesData.data[0]
  ) {
    hasToChangePage = true;

    setPageNr(0);
  }
  const { data, error, isLoading, isError } = useQuery({
    queryFn: ({ signal }) => load10GamesByQuery(searchTerm, signal, pageNr!),
    queryKey: ["games", "search", searchTerm, pageNr],
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
          (countGamesData && countGamesData.data[0]) || null,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}
