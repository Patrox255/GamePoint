import { motion } from "framer-motion";
import { useContext } from "react";

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

export default function ReviewsWrapper() {
  const { productSlug } = useParams();
  const { pageNr } = useContext(PagesManagerContext);

  const { data, error, isLoading } = useQuery({
    queryFn: ({ signal }) =>
      getGameData<IReview[]>({
        signal,
        productSlug: productSlug!,
        onlyReviews: true,
        maxReviewsPerPage: MAX_REVIEWS_PER_PAGE,
        reviewsPageNr: pageNr,
      }),
    queryKey: ["games", productSlug, "reviews", pageNr],
  });

  console.log(data);

  let content;
  if (isLoading) content = <LoadingFallback />;
  if (error) content = <Error message={error.message} />;
  if (data && data.data) {
    const reviews = data.data;
    content =
      reviews.length === 0 ? (
        <Header>No reviews for this game have been found!</Header>
      ) : (
        reviews.map((review) => (
          <motion.li
            key={(review as IReview & { _id: string })._id}
            className="bg-darkerBg p-8 rounded-xl"
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 1 }}
          >
            <ReviewContent reviewToRender={review} />
          </motion.li>
        ))
      );
  }

  return (
    <ul className="product-reviews-container flex flex-col w-full gap-4 pb-2">
      {content}
    </ul>
  );
}
