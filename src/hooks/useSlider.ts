import { useEffect, useState } from "react";

export const useSlider = function <T>(
  elements: T[],
  changeElementInterval: number,
  shouldActiveElementChangeResetTimer = true
) {
  const [activeElementIndex, setActiveElementIndex] = useState<number>(0);

  const changeActiveElementIndex = (
    operation: "increment" | "decrement" = "increment"
  ) => {
    setActiveElementIndex((curActiveElementIndex) =>
      operation === "increment"
        ? curActiveElementIndex === elements.length - 1
          ? 0
          : curActiveElementIndex + 1
        : curActiveElementIndex === 0
        ? elements.length - 1
        : curActiveElementIndex - 1
    );
  };

  useEffect(
    () => {
      const timer = setTimeout(
        () => changeActiveElementIndex(),
        changeElementInterval
      );

      return () => clearTimeout(timer);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    shouldActiveElementChangeResetTimer
      ? [elements.length, changeElementInterval, activeElementIndex]
      : [elements.length, changeElementInterval]
  );

  return {
    activeElementIndex,
    setActiveElementIndex,
    changeActiveElementIndex,
  };
};
