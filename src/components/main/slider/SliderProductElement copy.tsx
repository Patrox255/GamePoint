import { AnimatePresence, AnimationProps, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IGame } from "../../../models/game.model";

export default function SliderProductElement({
  element,
  isActive,
}: {
  element: IGame;
  isActive: boolean;
}) {
  const [artworkIndex, setArtworkIndex] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setArtworkIndex((curArtworkIndex) =>
        curArtworkIndex === element.artworks.length - 1
          ? 0
          : curArtworkIndex + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [element.artworks.length]);

  const sliderProductElementsAnimation: AnimationProps = {
    initial: { transform: "scale(0.5)", opacity: 0 },
    animate: { transform: "scale(1)", opacity: 1 },
    exit: { transform: "scale(0.5)", opacity: 0 },
  };

  return (
    <section
      className={`overflow-hidden ${isActive ? "w-full h-auto" : "w-0 h-0"}`}
      // className="overflow-hidden "
      // initial={{ width: "0", height: "0" }}
      // animate={isActive ? { width: "60%", height: "auto" } : undefined}
    >
      <figure className="w-full flex gap-3 min-h-[720px]">
        <div className="figure-image-container w-3/4 flex justify-center items-center h-min-[720px]">
          {element.artworks.length === 0 ? (
            <motion.p {...sliderProductElementsAnimation} key="img-error">
              No artworks have been found for this game :(.
            </motion.p>
          ) : (
            <motion.img
              src={element.artworks[artworkIndex]}
              className="w-[1280px] rounded-xl"
              {...sliderProductElementsAnimation}
              key={`artwork-${artworkIndex}-${element.artworks[artworkIndex]}`}
            />
          )}
        </div>
        <motion.figcaption
          className="w-1/4 flex justify-center items-center flex-col h-min-[720px]"
          {...sliderProductElementsAnimation}
          key={`figcaption-${element.title}`}
        >
          <h2 className="text-2xl text-highlightRed py-3 underline">
            {element.title}
          </h2>
        </motion.figcaption>
      </figure>
    </section>
  );
}
