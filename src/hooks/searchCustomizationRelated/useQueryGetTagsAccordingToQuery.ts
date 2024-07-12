import { useQuery } from "@tanstack/react-query";
import { loadTags } from "../../lib/fetch";
import {
  receivedTagInterface,
  useQueryGetTagsAvailableTagsNames,
} from "./useQueryGetTagsTypes";

export default function useQueryGetTagsAccordingToQuery<
  gameDocumentTagPropertyNameType extends useQueryGetTagsAvailableTagsNames
>(
  queryDebouncingState: string,
  gameDocumentTagPropertyName: gameDocumentTagPropertyNameType,
  customGameDocumentPropertyNameForTag?: string
) {
  const { data, isLoading, error, isError } = useQuery({
    queryFn: ({ signal, queryKey }) => {
      const [, , limit, query] = queryKey;
      return loadTags<receivedTagInterface<typeof gameDocumentTagPropertyName>>(
        {
          signal,
          limit: limit as number,
          query: query as string,
          gameDocumentTagPropertyName: customGameDocumentPropertyNameForTag
            ? customGameDocumentPropertyNameForTag
            : gameDocumentTagPropertyName,
        }
      );
    },
    queryKey: ["games", gameDocumentTagPropertyName, 10, queryDebouncingState],
  });

  return { data, isLoading, error, isError };
}
