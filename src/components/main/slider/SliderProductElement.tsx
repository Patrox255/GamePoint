import { createContext, ReactNode, useContext } from "react";

import { IGame } from "../../../models/game.model";
import { SliderContext } from "./DataSlider";
import ArrowSVG from "../../UI/ArrowSVG";
import leftArrow from "../../../assets/left-arrow.svg";
import rightArrow from "../../../assets/right-arrow.svg";
import SliderProductElementContent from "./SliderProductElementContent";

export const SliderProductElementArtworkContext = createContext<{
  artworkIndex: number;
  setArtworkIndex: (newArtworkIndex: number) => void;
}>({
  artworkIndex: -1,
  setArtworkIndex: () => {},
});

export default function SliderProductElement<T, Y extends T[]>({
  elements,
  children = (element, key) => (
    <SliderProductElementContent
      element={element as IGame}
      key={key}
      limitArtworks={5}
    />
  ),
  lessInvasiveArrowAnimation = false,
  smallerArrowSVG = false,
}: {
  elements: Y;
  children?: (element: T, key: number) => ReactNode;
  lessInvasiveArrowAnimation?: boolean;
  smallerArrowSVG?: boolean;
}) {
  const { activeElementIndex, changeActiveElementIndex } =
    useContext(SliderContext);
  const element = elements[activeElementIndex];
  const arrowTranslateXVal = lessInvasiveArrowAnimation ? "0.5rem" : "2rem";
  const arrowSVGWidthClass = smallerArrowSVG ? "w-12" : undefined;

  return (
    <>
      <ArrowSVG
        arrowSrc={leftArrow}
        alt="Arrow pointing to the left"
        onClick={() => {
          changeActiveElementIndex("decrement");
        }}
        translateXVal={`-${arrowTranslateXVal}`}
        customWidthTailwindClass={arrowSVGWidthClass}
      />
      <section
        className={`overflow-hidden w-3/5 h-auto flex justify-center items-center`}
      >
        {children(element, activeElementIndex)}
      </section>
      <ArrowSVG
        arrowSrc={rightArrow}
        alt="Arrow pointing to the left"
        onClick={() => {
          changeActiveElementIndex("increment");
        }}
        translateXVal={arrowTranslateXVal}
        customWidthTailwindClass={arrowSVGWidthClass}
      />
    </>
  );
}
