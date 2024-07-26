import { useCallback, useEffect, useRef, useState } from "react";

const getNewElementIndex = (
  curActiveElementIndex: number,
  elementsLength: number,
  operation: availableIndexManipulationOperations = "increment"
) =>
  operation === "increment"
    ? curActiveElementIndex === elementsLength - 1
      ? 0
      : curActiveElementIndex + 1
    : curActiveElementIndex === 0
    ? elementsLength - 1
    : curActiveElementIndex - 1;

type availableIndexManipulationOperations = "increment" | "decrement";

export type additionalActionsAfterChangingElementFnForUseSlider = (
  newArtworkIndex: number
) => void | (() => void);

export type newStateIndexOrFnRelyingOnCurState =
  | number
  | ((curStateIndex: number) => number);

export type manageExternalStateInsteadOfTheOneInUseSliderFn = (
  newStateIndexOrFnRelyingOnCurState: newStateIndexOrFnRelyingOnCurState
) => void;

export const useSlider = function <T, Y>({
  elements,
  changeElementInterval,
  programaticallyStartTimer = false,
  additionalActionsAfterChangingElementFn,
  manageExternalStateInsteadOfTheOneHereFn,
  externalState,
  findCurrentElementsIndexBasedOnCurrentExternalState = (externalState: Y) =>
    (element: T) =>
      element === (externalState as unknown as T),
}: {
  elements: T[];
  changeElementInterval: number;
  programaticallyStartTimer: boolean;
  additionalActionsAfterChangingElementFn?: additionalActionsAfterChangingElementFnForUseSlider;
  manageExternalStateInsteadOfTheOneHereFn?: manageExternalStateInsteadOfTheOneInUseSliderFn;
  externalState?: Y;
  findCurrentElementsIndexBasedOnCurrentExternalState?: (
    externalState: Y
  ) => (element: T, index?: number) => boolean;
}) {
  const [activeElementIndexState, setActiveElementIndexState] =
    useState<number>(0);
  const canCount = useRef<boolean>(programaticallyStartTimer ? false : true);
  const setCanCount = (newCanCount: boolean) =>
    (canCount.current = newCanCount);

  const setActiveElementIndex = manageExternalStateInsteadOfTheOneHereFn
    ? manageExternalStateInsteadOfTheOneHereFn
    : setActiveElementIndexState;
  const activeElementIndex =
    externalState && findCurrentElementsIndexBasedOnCurrentExternalState
      ? elements.findIndex(
          findCurrentElementsIndexBasedOnCurrentExternalState(externalState)
        )
      : activeElementIndexState;

  const changeActiveElementIndex = useCallback(
    (operation: "increment" | "decrement" = "increment") => {
      console.log(setActiveElementIndex);
      setActiveElementIndex((curActiveElementIndex) => {
        console.log(curActiveElementIndex);
        const newArtworkIndex = getNewElementIndex(
          curActiveElementIndex,
          elements.length,
          operation
        );
        programaticallyStartTimer && setCanCount(false);
        return newArtworkIndex;
      });
    },
    [elements.length, programaticallyStartTimer, setActiveElementIndex]
  );

  useEffect(() => {
    additionalActionsAfterChangingElementFn &&
      additionalActionsAfterChangingElementFn(activeElementIndex);
  }, [activeElementIndex, additionalActionsAfterChangingElementFn]);

  const currentInterval = useRef<number>(changeElementInterval);

  useEffect(() => {
    if (elements.length <= 1) return;
    if (manageExternalStateInsteadOfTheOneHereFn) return;
    const timer = setInterval(() => {
      console.log(
        canCount.current
        // currentInterval.current
      );
      if (!canCount.current) return;
      currentInterval.current -= 50;
      if (currentInterval.current === 0) {
        changeActiveElementIndex();
        currentInterval.current = changeElementInterval;
      }
    }, 50);
    return () => (timer ? clearInterval(timer) : undefined);
  }, [
    changeElementInterval,
    canCount,
    elements.length,
    changeActiveElementIndex,
    manageExternalStateInsteadOfTheOneHereFn,
  ]);

  useEffect(() => {
    currentInterval.current = changeElementInterval;
  }, [activeElementIndex, changeElementInterval]);

  const setActiveElementStableFnIfManualTimer = useCallback(
    (newActiveElementIndex: number) => {
      setCanCount(false);
      setActiveElementIndex(newActiveElementIndex);
    },
    [setActiveElementIndex]
  );

  return {
    activeElementIndex: activeElementIndex,
    setActiveElementIndex: programaticallyStartTimer
      ? setActiveElementStableFnIfManualTimer
      : setActiveElementIndex,
    changeActiveElementIndex,
    setCanCount,
    canCount: canCount.current,
  };
};
