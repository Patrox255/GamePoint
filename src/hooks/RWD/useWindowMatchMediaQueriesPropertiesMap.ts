import { useMemo } from "react";
import windowMatchMediaQueries, {
  windowMatchMediaQueriesKeys,
} from "../../helpers/windowMatchMediaQueries";
import useCompareComplexForUseMemo from "../useCompareComplexForUseMemo";
import { useWindowMatchMultipleMediaQueries } from "./useWindowMatchMediaQueries";

export type cssPropertyMediaQueryKeyToCSSPropertyValueMap = {
  [key in windowMatchMediaQueriesKeys | "default"]?: string;
};
export type windowMatchMediaQueriesCSSPropertiesMap<properties extends string> =
  {
    [key in properties]?: cssPropertyMediaQueryKeyToCSSPropertyValueMap;
  };
export function useWindowMatchMediaQueriesCSSPropertiesMap<
  T extends windowMatchMediaQueriesCSSPropertiesMap<Y>,
  Y extends string
>(propertiesMap: T): { [key in keyof T]: string } {
  const propertiesMapStable = useCompareComplexForUseMemo(propertiesMap);
  const allUsedMediaQueriesKeysStable = useMemo(
    () => [
      ...new Set(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(propertiesMapStable).flatMap(([_, cssPropertyObj]) =>
          Object.keys(
            cssPropertyObj as cssPropertyMediaQueryKeyToCSSPropertyValueMap
          ).filter((key) => key !== "default")
        )
      ),
    ],
    [propertiesMapStable]
  ) as windowMatchMediaQueriesKeys[];
  const mediaQueriesMatches = useWindowMatchMultipleMediaQueries(
    allUsedMediaQueriesKeysStable
  );
  const mediaQueriesMatchesStable =
    useCompareComplexForUseMemo(mediaQueriesMatches);
  const propertiesToValuesMap = useMemo(
    () =>
      Object.fromEntries(
        Object.entries<cssPropertyMediaQueryKeyToCSSPropertyValueMap>(
          propertiesMapStable as Record<
            string,
            cssPropertyMediaQueryKeyToCSSPropertyValueMap
          >
        ).map(([cssPropertyName, cssPropertyObj]) => {
          // First I check all of the media queries that are matched at the moment and are defined in one's media queries to css
          // values map
          const matchedMediaQueries = Object.entries(
            mediaQueriesMatchesStable
          ).filter(
            (mediaQueryMatchesObjEntry) =>
              mediaQueryMatchesObjEntry[1] &&
              Object.entries(cssPropertyObj).some(
                ([cssPropertyObjEntryMediaQueryKey]) =>
                  cssPropertyObjEntryMediaQueryKey ===
                  mediaQueryMatchesObjEntry[0]
              )
          );
          matchedMediaQueries.sort((a, b) => {
            const findIndexOfEntry = (entry: [string, boolean]) =>
              Object.entries(windowMatchMediaQueries).findIndex(
                (windowMatchMediaQueriesEntry) =>
                  windowMatchMediaQueriesEntry[0] === entry[0]
              );
            const indexA = findIndexOfEntry(a);
            const indexB = findIndexOfEntry(b);

            // Here I want to have the most important media query at the front - sort by size descending
            return indexB - indexA;
          });
          const matchedMediaQueriesKeys = matchedMediaQueries.map(
            (matchedMediaQueriesEntry) => matchedMediaQueriesEntry[0]
          );

          return [
            cssPropertyName,
            cssPropertyObj[
              matchedMediaQueriesKeys.length != 0
                ? (matchedMediaQueriesKeys[0] as windowMatchMediaQueriesKeys)
                : "default"
            ],
          ];
        })
      ),
    [mediaQueriesMatchesStable, propertiesMapStable]
  );

  return propertiesToValuesMap as { [key in keyof T]: string };
}
