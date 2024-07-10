import { useQuery } from "@tanstack/react-query";
import { loadGenres } from "../lib/fetch";

export default function useQueryGetTheMostPopularGenres() {
  const { isLoading, data, error, isError } = useQuery({
    queryFn: ({ signal, queryKey }) => {
      const [, , limit, mostPopular] = queryKey;
      return loadGenres({
        signal,
        mostPopular: mostPopular as number,
        limit: limit as number,
      });
    },
    queryKey: ["games", "genres", 10, 1],
    staleTime: 2000,
  });

  return { isLoading, data, error, isError };
}
