import { useCallback, useEffect, useMemo, useState } from "react";
import windowMatchMediaQueries, {
  windowMatchMediaQueriesKeys,
} from "../../helpers/windowMatchMediaQueries";
import useCompareComplexForUseMemo from "../useCompareComplexForUseMemo";
import { debounce } from "lodash";

export const useWindowMatchMediaQueries = (
  mediaQueryId: windowMatchMediaQueriesKeys
) => {
  const [visible, setVisible] = useState<boolean>(false);
  const mediaQuery = windowMatchMediaQueries[mediaQueryId];

  const handleResize = useCallback((matches: boolean) => {
    setVisible(matches);
  }, []);
  const handleResizeEvent = useMemo(
    () =>
      debounce((e: MediaQueryListEvent) => {
        setVisible(e.matches);
      }),
    []
  );
  useEffect(() => {
    mediaQuery.addEventListener("change", handleResizeEvent);

    handleResize(mediaQuery.matches);
    return () => {
      mediaQuery.removeEventListener("change", handleResizeEvent);
    };
  }, [mediaQuery, handleResize, handleResizeEvent]);

  return visible;
};

export type windowMatchMultipleMediaQueriesResObj = {
  [key in windowMatchMediaQueriesKeys]?: boolean;
};
type mediaQueriesEventListener = (e: MediaQueryListEvent) => void;
type mediaQueryIdToMediaQuery = Record<
  windowMatchMediaQueriesKeys,
  MediaQueryList
>;
export const useWindowMatchMultipleMediaQueries = (
  mediaQueriesIds: windowMatchMediaQueriesKeys[]
) => {
  const mediaQueriesIdsStable = useCompareComplexForUseMemo(mediaQueriesIds);
  const mediaQueryIdToMediaQuery = useMemo(
    () =>
      Object.fromEntries(
        mediaQueriesIdsStable.map((id) => [id, windowMatchMediaQueries[id]])
      ) as mediaQueryIdToMediaQuery,
    [mediaQueriesIdsStable]
  );

  const [visible, setVisible] = useState<windowMatchMultipleMediaQueriesResObj>(
    Object.fromEntries(
      Object.entries(mediaQueryIdToMediaQuery).map(
        ([mediaQueryKey, mediaQuery]) => [mediaQueryKey, mediaQuery.matches]
      )
    )
  );

  const handleResizeEvent = useMemo(
    () =>
      debounce((e: MediaQueryListEvent, id: windowMatchMediaQueriesKeys) => {
        setVisible((prev) => {
          const newMatches = { ...prev };
          newMatches[id] = e.matches;
          return newMatches;
        });
      }, 200),
    []
  );

  useEffect(() => {
    const mediaQueriesEventListeners: {
      [key in windowMatchMediaQueriesKeys]?: mediaQueriesEventListener;
    } = {};
    Object.entries(mediaQueryIdToMediaQuery).forEach(
      ([mediaQueryKey, mediaQuery], index) => {
        const mediaQueryEventListener = (e: MediaQueryListEvent) => {
          handleResizeEvent(e, mediaQueriesIdsStable[index]);
        };
        mediaQuery.addEventListener("change", mediaQueryEventListener);
        mediaQueriesEventListeners[
          mediaQueryKey as windowMatchMediaQueriesKeys
        ] = mediaQueryEventListener;
      }
    );

    return () => {
      Object.entries(mediaQueriesEventListeners).forEach(
        ([mediaQueryKey, mediaQueryEventListener]) => {
          mediaQueryIdToMediaQuery[
            mediaQueryKey as windowMatchMediaQueriesKeys
          ].removeEventListener("change", mediaQueryEventListener);
        }
      );
    };
  }, [mediaQueryIdToMediaQuery, handleResizeEvent, mediaQueriesIdsStable]);

  return visible;
};
