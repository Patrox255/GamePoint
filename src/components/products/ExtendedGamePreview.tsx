import { AnimatePresence, motion } from "framer-motion";
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
import { useAppDispatch, useAppSelector } from "../../hooks/reduxStore";
import { modifyCartQuantityAction } from "../../store/customActions";

export type IExtendedGamePreviewGameArg = IGame & {
  reviews: number;
  userReview: boolean;
};

const ExtendedGamePreview = memo(
  ({ game }: { game: IExtendedGamePreviewGameArg }) => {
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

    const dispatch = useAppDispatch();
    const login = useAppSelector((state) => state.userAuthSlice.login);
    const cart = useAppSelector((state) => state.cartSlice.cart);
    const isInCartAndFreeToPlay =
      game.finalPrice === 0 &&
      cart &&
      cart.some((cartEntry) => cartEntry.id === game._id)
        ? true
        : false;
    return (
      <>
        <motion.article
          className="product-overview"
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 0.7 },
            hover: { opacity: 1 },
          }}
          initial="initial"
          animate="animate"
          whileHover="hover"
        >
          <SliderProductElementContent
            element={game}
            showTags={false}
            showSummary={false}
            sliderImageOverviewFn={stableSliderImageOverviewFn}
          >
            {(element) => (
              <Button
                onClick={
                  !isInCartAndFreeToPlay
                    ? () => {
                        dispatch(
                          modifyCartQuantityAction({
                            productId: element._id,
                            operation: "increase",
                            login,
                            finalPrice: game.finalPrice,
                          })
                        );
                      }
                    : undefined
                }
                disabled={isInCartAndFreeToPlay}
              >
                {!isInCartAndFreeToPlay
                  ? "Add to cart"
                  : "Already in your cart"}
              </Button>
            )}
          </SliderProductElementContent>
        </motion.article>
        <PagesManagerContextProvider>
          <motion.article
            className="product-details flex flex-col text-center bg-darkerBg p-8 rounded-xl gap-4 w-full"
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
            <AddReviewContextProvider gameId={game._id}>
              {!game.userReview && (
                <motion.section className="product-details-add-review w-full">
                  <Header>Add your own review</Header>
                  <ReviewContent />
                </motion.section>
              )}
            </AddReviewContextProvider>
          </motion.article>
          <article className="product-reviews text-center">
            <header className="py-6">
              <Header size="large">Reviews</Header>
            </header>
            <AnimatePresence>
              <motion.article>
                <ReviewsWrapper />
                <PagesElement
                  amountOfElementsPerPage={MAX_REVIEWS_PER_PAGE}
                  totalAmountOfElementsToDisplayOnPages={game.reviews}
                />
              </motion.article>
            </AnimatePresence>
          </article>
        </PagesManagerContextProvider>
      </>
    );
  }
);

export default ExtendedGamePreview;
