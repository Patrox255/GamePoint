import { ReactNode, createContext } from "react";

import { useSlider } from "../../../lib/hooks";

export const SliderContext = createContext<{
  activeElementIndex: number;
  changeActiveElementIndex: (operation: "increment" | "decrement") => void;
}>({
  activeElementIndex: 0,
  changeActiveElementIndex: () => {},
});

export default function DataSlider<ElementInterface>({
  elements,
  children,
}: {
  elements: ElementInterface[];
  children: ReactNode;
}) {
  const { activeElementIndex, changeActiveElementIndex } = useSlider(
    elements,
    100000
  );

  return (
    <div className="data-slider-container flex justify-center items-center text-center w-4/5 gap-2">
      <SliderContext.Provider
        value={{ activeElementIndex, changeActiveElementIndex }}
      >
        {children}
      </SliderContext.Provider>
    </div>
  );
}
