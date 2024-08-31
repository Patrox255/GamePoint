/* eslint-disable react-refresh/only-export-components */
import { ReactNode, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useStateWithSearchParams } from "../../hooks/useStateWithSearchParams";
import Button from "../UI/Button";

export const tabsSectionElementTransitionProperties = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 },
};

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
}: {
  defaultTabsStateValue: tagName;
  possibleTabsStable: tagsObj[];
  generateAvailableTabsFromAllFnStable: (possibleTabs: tagsObj[]) => tagsObj[];
  sessionStorageAndSearchParamEntryNameIfYouWantToUseThem?: string;
}) {
  const {
    state: tabsState,
    debouncingState: debouncingTabsState,
    setStateWithSearchParams: setTabsState,
  } = useStateWithSearchParams(
    defaultTabsStateValue,
    sessionStorageAndSearchParamEntryNameIfYouWantToUseThem || ""
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
          <CurTabComponent />
        </motion.article>
      </AnimatePresence>
    </>
  );
}
