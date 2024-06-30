import { AnimatePresence, AnimationProps, motion } from "framer-motion";
import { Dispatch, SetStateAction, createContext, useContext } from "react";
import { IGame } from "../../../models/game.model";
import { SliderContext } from "./DataSlider";
import SliderImageOverview from "./SliderImageOverview";
import { useSlider } from "../../../lib/hooks";

export const SliderProductElementArtworkContext = createContext<{
  artworkIndex: number;
  setArtworkIndex: Dispatch<SetStateAction<number>>;
}>({
  artworkIndex: 0,
  setArtworkIndex: () => {},
});

export default function SliderProductElement({
  elements,
}: {
  elements: IGame[];
}) {
  const { activeElementIndex } = useContext(SliderContext);
  const element = elements[activeElementIndex];

  const {
    activeElementIndex: artworkIndex,
    setActiveElementIndex: setArtworkIndex,
  } = useSlider(element.artworks, 4000);

  const sliderProductElementsAnimation: AnimationProps = {
    initial: { transform: "scale(0.2)", opacity: 0 },
    animate: { transform: "scale(1)", opacity: 1 },
    exit: { transform: "scale(0.2)", opacity: 0 },
    transition: { duration: 1 },
  };

  const hasArtworks = element.artworks.length !== 0;

  return (
    <section
      className={`overflow-hidden w-3/5 h-auto`}
      // className="overflow-hidden "
      // initial={{ width: "0", height: "0" }}
      // animate={isActive ? { width: "60%", height: "auto" } : undefined}
    >
      <figure className="w-full flex gap-3 justify-center items-center">
        <div className="figure-image-container w-3/4 flex justify-center items-center flex-col min-h-[720px]">
          <AnimatePresence mode="wait">
            {!hasArtworks ? (
              <motion.p
                {...sliderProductElementsAnimation}
                key={`img-error-${element.title}`}
              >
                No artworks have been found for this game :(.
              </motion.p>
            ) : (
              <>
                <motion.img
                  src={element.artworks[artworkIndex]}
                  className="w-[1280px] rounded-xl"
                  {...sliderProductElementsAnimation}
                  key={`artwork-${artworkIndex}-${element.artworks[artworkIndex]}`}
                />
              </>
            )}
          </AnimatePresence>
          {hasArtworks && element.artworks.length > 1 && (
            <SliderProductElementArtworkContext.Provider
              value={{ artworkIndex, setArtworkIndex }}
            >
              <SliderImageOverview
                imagesArr={element.artworks}
                key={`slider-image-overview-${element.title}`}
              />
            </SliderProductElementArtworkContext.Provider>
          )}
        </div>
        <AnimatePresence mode="wait">
          <motion.figcaption
            className="w-1/4 flex justify-center items-center flex-col h-min-[720px]"
            {...sliderProductElementsAnimation}
            key={`figcaption-${element.title}`}
          >
            <h2 className="text-2xl text-highlightRed py-3 font-bold">
              {element.title}
            </h2>
          </motion.figcaption>
        </AnimatePresence>
      </figure>
    </section>
  );
}
