import { useCallback, useEffect, useState } from "react";

export const useSlider = function <T>(
  elements: T[],
  changeElementInterval: number,
  programaticallyStartTimer: boolean = false,
  additionalActionsAfterChangingElementFn?: (
    newArtworkIndex: number
  ) => void | (() => void)
) {
  const [activeElementIndex, setActiveElementIndex] = useState<number>(0);
  const [canCount, setCanCount] = useState<boolean>(
    programaticallyStartTimer ? false : true
  );

  const changeActiveElementIndex = useCallback(
    (operation: "increment" | "decrement" = "increment") => {
      setActiveElementIndex((curActiveElementIndex) => {
        const newArtworkIndex =
          operation === "increment"
            ? curActiveElementIndex === elements.length - 1
              ? 0
              : curActiveElementIndex + 1
            : curActiveElementIndex === 0
            ? elements.length - 1
            : curActiveElementIndex - 1;
        programaticallyStartTimer && setCanCount(false);
        additionalActionsAfterChangingElementFn &&
          additionalActionsAfterChangingElementFn(newArtworkIndex);
        return newArtworkIndex;
      });
    },
    [
      additionalActionsAfterChangingElementFn,
      elements.length,
      programaticallyStartTimer,
    ]
  );

  const [currentInterval, setCurrentInterval] = useState<number>(
    changeElementInterval
  );

  useEffect(() => {
    if (elements.length <= 1) return;
    const timer = setInterval(() => {
      canCount &&
        setCurrentInterval((oldCurrentInterval) => oldCurrentInterval - 200);
    }, 200);
    return () => clearInterval(timer);
  }, [changeElementInterval, canCount, elements.length]);

  useEffect(() => {
    setCurrentInterval(changeElementInterval);
  }, [activeElementIndex, changeElementInterval]);

  useEffect(() => {
    if (currentInterval === 0) {
      changeActiveElementIndex();
      setCurrentInterval(changeElementInterval);
    }
  }, [changeActiveElementIndex, changeElementInterval, currentInterval]);

  return {
    activeElementIndex,
    setActiveElementIndex: programaticallyStartTimer
      ? (newActiveElementIndex: number) => {
          setCanCount(false);
          setActiveElementIndex(newActiveElementIndex);
          additionalActionsAfterChangingElementFn &&
            additionalActionsAfterChangingElementFn(newActiveElementIndex);
        }
      : setActiveElementIndex,
    changeActiveElementIndex,
    setCanCount,
    canCount,
  };
};
