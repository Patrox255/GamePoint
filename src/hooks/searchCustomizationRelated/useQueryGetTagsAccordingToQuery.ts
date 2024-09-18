import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { loadTags } from "../../lib/fetch";
import {
  receivedTagInterface,
  useQueryGetTagsAvailableTagsNames,
} from "./useQueryGetTagsTypes";
import { MAX_DISPLAYED_TAGS } from "../../lib/config";

export const useGetTagsAccordingToQueryGenerateQueryKey = function (
  queryDebouncingState: string,
  gameDocumentTagPropertyName: useQueryGetTagsAvailableTagsNames
) {
  const stableQueryKey = useMemo(
    () => [
      "games",
      gameDocumentTagPropertyName,
      MAX_DISPLAYED_TAGS,
      queryDebouncingState,
    ],
    [gameDocumentTagPropertyName, queryDebouncingState]
  );
  return stableQueryKey;
};

export default function useQueryGetTagsAccordingToQuery(
  queryDebouncingState: string,
  gameDocumentTagPropertyName: useQueryGetTagsAvailableTagsNames,
  customGameDocumentPropertyNameForTag?: string
) {
  const queryKey = useGetTagsAccordingToQueryGenerateQueryKey(
    queryDebouncingState,
    gameDocumentTagPropertyName
  );
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
    queryKey,
  });

  return { data, isLoading, error, isError };
}
