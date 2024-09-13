/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useStateWithSearchParams } from "../../hooks/useStateWithSearchParams";
import Button from "../UI/Button";
import ArrowSVG from "../UI/ArrowSVG";
import leftArrow from "../../assets/left-arrow.svg";
import rightArrow from "../../assets/right-arrow.svg";
import Header from "../UI/headers/Header";

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
  forceDisableNavigation = false,
  useAlternativeLookAsASlider = false,
}: {
  defaultTabsStateValue: tagName;
  possibleTabsStable: tagsObj[];
  generateAvailableTabsFromAllFnStable: (possibleTabs: tagsObj[]) => tagsObj[];
  sessionStorageAndSearchParamEntryNameIfYouWantToUseThem?: string;
  storeEvenInitialValueInSessionStorageAndSearchParams?: boolean;
  forceDisableNavigation?: boolean;
  useAlternativeLookAsASlider?: boolean;
}) {
  const {
    state: tabsState,
    debouncingState: debouncingTabsState,
    setStateWithSearchParams: setTabsState,
    setNormalAndDebouncingState: setNormalAndDebouncingTabsState,
  } = useStateWithSearchParams({
    initialStateStable: defaultTabsStateValue,
    searchParamName:
      sessionStorageAndSearchParamEntryNameIfYouWantToUseThem || "",
    storeEvenInitialValue: storeEvenInitialValueInSessionStorageAndSearchParams,
  });
  const lastKnownValidTabIndex = useRef<number | undefined>();

  const availableTabs = useMemo(
    () =>
      generateAvailableTabsFromAllFnStable
        ? generateAvailableTabsFromAllFnStable(possibleTabsStable)
        : possibleTabsStable,
    [generateAvailableTabsFromAllFnStable, possibleTabsStable]
  );
  const curActiveTabEntry = availableTabs.find(
    (availableTab) => availableTab.tagName === tabsState
  );
  const CurTabComponent = useCallback(
    () => curActiveTabEntry?.ComponentToRender,
    [curActiveTabEntry]
  );
  const curTabIndex = availableTabs.findIndex(
    (availableTab) => availableTab.tagName === tabsState
  );
  useEffect(() => {
    // if (curTabIndex === -1 || lastKnownValidTabIndex.current === curTabIndex)
    //   return;
    // lastKnownValidTabIndex.current = curTabIndex;
    return () => {
      if (tabsState !== debouncingTabsState) return;
      lastKnownValidTabIndex.current = curTabIndex;
      console.log(lastKnownValidTabIndex.current);
    };
  }, [curTabIndex, tabsState, debouncingTabsState]);
  console.log(lastKnownValidTabIndex.current);
  useEffect(() => {
    if (availableTabs.length === 0 || curTabIndex !== -1) return;
    console.log(
      lastKnownValidTabIndex.current ?? 0,
      availableTabs[lastKnownValidTabIndex.current ?? 0]?.tagName
    );
    setTabsState(availableTabs[lastKnownValidTabIndex.current ?? 0].tagName);
  }, [curTabIndex, availableTabs, setTabsState]);
  const handleModifyTabsStateUsingAlternativeLookSliderControls = useCallback(
    (indexAddition: number) => {
      let newTabIndex = curTabIndex + indexAddition;
      if (newTabIndex < 0) newTabIndex = availableTabs.length - 1;
      if (newTabIndex > availableTabs.length - 1) newTabIndex = 0;
      setTabsState(availableTabs[newTabIndex].tagName);
    },
    [availableTabs, curTabIndex, setTabsState]
  );
  const duringNavigationTransition =
    tabsState !== debouncingTabsState || forceDisableNavigation;
  const tabsNavigationContent = !useAlternativeLookAsASlider ? (
    availableTabs.map((availableTab) => {
      const active = availableTab.tagName === tabsState;
      const disabled = active || duringNavigationTransition;
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
    })
  ) : (
    <>
      <ArrowSVG
        arrowSrc={leftArrow}
        alt="Arrow pointing to the left"
        onClick={() =>
          handleModifyTabsStateUsingAlternativeLookSliderControls(-1)
        }
        disabled={duringNavigationTransition}
        customWidthTailwindClass="w-12"
      />
      <motion.div className="tabs-container w-full flex items-center relative overflow-hidden">
        {availableTabs.map((availableTab, availableTabIndex) => (
          <motion.div
            className="w-full flex-shrink-0 absolute top-0 left-0 h-full flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{
              translateX: `${(availableTabIndex - curTabIndex) * 100}%`,
              opacity: 1,
            }}
            key={availableTab.header}
            transition={{ duration: 0.5, opacity: { duration: 2 } }}
          >
            <Header>{availableTab.header}</Header>
          </motion.div>
        ))}
      </motion.div>
      <ArrowSVG
        arrowSrc={rightArrow}
        alt="Arrow pointing to the right"
        onClick={() =>
          handleModifyTabsStateUsingAlternativeLookSliderControls(1)
        }
        disabled={duringNavigationTransition}
        customWidthTailwindClass="w-12"
        translateXVal="2rem"
      />
    </>
  );

  return (
    <>
      {availableTabs.length !== 0 && (
        <nav
          className={`flex gap-4 ${
            useAlternativeLookAsASlider ? "w-1/2" : "w-full"
          } justify-center`}
        >
          {tabsNavigationContent}
        </nav>
      )}
      <AnimatePresence mode="wait">
        <motion.article
          {...tabsSectionElementTransitionProperties}
          key={`user-panel-content-${curActiveTabEntry?.tagName}`}
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
            {curActiveTabEntry ? (
              <CurTabComponent />
            ) : (
              <Header>
                There are no remaining tabs possible to choose from!
              </Header>
            )}
          </TabsComponentContext.Provider>
        </motion.article>
      </AnimatePresence>
    </>
  );
}
