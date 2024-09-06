/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useStateWithSearchParams } from "../../hooks/useStateWithSearchParams";
import Button from "../UI/Button";

export const tabsSectionElementTransitionProperties = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 },
};

type tabsComponentContextSetTabsStateDispatchFn = (newState: string) => void;

export const TabsComponentContext = createContext<{
  tabsState: string;
  debouncingTabsState: string;
  setTabsState: tabsComponentContextSetTabsStateDispatchFn;
  setNormalAndDebouncingTabsState: tabsComponentContextSetTabsStateDispatchFn;
}>({
  tabsState: "",
  debouncingTabsState: "",
  setNormalAndDebouncingTabsState: () => {},
  setTabsState: () => {},
});

export type ITagsObjDefault<tagName> = {
  ComponentToRender: ReactNode;
  tagName: tagName;
  header: string;
};

export type tagsObjs<tagsObj, tagName extends string> = {
  [key in tagName]: tagsObj;
};

export default function TabsComponent<
  tagName extends string,
  tagsObj extends ITagsObjDefault<tagName>
>({
  defaultTabsStateValue,
  generateAvailableTabsFromAllFnStable,
  possibleTabsStable,
  sessionStorageAndSearchParamEntryNameIfYouWantToUseThem,
  storeEvenInitialValueInSessionStorageAndSearchParams,
}: {
  defaultTabsStateValue: tagName;
  possibleTabsStable: tagsObj[];
  generateAvailableTabsFromAllFnStable: (possibleTabs: tagsObj[]) => tagsObj[];
  sessionStorageAndSearchParamEntryNameIfYouWantToUseThem?: string;
  storeEvenInitialValueInSessionStorageAndSearchParams?: boolean;
}) {
  const {
    state: tabsState,
    debouncingState: debouncingTabsState,
    setStateWithSearchParams: setTabsState,
    setNormalAndDebouncingState: setNormalAndDebouncingTabsState,
  } = useStateWithSearchParams(
    defaultTabsStateValue,
    sessionStorageAndSearchParamEntryNameIfYouWantToUseThem || "",
    undefined,
    undefined,
    storeEvenInitialValueInSessionStorageAndSearchParams
  );

  const availableTabs = useMemo(
    () =>
      generateAvailableTabsFromAllFnStable
        ? generateAvailableTabsFromAllFnStable(possibleTabsStable)
        : possibleTabsStable,
    [generateAvailableTabsFromAllFnStable, possibleTabsStable]
  );
  const curActiveTabEntry = availableTabs.find(
    (availableTab) => availableTab.tagName === tabsState
  )!;
  const CurTabComponent = useCallback(
    () => curActiveTabEntry.ComponentToRender,
    [curActiveTabEntry]
  );

  return (
    <>
      <nav className="user-panel-nav flex gap-4">
        {availableTabs.map((availableTab) => {
          const active = availableTab.tagName === tabsState;
          const disabled =
            active || tabsState !== debouncingTabsState ? true : false;
          return (
            <Button
              onClick={
                !disabled ? () => setTabsState(availableTab.tagName) : undefined
              }
              disabled={disabled}
              key={`${availableTab.tagName}${disabled ? "-disabled" : ""}`}
              active={active}
            >
              {availableTab.header}
            </Button>
          );
        })}
      </nav>
      <AnimatePresence mode="wait">
        <motion.article
          {...tabsSectionElementTransitionProperties}
          key={`user-panel-content-${curActiveTabEntry.tagName}`}
          className="py-8 w-full flex justify-center items-center text-center flex-col gap-4"
        >
          <TabsComponentContext.Provider
            value={{
              debouncingTabsState,
              tabsState,
              setTabsState:
                setTabsState as tabsComponentContextSetTabsStateDispatchFn,
              setNormalAndDebouncingTabsState:
                setNormalAndDebouncingTabsState as tabsComponentContextSetTabsStateDispatchFn,
            }}
          >
            <CurTabComponent />
          </TabsComponentContext.Provider>
        </motion.article>
      </AnimatePresence>
    </>
  );
}
