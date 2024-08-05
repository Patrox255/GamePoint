import { AnimatePresence, AnimationProps, motion } from "framer-motion";
import { IGame } from "../../../models/game.model";
import { ReactNode, useCallback, useContext, useEffect, useState } from "react";
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
import ImageWithLoading from "../../UI/ImageWithLoading";
import { SliderContext } from "./DataSlider";
import usePages from "../../../hooks/usePages";
import { PagesManagerContext } from "../../../store/products/PagesManagerContext";

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
  sliderImageOverviewFn = (SliderImageOverviewPrepared) => (
    <SliderImageOverviewPrepared />
  ),
}: {
  element: IGame;
  activeElementIndex?: number;
  children?: (element: IGame) => ReactNode;
  showTags?: boolean;
  showSummary?: boolean;
  limitArtworks?: number;
  sliderImageOverviewFn?: (
    SliderImageOverviewPrepared: () => JSX.Element,
    pageNr?: number,
    setPageNr?: (newPageNr: number) => void
  ) => ReactNode;
}) {
  const sliderProductElementsAnimation: AnimationProps = {
    initial: { transform: "scale(0.2)", opacity: 0, height: 0 },
    animate: {
      transform: "scale(1)",
      opacity: 1,
      height: "auto",
    },
    transition: { height: { duration: 0 }, duration: 1 },
  };

  const hasArtworks = element.artworks.length !== 0;

  const [finishedLoadingDescription, setFinishedLoadingDescription] =
    useState<boolean>(false);

  const {
    activeElementIndex,
    setCanCountProductChange,
    CanCountProductChange,
  } = useContext(SliderContext);
  const usesProductChangeContext = activeElementIndex !== -1;
  const setCanCountProductChangeStable = useCallback(
    (newCanCount: boolean) => setCanCountProductChange(newCanCount),
    [setCanCountProductChange]
  );

  useEffect(() => {
    !hasArtworks &&
      usesProductChangeContext &&
      !CanCountProductChange &&
      setCanCountProductChangeStable(true);
  }, [
    hasArtworks,
    setCanCountProductChangeStable,
    usesProductChangeContext,
    CanCountProductChange,
  ]);

  const stableElementArtworks = useCompareComplexForUseMemo(
    element.artworks.slice(0, limitArtworks)
  );

  const { pageNr, setPageNr } = usePages();

  const stableUseSliderActionsAfterChangingElementFn = useCallback(
    (artworkIndex: number) => {
      usesProductChangeContext &&
        hasArtworks &&
        setCanCountProductChangeStable(false);
      Math.trunc(artworkIndex / 5) !== pageNr &&
        setPageNr(Math.trunc(artworkIndex / 5));
    },
    [
      hasArtworks,
      pageNr,
      setCanCountProductChangeStable,
      setPageNr,
      usesProductChangeContext,
    ]
  );

  const {
    activeElementIndex: artworkIndex,
    setActiveElementIndex: setArtworkIndex,
    setCanCount,
  } = useSlider({
    elements: stableElementArtworks,
    changeElementInterval: 4050,
    programaticallyStartTimer: true,
    additionalActionsAfterChangingElementFn:
      stableUseSliderActionsAfterChangingElementFn,
  });

  const SliderImageOverviewPrepared = useCallback(
    () => (
      <SliderImageOverview
        imagesArr={stableElementArtworks}
        key={`slider-image-overview-${element.title}`}
      />
    ),
    [stableElementArtworks, element.title]
  );

  return (
    <figure className="w-full flex gap-3 justify-center items-center py-24">
      <PagesManagerContext.Provider value={{ pageNr, setPageNr }}>
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
                <ImageWithLoading
                  src={element.artworks[artworkIndex]}
                  className="w-[1024px] h-auto max-h-[576px] rounded-xl object-contain overflow-hidden"
                  motionAnimation={sliderProductElementsAnimation}
                  key={`artwork-${artworkIndex}-${element.artworks[artworkIndex]}`}
                  additionalActionOnLoadFn={() => {
                    setCanCount(true);
                    usesProductChangeContext &&
                      setCanCountProductChangeStable(true);
                  }}
                />
              </>
            )}
          </AnimatePresence>
          {hasArtworks && element.artworks.length > 1 && (
            <SliderProductElementArtworkContext.Provider
              value={{ artworkIndex, setArtworkIndex }}
            >
              {sliderImageOverviewFn(SliderImageOverviewPrepared)}
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
      </PagesManagerContext.Provider>
    </figure>
  );
}
