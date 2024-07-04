import { AnimatePresence, AnimationProps, motion } from "framer-motion";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { IGame } from "../../../models/game.model";
import { SliderContext } from "./DataSlider";
import SliderImageOverview from "./SliderImageOverview";
import { useSlider } from "../../../hooks/useSlider";
import ArrowSVG from "../../UI/ArrowSVG";
import leftArrow from "../../../assets/left-arrow.svg";
import rightArrow from "../../../assets/right-arrow.svg";
import TagsComponent from "../../game/tags/TagsComponent";
import PriceTag from "../../game/PriceTag";
import Button from "../../UI/Button";
import { Link } from "react-router-dom";
import slugify from "slugify";
import AnimatedAppearance from "../../UI/AnimatedAppearance";

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
  const { activeElementIndex, changeActiveElementIndex } =
    useContext(SliderContext);
  const [finishedLoadingDescription, setFinishedLoadingDescription] =
    useState<boolean>(false);
  const element = elements[activeElementIndex];

  const {
    activeElementIndex: artworkIndex,
    setActiveElementIndex: setArtworkIndex,
  } = useSlider(element.artworks, 4000);

  const sliderProductElementsAnimation: AnimationProps = {
    initial: { transform: "scale(0.2)", opacity: 0 },
    animate: { transform: "scale(1)", opacity: 1 },
    // exit: { transform: "scale(0.2)", opacity: 0 },
    transition: { duration: 1 },
  };

  const hasArtworks = element.artworks.length !== 0;

  useEffect(() => {
    setArtworkIndex(0);
    setFinishedLoadingDescription(false);
  }, [activeElementIndex, setArtworkIndex]);

  return (
    <>
      <ArrowSVG
        arrowSrc={leftArrow}
        alt="Arrow pointing to the left"
        onClick={() => {
          changeActiveElementIndex("decrement");
        }}
      />
      <section
        className={`overflow-hidden w-3/5 h-auto`}
        // className="overflow-hidden "
        // initial={{ width: "0", height: "0" }}
        // animate={isActive ? { width: "60%", height: "auto" } : undefined}
      >
        <figure className="w-full flex gap-3 justify-center items-center min-h-[48rem]">
          <div className="figure-image-container w-3/5 flex justify-center items-center flex-col">
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
              className="w-2/5 flex justify-center items-center flex-col h-full gap-3"
              {...sliderProductElementsAnimation}
              key={`figcaption-${element.title}`}
              onAnimationComplete={() => setFinishedLoadingDescription(true)}
            >
              <h2 className="text-2xl text-highlightRed font-bold">
                {element.title}
              </h2>
              <AnimatedAppearance>
                <TagsComponent
                  tags={element.genres.map((genre) => genre.name)}
                  paramName="genre"
                />
              </AnimatedAppearance>
              <p className="text-sm">{element.summary}</p>
              <div className="price-product-page-container w-full flex justify-around">
                <PriceTag
                  price={element.price}
                  discount={element.discount}
                  startAnimation={finishedLoadingDescription}
                />
                <Button>
                  <Link
                    to={`/products/${slugify(element.title, { lower: true })}`}
                  >
                    Learn More
                  </Link>
                </Button>
              </div>
            </motion.figcaption>
          </AnimatePresence>
        </figure>
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
