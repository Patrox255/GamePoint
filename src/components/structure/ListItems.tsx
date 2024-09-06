import { motion } from "framer-motion";
import { AnimationProps } from "framer-motion";
import { ReactNode, useMemo } from "react";
import Error from "../UI/Error";

/* eslint-disable react-refresh/only-export-components */
export const listOfItemsComponentMotionProperties: AnimationProps = {
  initial: {
    opacity: 0,
  },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const listItemMotionProperties = {
  initial: { opacity: 0 },
  animate: { opacity: 0.7 },
  whileHover: { opacity: 1 },
};

type listItemDetailsEntryContentFn<T> = (value: T) => ReactNode;
type IListItemDetailsEntryKeyValueObj<T = unknown> = {
  contentClassName: string;
  contentFn: listItemDetailsEntryContentFn<T>;
};

export type IListItemNormalEntries<listItem extends object> = {
  [itemKey in keyof listItem]?: IListItemDetailsEntryKeyValueObj<
    listItem[itemKey]
  >;
};
export type IListItemEntriesWithAccessToTheListItemItself<
  listItem extends object,
  T extends string
> = {
  [key in T]?: IListItemDetailsEntryKeyValueObj<listItem>;
};

type IListItemsStablePartOfObjArg<T> = {
  listItems: T[];
  listItemKeyGeneratorFn: (item: T) => string;
  overAllListItemsIdentificator: string;
  listItemOnClick?: (item: T) => void;
};

type listItemEntriesBasedOnListItemPropertiesStable<T> = T extends object
  ? IListItemNormalEntries<T>
  : undefined;

type listItemEntriesBasedOnListItemObjItself<
  T,
  Y extends string
> = T extends object
  ? IListItemEntriesWithAccessToTheListItemItself<T, Y>
  : undefined;

export default function ListItems<T extends string, Y extends string = "">({
  listItems,
  listItemKeyGeneratorFn,
  overAllListItemsIdentificator,
  listItemOnClick,
  listItemEntriesBasedOnListItemPropertiesStable,
  listItemEntriesBasedOnListItemObjItselfStable,
}: IListItemsStablePartOfObjArg<T> & {
  listItemEntriesBasedOnListItemPropertiesStable?: undefined;
  listItemEntriesBasedOnListItemObjItselfStable?: listItemEntriesBasedOnListItemObjItself<
    T,
    Y
  >;
}): ReactNode;

export default function ListItems<T extends object, Y extends string = "">({
  listItems,
  listItemKeyGeneratorFn,
  overAllListItemsIdentificator,
  listItemOnClick,
  listItemEntriesBasedOnListItemPropertiesStable,
  listItemEntriesBasedOnListItemObjItselfStable,
}: IListItemsStablePartOfObjArg<T> & {
  listItemEntriesBasedOnListItemPropertiesStable?: listItemEntriesBasedOnListItemPropertiesStable<T>;
  listItemEntriesBasedOnListItemObjItselfStable?: listItemEntriesBasedOnListItemObjItself<
    T,
    Y
  >;
}): ReactNode;

export default function ListItems<T, Y extends string = "">({
  listItems,
  listItemKeyGeneratorFn,
  overAllListItemsIdentificator,
  listItemOnClick,
  listItemEntriesBasedOnListItemPropertiesStable,
  listItemEntriesBasedOnListItemObjItselfStable,
}: IListItemsStablePartOfObjArg<T> & {
  listItemEntriesBasedOnListItemPropertiesStable?: listItemEntriesBasedOnListItemPropertiesStable<T>;
  listItemEntriesBasedOnListItemObjItselfStable?: listItemEntriesBasedOnListItemObjItself<
    T,
    Y
  >;
}) {
  const listItemAllEntriesStable = useMemo(() => {
    return [
      listItemEntriesBasedOnListItemPropertiesStable,
      listItemEntriesBasedOnListItemObjItselfStable,
    ]
      .map((listItemEntriesObj) => {
        if (!listItemEntriesObj) return [];
        const listItemEntriesObjEntries = Object.entries(
          listItemEntriesObj
        ) as unknown as [string, IListItemDetailsEntryKeyValueObj][];
        return listItemEntriesObj ===
          listItemEntriesBasedOnListItemObjItselfStable
          ? listItemEntriesObjEntries.map((listItemEntriesObjEntry) => [
              listItemEntriesObjEntry[0],
              {
                ...listItemEntriesObjEntry[1],
                passTheWholeOrderEntryToTheContentFn: true,
              },
            ])
          : listItemEntriesObjEntries;
      })
      .flat() as unknown as [
      string,
      IListItemDetailsEntryKeyValueObj & {
        passTheWholeOrderEntryToTheContentFn?: boolean;
      }
    ][];
  }, [
    listItemEntriesBasedOnListItemPropertiesStable,
    listItemEntriesBasedOnListItemObjItselfStable,
  ]);

  return (
    <motion.ul
      className="user-orders-list flex w-full flex-col justify-center items-center gap-4"
      {...listOfItemsComponentMotionProperties}
    >
      {listItems.map((listItem) => {
        const listItemKey = listItemKeyGeneratorFn(listItem);

        return (
          <motion.li
            className="w-full justify-center items-center flex flex-wrap bg-bodyBg px-4 py-8 rounded-xl gap-2 text-xs sm:text-base cursor-pointer"
            {...listItemMotionProperties}
            key={listItemKey}
            onClick={
              listItemOnClick ? () => listItemOnClick(listItem) : undefined
            }
          >
            {listItemAllEntriesStable.map((listItemEntry) => {
              const listItemDesiredValueKey = listItemEntry[0];
              const couldNotGenerateContentForEntry =
                !listItemEntry[1].passTheWholeOrderEntryToTheContentFn &&
                !(listItemDesiredValueKey in (listItem as object));
              const providedListItemInCaseOfUsingEntriesWithAccessToTheListItemProperties =
                listItem as object;
              return (
                <section
                  className={`${overAllListItemsIdentificator}-${listItemEntry[1].contentClassName} flex items-center justify-center text-wrap flex-wrap max-w-full`}
                  key={`${listItemKey}-${listItemEntry[1].contentClassName}`}
                >
                  {couldNotGenerateContentForEntry ? (
                    <Error
                      message={`Could not generate list item entry for entry declared as: ${listItemDesiredValueKey}`}
                    />
                  ) : (
                    listItemEntry[1].contentFn(
                      !listItemEntry[1].passTheWholeOrderEntryToTheContentFn
                        ? providedListItemInCaseOfUsingEntriesWithAccessToTheListItemProperties[
                            listItemDesiredValueKey as keyof typeof providedListItemInCaseOfUsingEntriesWithAccessToTheListItemProperties
                          ]
                        : listItem
                    )
                  )}
                </section>
              );
            })}
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
