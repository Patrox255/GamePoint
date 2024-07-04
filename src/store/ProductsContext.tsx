import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { IGame } from "../models/game.model";
import { useQuery } from "@tanstack/react-query";
import { load10GamesByQuery } from "../lib/fetch";
import { useAppSelector } from "../hooks/reduxStore";

export const ProductsContext = createContext<{
  games: IGame[];
  // searchTerm: string;
  // setSearchTerm: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}>({
  games: [],
  // searchTerm: "",
  // setSearchTerm: () => {},
  isLoading: false,
  isError: false,
  error: null,
});

export default function ProductsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const searchTerm = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );
  // const [searchTerm, setSearchTerm] = useState<string>(
  //   searchParams.get("query") || ""
  // );

  const { data, error, isLoading, isError } = useQuery({
    queryFn: ({ signal }) => load10GamesByQuery(searchTerm, signal),
    queryKey: ["games", "search", searchTerm],
    enabled: searchTerm !== "",
  });

  return (
    <ProductsContext.Provider
      value={{
        games: (data && data!.data) || [],
        // searchTerm,
        // setSearchTerm,
        error,
        isLoading,
        isError,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}
