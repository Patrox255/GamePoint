import { motion } from "framer-motion";
import { memo, useCallback } from "react";

import SliderProductElementContent from "../main/slider/SliderProductElementContent";
import AnimatedAppearance from "../UI/AnimatedAppearance";
import Button from "../UI/Button";
import PagesElement from "../UI/PagesElement";
import { IGame } from "../../models/game.model";
import Header from "../UI/headers/Header";
import AddReviewContextProvider from "../../store/product/AddReviewContext";
import ReviewContent from "../product/ReviewContent";
import ReviewsWrapper from "../product/ReviewsWrapper";
import ProductAdditionalInformation from "../product/ProductAdditionalInformation";
import { MAX_REVIEWS_PER_PAGE } from "../../helpers/config";
import PagesManagerContextProvider from "../../store/products/PagesManagerContext";

const ExtendedGamePreview = memo(
  ({ game }: { game: IGame & { reviews: number } }) => {
    console.log(game);

    const stableSliderImageOverviewFn = useCallback(
      (SliderImageOverviewPrepared: () => JSX.Element) => (
        <AnimatedAppearance>
          <SliderImageOverviewPrepared />
          <PagesElement
            amountOfElementsPerPage={5}
            totalAmountOfElementsToDisplayOnPages={game.artworks.length}
          />
        </AnimatedAppearance>
      ),
      [game.artworks.length]
    );

    return (
      <>
        <article className="product-overview">
          <SliderProductElementContent
            element={game}
            showTags={false}
            showSummary={false}
            sliderImageOverviewFn={stableSliderImageOverviewFn}
          >
            {(element) => (
              <Button
                onClick={() => {
                  console.log(`${element.title} added to cart!`);
                }}
              >
                Add to cart
              </Button>
            )}
          </SliderProductElementContent>
        </article>
        <motion.article
          className="product-details flex flex-col text-center bg-darkerBg p-8 rounded-xl gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          whileHover={{ opacity: 1 }}
        >
          <AnimatedAppearance>
            <motion.section className="product-details-summary">
              <Header>Summary</Header>
              <p>{game.summary}</p>
            </motion.section>
          </AnimatedAppearance>
          {game.storyLine && (
            <AnimatedAppearance>
              <motion.section className="product-details-storyline">
                <Header>Storyline</Header>
                <p>{game.storyLine}</p>
              </motion.section>
            </AnimatedAppearance>
          )}
          <ProductAdditionalInformation game={game} />

          <section className="product-details-add-review w-full">
            <Header>Add your own review</Header>
            <AddReviewContextProvider>
              <ReviewContent />
            </AddReviewContextProvider>
          </section>
        </motion.article>
        <article className="product-reviews text-center">
          <header className="py-6">
            <Header size="large">Reviews</Header>
          </header>
          <PagesManagerContextProvider>
            <ReviewsWrapper />
            {game.reviews > 0 && (
              <PagesElement
                amountOfElementsPerPage={MAX_REVIEWS_PER_PAGE}
                totalAmountOfElementsToDisplayOnPages={game.reviews}
              />
            )}
          </PagesManagerContextProvider>
        </article>
      </>
    );
  }
);

export default ExtendedGamePreview;
