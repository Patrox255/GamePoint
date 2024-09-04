import { useMemo } from "react";
import {
  IListItemEntriesWithAccessToTheListItemItself,
  IListItemNormalEntries,
} from "../components/structure/ListItems";

export default function useCreateAppropriateListItemEntriesConditionally<
  T extends object,
  Y extends
    | IListItemNormalEntries<T>
    | IListItemEntriesWithAccessToTheListItemItself<T, Z>,
  Z extends string = ""
>(listItemEntriesStableArr: (Y | undefined)[]) {
  return useMemo(
    () =>
      listItemEntriesStableArr.reduce(
        (mergedObj, curEntriesObj) => ({
          ...mergedObj,
          ...(curEntriesObj && curEntriesObj),
        }),
        {}
      ),
    [listItemEntriesStableArr]
  ) as Y;
}
