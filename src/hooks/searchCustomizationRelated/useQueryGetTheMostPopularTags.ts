import { useQuery } from "@tanstack/react-query";

import { loadTags } from "../../lib/fetch";
import {
  receivedTagInterface,
  useQueryGetTagsAvailableTagsNames,
} from "./useQueryGetTagsTypes";

export default function useQueryGetTheMostPopularTags<
  gameDocumentTagPropertyNameType extends useQueryGetTagsAvailableTagsNames
>(
  gameDocumentTagPropertyName: gameDocumentTagPropertyNameType,
  customGameDocumentPropertyNameForTag?: string
) {
  const { isLoading, data, error, isError } = useQuery({
    queryFn: ({ signal, queryKey }) => {
      const [, , limit, mostPopular] = queryKey;
      return loadTags<receivedTagInterface<typeof gameDocumentTagPropertyName>>(
        {
          signal,
          mostPopular: mostPopular as number,
          limit: limit as number,
          gameDocumentTagPropertyName: customGameDocumentPropertyNameForTag
            ? customGameDocumentPropertyNameForTag
            : gameDocumentTagPropertyName,
        }
      );
    },
    queryKey: ["games", gameDocumentTagPropertyName, 10, 1],
    staleTime: 2000,
  });

  return { isLoading, data, error, isError };
}
