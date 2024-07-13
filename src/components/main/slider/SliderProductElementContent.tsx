import { AnimatePresence, AnimationProps, motion } from "framer-motion";
import { IGame } from "../../../models/game.model";
import { ReactNode, useCallback, useState } from "react";
import { useSlider } from "../../../hooks/useSlider";
import AnimatedAppearance from "../../UI/AnimatedAppearance";
import TagsComponent from "../../game/tags/TagsComponent";
import PriceTag from "../../game/PriceTag";
import Button from "../../UI/Button";
import { Link } from "react-router-dom";
import { SliderProductElementArtworkContext } from "./SliderProductElement";
import SliderImageOverview from "./SliderImageOverview";
import slugify from "slugify";
import useCompareComplexForUseMemo from "../../../hooks/useCompareComplexForUseMemo";

export default function SliderProductElementContent({
  element,
  children = (element: IGame) => (
    <Button>
      <Link to={`/products/${slugify(element.title, { lower: true })}`}>
        Learn More
      </Link>
    </Button>
  ),
  showTags = true,
  showSummary = true,
  limitArtworks,
  sliderImageOverviewFn = (SliderImageOverviewPrepared, pageNr, setPageNr) => (
    <SliderImageOverviewPrepared pageNr={pageNr} setPageNr={setPageNr} />
  ),
  pageNr,
  setPageNr,
}: {
  element: IGame;
  activeElementIndex?: number;
  children?: (element: IGame) => ReactNode;
  showTags?: boolean;
  showSummary?: boolean;
  limitArtworks?: number;
  sliderImageOverviewFn?: (
    SliderImageOverviewPrepared: ({
      pageNr,
      setPageNr,
    }: {
      pageNr?: number;
      setPageNr?: (newPageNr: number) => void;
    }) => JSX.Element,
    pageNr?: number,
    setPageNr?: (newPageNr: number) => void
  ) => ReactNode;
  pageNr?: number;
  setPageNr?: (newPageNr: number) => void;
}) {
  const sliderProductElementsAnimation: AnimationProps = {
    initial: { transform: "scale(0.2)", opacity: 0 },
    animate: { transform: "scale(1)", opacity: 1 },
    transition: { duration: 1 },
  };

  const hasArtworks = element.artworks.length !== 0;

  const [finishedLoadingDescription, setFinishedLoadingDescription] =
    useState<boolean>(false);

  const {
    activeElementIndex: artworkIndex,
    setActiveElementIndex: setArtworkIndex,
  } = useSlider(element.artworks.slice(0, limitArtworks), 4000);

  const stableElementArtworks = useCompareComplexForUseMemo(element.artworks);

  const SliderImageOverviewPrepared = useCallback(
    ({
      pageNr,
      setPageNr,
    }: {
      pageNr?: number;
      setPageNr?: (newPageNr: number) => void;
    }) => (
      <SliderImageOverview
        imagesArr={stableElementArtworks.slice(0, limitArtworks)}
        key={`slider-image-overview-${element.title}`}
        pageNr={pageNr}
        setPageNr={setPageNr}
      />
    ),
    [stableElementArtworks, element.title, limitArtworks]
  );

  return (
    <figure className="w-full flex gap-3 justify-center items-center py-24">
      <div className="figure-image-container w-3/5 flex justify-center items-center flex-col min-h-[24rem]">
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
            {sliderImageOverviewFn(
              SliderImageOverviewPrepared,
              pageNr,
              setPageNr
            )}
          </SliderProductElementArtworkContext.Provider>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.figcaption
          className={`w-2/5 flex justify-between items-center flex-col gap-6 text-center mb-6 ${
            showSummary && showTags ? "self-stretch" : ""
          }`}
          {...sliderProductElementsAnimation}
          key={`figcaption-${element.title}`}
          onAnimationComplete={() => setFinishedLoadingDescription(true)}
        >
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl text-highlightRed font-bold">
              {element.title}
            </h2>
            {showTags && (
              <AnimatedAppearance>
                <TagsComponent
                  tags={element.genres.map((genre) => genre.name)}
                  paramName="genre"
                />
              </AnimatedAppearance>
            )}
            {showSummary && <p className="text-sm">{element.summary}</p>}
          </div>
          <div className="price-product-page-container w-full flex justify-around">
            <PriceTag
              price={element.price}
              discount={element.discount}
              startAnimation={finishedLoadingDescription}
              finalPrice={element.finalPrice}
            />
            {children(element)}
          </div>
        </motion.figcaption>
      </AnimatePresence>
    </figure>
  );
}
