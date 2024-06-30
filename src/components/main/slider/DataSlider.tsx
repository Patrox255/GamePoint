import { ReactNode, createContext } from "react";

import { useSlider } from "../../../lib/hooks";
import leftArrow from "../../../assets/left-arrow.svg";
import rightArrow from "../../../assets/right-arrow.svg";
import ArrowSVG from "../../UI/ArrowSVG";

export const SliderContext = createContext({
  activeElementIndex: 0,
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

  const goToThePreviousElement = () => changeActiveElementIndex("decrement");

  return (
    <div className="data-slider-container flex justify-center items-center text-center w-4/5 gap-2">
      <ArrowSVG
        arrowSrc={leftArrow}
        alt="Arrow pointing to the left"
        onClick={goToThePreviousElement}
      />
      <SliderContext.Provider value={{ activeElementIndex }}>
        {children}
      </SliderContext.Provider>
      <ArrowSVG
        arrowSrc={rightArrow}
        alt="Arrow pointing to the left"
        onClick={changeActiveElementIndex}
        translateXVal="2rem"
      />
    </div>
  );
}
