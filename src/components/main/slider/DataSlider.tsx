import { ReactNode, createContext, useRef } from "react";

import { useSlider } from "../../../hooks/useSlider";
import AnimatedAppearance from "../../UI/AnimatedAppearance";
import { isEqual } from "lodash";

export const SliderContext = createContext<{
  activeElementIndex: number;
  changeActiveElementIndex: (operation: "increment" | "decrement") => void;
  setCanCountProductChange: (newCanCountState: boolean) => void;
  CanCountProductChange: boolean;
}>({
  activeElementIndex: -1,
  changeActiveElementIndex: () => {},
  setCanCountProductChange: () => {},
  CanCountProductChange: false,
});

export default function DataSlider<ElementInterface>({
  elements,
  children,
}: {
  elements: ElementInterface[];
  children: ReactNode;
}) {
  const stableElements = useRef<ElementInterface[]>();
  if (!stableElements.current) stableElements.current = elements;
  if (!isEqual(elements, stableElements)) stableElements.current = elements;

  const {
    activeElementIndex,
    changeActiveElementIndex,
    setCanCount: setCanCountProductChange,
    canCount: CanCountProductChange,
  } = useSlider(stableElements.current, 20000, true);

  return (
    <AnimatedAppearance>
      <div className="data-slider-container flex justify-center items-center text-center w-4/5 gap-2">
        <SliderContext.Provider
          value={{
            activeElementIndex,
            changeActiveElementIndex,
            setCanCountProductChange,
            CanCountProductChange,
          }}
        >
          {children}
        </SliderContext.Provider>
      </div>
    </AnimatedAppearance>
  );
}
