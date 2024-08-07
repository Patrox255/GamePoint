import { motion } from "framer-motion";
import { createContext, useContext } from "react";

import { IReview } from "../../models/review.model";
import ReviewContent from "./ReviewContent";
import { PagesManagerContext } from "../../store/products/PagesManagerContext";
import { MAX_REVIEWS_PER_PAGE } from "../../helpers/config";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getGameData } from "../../lib/fetch";
import LoadingFallback from "../UI/LoadingFallback";
import Error from "../UI/Error";
import Header from "../UI/headers/Header";
import RemoveReviewContextProvider, {
  RemoveReviewContext,
} from "../../store/product/RemoveReviewContext";

export const ReviewContext = createContext<{
  review: IReview | undefined;
  userReview: boolean;
}>({ review: undefined, userReview: false });

const Review = ({
  reviewFromProps,
  customTailwindCSS = "p-8",
  userReviewFromProps = false,
}: {
  reviewFromProps?: IReview;
  customTailwindCSS?: string;
  userReviewFromProps?: boolean;
}) => {
  const ctx = useContext(RemoveReviewContext);
  const userReview = userReviewFromProps
    ? userReviewFromProps
    : ctx.review !== undefined;
  const review = reviewFromProps ? reviewFromProps : ctx.review!;

  return (
    <motion.li
      key={(review as IReview & { _id: string })._id}
      className={`bg-darkerBg p-8 ${
        customTailwindCSS ? customTailwindCSS : ""
      } rounded-xl`}
      initial={{ opacity: 0.7 }}
      whileHover={{ opacity: 1 }}
    >
      <ReviewContext.Provider value={{ review, userReview }}>
        <ReviewContent />
      </ReviewContext.Provider>
    </motion.li>
  );
};

export interface IGameReviewsResponse {
  reviews: IReview[];
  userReview?: IReview;
}

export default function ReviewsWrapper() {
  const { productSlug } = useParams();
  const { pageNr } = useContext(PagesManagerContext);

  const { data, error, isLoading } = useQuery({
    queryFn: ({ signal }) =>
      getGameData<IGameReviewsResponse>({
        signal,
        productSlug: productSlug!,
        onlyReviews: true,
        maxReviewsPerPage: MAX_REVIEWS_PER_PAGE,
        reviewsPageNr: pageNr,
      }),
    queryKey: ["games", productSlug, "reviews", pageNr],
  });

  let content;
  if (isLoading) content = <LoadingFallback />;
  if (error) content = <Error message={error.message} />;
  if (data && data.data) {
    const reviews = data.data.reviews;
    const userReview = data.data.userReview;
    content =
      reviews.length === 0 && !userReview ? (
        <Header>No reviews for this game have been found!</Header>
      ) : (
        <>
          {userReview && (
            <RemoveReviewContextProvider review={userReview}>
              <Review customTailwindCSS="mb-8" />
            </RemoveReviewContextProvider>
          )}
          {reviews.map((review) => (
            <Review reviewFromProps={review} key={review.userId.login} />
          ))}
        </>
      );
  }

  return (
    <ul className="product-reviews-container flex flex-col w-full gap-4 pb-2">
      {content}
    </ul>
  );
}
