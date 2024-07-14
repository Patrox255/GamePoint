import { createContext, useContext } from "react";

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

export default function SliderProductElement({
  elements,
}: {
  elements: IGame[];
}) {
  const { activeElementIndex, changeActiveElementIndex } =
    useContext(SliderContext);
  const element = elements[activeElementIndex];

  return (
    <>
      <ArrowSVG
        arrowSrc={leftArrow}
        alt="Arrow pointing to the left"
        onClick={() => {
          changeActiveElementIndex("decrement");
        }}
      />
      <section className={`overflow-hidden w-3/5 h-auto`}>
        <SliderProductElementContent
          element={element}
          key={activeElementIndex}
          limitArtworks={5}
        />
      </section>
      <ArrowSVG
        arrowSrc={rightArrow}
        alt="Arrow pointing to the left"
        onClick={() => {
          changeActiveElementIndex("increment");
        }}
        translateXVal="2rem"
      />
    </>
  );
}
