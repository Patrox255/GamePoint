import { useCallback, useEffect, useRef, useState } from "react";

export const useSlider = function <T>(
  elements: T[],
  changeElementInterval: number,
  programaticallyStartTimer: boolean = false,
  additionalActionsAfterChangingElementFn?: (
    newArtworkIndex: number
  ) => void | (() => void)
) {
  const [activeElementIndex, setActiveElementIndex] = useState<number>(0);
  const canCount = useRef<boolean>(programaticallyStartTimer ? false : true);
  console.log(canCount.current);
  const setCanCount = (newCanCount: boolean) =>
    (canCount.current = newCanCount);

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

  const currentInterval = useRef<number>(changeElementInterval);

  useEffect(() => {
    if (elements.length <= 1) return;
    const timer = setInterval(() => {
      console.log(canCount.current, currentInterval.current);
      if (!canCount.current) return;
      currentInterval.current -= 50;
      if (currentInterval.current === 0) {
        changeActiveElementIndex();
        currentInterval.current = changeElementInterval;
      }
    }, 50);
    return () => clearInterval(timer);
  }, [
    changeElementInterval,
    canCount,
    elements.length,
    changeActiveElementIndex,
  ]);

  useEffect(() => {
    currentInterval.current = changeElementInterval;
  }, [activeElementIndex, changeElementInterval]);

  const setActiveElementStableFnIfManualTimer = useCallback(
    (newActiveElementIndex: number) => {
      setCanCount(false);
      setActiveElementIndex(newActiveElementIndex);
      additionalActionsAfterChangingElementFn &&
        additionalActionsAfterChangingElementFn(newActiveElementIndex);
    },
    [additionalActionsAfterChangingElementFn]
  );

  return {
    activeElementIndex,
    setActiveElementIndex: programaticallyStartTimer
      ? setActiveElementStableFnIfManualTimer
      : setActiveElementIndex,
    changeActiveElementIndex,
    setCanCount,
    canCount: canCount.current,
  };
};
