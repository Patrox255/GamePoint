/* eslint-disable react-refresh/only-export-components */
import { motion } from "framer-motion";
import { useMemo } from "react";

import triangularArrowSVG from "../../assets/triangular-arrow.svg";
import {
  IOrderCustomizationProperty,
  IOrderCustomizationReducer,
  IOrderCustomizationStateObj,
  IOrderCustomizationStateObjWithDebouncedFields,
} from "../../hooks/useHandleElementsOrderCustomizationState";

type IOrderCustomizationObjToRenderEntryProperty =
  IOrderCustomizationProperty & { nameToDisplay: string };

type IOrderCustomizationEntriesObjToRender<fieldsNames extends string> = Record<
  fieldsNames,
  IOrderCustomizationObjToRenderEntryProperty
>;

export type excludeDebouncedKeys<fieldsNames extends string> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fieldsNames extends `debounced${infer _}` ? never : fieldsNames;

export type onlyDebouncedKeys<fieldsNames extends string> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fieldsNames extends `debounced${infer _}` ? fieldsNames : never;

export type createDebouncedKeys<fieldsNames extends string> =
  `debounced${Capitalize<fieldsNames>}`;

export function createOrderCustomizationObjWithOnlyOrWithoutDebouncedProperties<
  fieldsNames extends string
>(
  orderCustomizationObj: IOrderCustomizationStateObjWithDebouncedFields<fieldsNames>,
  without: true
): IOrderCustomizationStateObj<excludeDebouncedKeys<fieldsNames>>;

export function createOrderCustomizationObjWithOnlyOrWithoutDebouncedProperties<
  fieldsNames extends string
>(
  orderCustomizationObj: IOrderCustomizationStateObjWithDebouncedFields<fieldsNames>,
  without: false
): IOrderCustomizationStateObj<onlyDebouncedKeys<fieldsNames>>;

export function createOrderCustomizationObjWithOnlyOrWithoutDebouncedProperties<
  fieldsNames extends string
>(
  orderCustomizationObj: IOrderCustomizationStateObjWithDebouncedFields<fieldsNames>,
  without: boolean
) {
  const res = Object.fromEntries(
    Object.entries(orderCustomizationObj).filter(
      (orderCustomizationObjEntry) => {
        const isDebouncedEntry =
          orderCustomizationObjEntry[0].startsWith("debounced");
        return without ? !isDebouncedEntry : isDebouncedEntry;
      }
    )
  );
  if (without)
    return res as IOrderCustomizationStateObj<
      excludeDebouncedKeys<fieldsNames>
    >;
  return res as IOrderCustomizationStateObj<onlyDebouncedKeys<fieldsNames>>;
}

const addNameToDisplayToOrderCustomizationObj = <fieldsNames extends string>(
  orderCustomizationObj: IOrderCustomizationStateObjWithDebouncedFields<fieldsNames>,
  appropriateDisplayNamesEntries: Record<
    excludeDebouncedKeys<fieldsNames>,
    string
  >
) =>
  Object.fromEntries(
    (
      Object.entries(
        createOrderCustomizationObjWithOnlyOrWithoutDebouncedProperties(
          orderCustomizationObj,
          true
        )
      ) as [excludeDebouncedKeys<fieldsNames>, IOrderCustomizationProperty][]
    ).map(([fieldName, entryProperties]) => [
      fieldName,
      {
        ...entryProperties,
        nameToDisplay: appropriateDisplayNamesEntries[fieldName],
      },
    ])
  ) as unknown as IOrderCustomizationEntriesObjToRender<
    excludeDebouncedKeys<fieldsNames>
  >;

export default function OrderCustomization<fieldsNames extends string>({
  orderCustomizationObjStable,
  appropriateDisplayNamesEntriesStable,
  orderCustomizationDispatch,
}: {
  orderCustomizationObjStable: IOrderCustomizationStateObjWithDebouncedFields<
    excludeDebouncedKeys<fieldsNames>
  >;
  appropriateDisplayNamesEntriesStable: Record<
    excludeDebouncedKeys<fieldsNames>,
    string
  >;
  orderCustomizationDispatch: React.Dispatch<IOrderCustomizationReducer>;
}) {
  const paragraphClasses =
    "flex items-center justify-center cursor-pointer gap-2";
  const orderCustomizationEntries = useMemo(
    () =>
      Object.entries<IOrderCustomizationObjToRenderEntryProperty>(
        addNameToDisplayToOrderCustomizationObj(
          orderCustomizationObjStable,
          appropriateDisplayNamesEntriesStable
        )
      ),
    [appropriateDisplayNamesEntriesStable, orderCustomizationObjStable]
  );

  return (
    <header className="flex justify-center items-center w-full pb-4 text-lg font-bold">
      {orderCustomizationEntries.map(
        ([entryIdentificator, entryProperties]) => {
          const currentCustomizationStateKey = entryIdentificator;
          return (
            <section
              className="w-full flex justify-center items-center"
              key={entryIdentificator}
            >
              <motion.p
                className={paragraphClasses}
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 1 }}
                onClick={() =>
                  orderCustomizationDispatch({
                    type: "CHANGE_PROPERTY_VALUE",
                    payload: {
                      fieldName: currentCustomizationStateKey,
                      newState:
                        entryProperties.value === ""
                          ? "1"
                          : entryProperties.value === "-1"
                          ? ""
                          : "-1",
                    },
                  })
                }
              >
                {entryProperties.nameToDisplay}
                <motion.img
                  src={triangularArrowSVG}
                  className="w-5"
                  variants={{
                    ascending: {
                      opacity: 1,
                      width: "1.25rem",
                      rotate: 0,
                    },
                    descending: {
                      opacity: 1,
                      width: "1.25rem",
                      rotate: "180deg",
                    },
                    hidden: {
                      opacity: 0,
                      width: 0,
                    },
                  }}
                  initial={
                    entryProperties.value === "-1" ? "ascending" : "hidden"
                  }
                  animate={
                    entryProperties.value === ""
                      ? undefined
                      : entryProperties.value === "1"
                      ? "ascending"
                      : "descending"
                  }
                />
              </motion.p>
            </section>
          );
        }
      )}
    </header>
  );
}
