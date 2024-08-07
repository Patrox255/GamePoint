import { useContext } from "react";
import { RemoveReviewContext } from "../../store/product/RemoveReviewContext";
import HeaderLinkOrHeaderAnimation from "../UI/headers/HeaderLinkOrHeaderAnimation";
import Header from "../UI/headers/Header";
import { IReview } from "../../models/review.model";
import Error from "../UI/Error";

export default function ReviewRemoveContentPart() {
  const {
    isRemoving,
    removingError,
    removingData,
    removeReviewHandler,
    review,
  } = useContext(RemoveReviewContext);

  const error =
    (removingError && removingError) ||
    (removingData?.data &&
      typeof removingData.data === "object" &&
      removingData.data);

  return (
    <>
      <HeaderLinkOrHeaderAnimation
        onlyAnimation
        onClick={() =>
          removeReviewHandler((review as IReview & { _id: string })._id)
        }
        disabled={isRemoving}
      >
        <Header>{isRemoving ? "Removing..." : "Remove your review"}</Header>
      </HeaderLinkOrHeaderAnimation>
      {error && <Error smallVersion message={error.message} />}
    </>
  );
}
