import { AnimatePresence, motion } from "framer-motion";

import Button from "../UI/Button";
import Header from "../UI/headers/Header";
import Input from "../UI/Input";
import TextArea from "../UI/TextArea";
import AnimatedSVG from "../UI/svg/AnimatedSVG";
import { ReactNode, useCallback, useContext } from "react";
import { AddReviewContext } from "../../store/product/AddReviewContext";
import properties from "../../styles/properties";
import AnimatedAppearance from "../UI/AnimatedAppearance";
import { isEqual } from "lodash";
import { IReview } from "../../models/review.model";
import { dateTimeFormat } from "../../helpers/dateTimeFormat";
import svgPathBase from "../UI/svg/svgPathBase";
import { useAppSelector } from "../../hooks/reduxStore";
import Error from "../UI/Error";
import { generateValidationErrorsRelatedToAnInput } from "../UI/InputFieldElement";
import LoadingFallback from "../UI/LoadingFallback";
import { ReviewContext } from "./ReviewsWrapper";
import ReviewRemoveContentPart from "./ReviewRemoveContentPart";

const ReviewContentErrorsContainer = ({
  children,
  classNameIndicator,
}: {
  children: ReactNode;
  classNameIndicator: string;
}) => (
  <section
    className={`${
      classNameIndicator ? classNameIndicator + "-" : ""
    }errors-container px-4 py-4`}
  >
    {children}
  </section>
);

const checkValidationErrorsGeneration = (
  generationResult: false | JSX.Element[] | undefined
) =>
  (generationResult && generationResult.length > 0 && generationResult) ||
  false;

export default function ReviewContent() {
  const {
    content,
    handleContentChange,
    criteria: ctxCriteria,
    criteriaDispatch,
    debouncedCriteria,
    currentlyHoveredCriterion,
    setCurrentlyHoveredCriterion,
    handleReviewSubmit,
    sendingNewReviewError,
    isSendingANewReview,
    sendingNewReviewData,
  } = useContext(AddReviewContext);

  const login = useAppSelector((state) => state.userAuthSlice.login);
  const { review: reviewToRender, userReview } = useContext(ReviewContext);

  const serveAsAnAddReviewComponent = !reviewToRender;
  const reviewContent = serveAsAnAddReviewComponent ? (
    <TextArea
      widthTailwindClass="w-full h-full"
      rows={8}
      placeholder="Enter your review content"
      value={content}
      onChange={handleContentChange}
    ></TextArea>
  ) : (
    <p className="w-full h-full flex items-center">{reviewToRender.content}</p>
  );
  const criteria = serveAsAnAddReviewComponent
    ? ctxCriteria
    : reviewToRender.criteria;

  const handleUploadClick = useCallback(
    () => handleReviewSubmit({ criteria, reviewContent: content }),
    [handleReviewSubmit, criteria, content]
  );
  const sendingNewReviewReceivedData = sendingNewReviewData?.data;

  const hasErrorNotRelatedToValidation =
    (sendingNewReviewError &&
      !Array.isArray(sendingNewReviewError) &&
      sendingNewReviewError) ||
    (sendingNewReviewReceivedData &&
      typeof sendingNewReviewReceivedData === "object" &&
      sendingNewReviewReceivedData);
  const errorsRelatedToReviewContentValidation =
    checkValidationErrorsGeneration(
      !hasErrorNotRelatedToValidation &&
        generateValidationErrorsRelatedToAnInput(
          sendingNewReviewError!,
          "reviewContent"
        )
    );
  const errorsRelatedToCriteriaValidation = checkValidationErrorsGeneration(
    !hasErrorNotRelatedToValidation &&
      generateValidationErrorsRelatedToAnInput(
        sendingNewReviewError!,
        "criteria"
      )
  );

  return (
    <>
      <section
        className={`${
          serveAsAnAddReviewComponent ? "add-review" : "review"
        } flex w-full py-3`}
      >
        <AnimatedAppearance flexTailwindClass="flex-row">
          <section
            className={`${
              serveAsAnAddReviewComponent ? "add-" : ""
            }review-content w-1/2 self-stretch items-center justify-center flex flex-col`}
          >
            {!serveAsAnAddReviewComponent && (
              <div className="review-header flex items-center text-nowrap justify-center">
                Added by&nbsp;
                <Header usePaddingBottom={false}>
                  {reviewToRender.userId.login}
                </Header>
                &nbsp; on {dateTimeFormat.format(new Date(reviewToRender.date))}
              </div>
            )}
            {reviewContent}
            {errorsRelatedToReviewContentValidation && (
              <ReviewContentErrorsContainer classNameIndicator="review-content-validation">
                {errorsRelatedToReviewContentValidation}
              </ReviewContentErrorsContainer>
            )}
          </section>
          <motion.section
            className={`${
              serveAsAnAddReviewComponent ? "add-" : ""
            }review-criteria-container flex self-stretch w-1/2 items-center justify-center flex-col`}
          >
            <section className="w-full">
              <Header>Review Criteria</Header>
            </section>

            <section
              className={`${
                serveAsAnAddReviewComponent ? "add-" : ""
              }review-criteria w-full flex flex-col gap-2 pb-4 py-2 h-full items-center justify-center`}
            >
              <AnimatePresence>
                {criteria.map((criterionObj, i) => (
                  <motion.section
                    className={`${
                      serveAsAnAddReviewComponent ? "add-" : ""
                    }review-criterion flex items-center justify-center gap-3`}
                    key={`${serveAsAnAddReviewComponent ? "add-" : ""}review${
                      serveAsAnAddReviewComponent
                        ? ""
                        : `-${
                            (reviewToRender as IReview & { _id: string })._id
                          }`
                    }-criterion-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  >
                    {serveAsAnAddReviewComponent ? (
                      <Input
                        value={criterionObj.criterionName}
                        placeholder="Criterion name"
                        width="w-1/4"
                        onChange={(value: string) =>
                          criteriaDispatch({
                            type: "CHANGE_CRITERION",
                            payload: {
                              newCriterionName: value,
                              criterionId: i,
                            },
                          })
                        }
                        onFocus={() =>
                          i === criteria.length - 1 &&
                          isEqual(criteria, debouncedCriteria) &&
                          i !== 9 &&
                          criteriaDispatch({
                            type: "ADD_CRITERION",
                            payload: {},
                          })
                        }
                        otherValidationInputAttributes={{ required: true }}
                      />
                    ) : (
                      <p className="max-w-1/4">{criterionObj.criterionName}</p>
                    )}
                    <motion.section className="criterion-stars flex" layout>
                      {Array.from({ length: 5 }, (_, i) => i).map((rating) => (
                        <AnimatedSVG
                          size="48px"
                          key={`criterion-example-star-${rating}`}
                          onClick={
                            serveAsAnAddReviewComponent
                              ? () =>
                                  criteriaDispatch({
                                    type: "CHANGE_CRITERION",
                                    payload: {
                                      criterionId: i,
                                      newCriterionRating:
                                        criterionObj.rating === rating
                                          ? null
                                          : rating,
                                    },
                                  })
                              : undefined
                          }
                          active={
                            serveAsAnAddReviewComponent &&
                            currentlyHoveredCriterion &&
                            currentlyHoveredCriterion.index === i
                              ? rating < currentlyHoveredCriterion.rating
                              : criterionObj.rating !== null &&
                                rating <= criterionObj.rating
                          }
                          onMouseLeave={
                            serveAsAnAddReviewComponent
                              ? () => setCurrentlyHoveredCriterion(undefined)
                              : undefined
                          }
                          onMouseEnter={
                            serveAsAnAddReviewComponent
                              ? () =>
                                  setCurrentlyHoveredCriterion({
                                    index: i,
                                    rating,
                                  })
                              : undefined
                          }
                          hoverAnimation={serveAsAnAddReviewComponent}
                          svgPath={svgPathBase.startSVG}
                        />
                      ))}
                    </motion.section>
                    {serveAsAnAddReviewComponent && (
                      <motion.p
                        className={`inline ml-3 text-2xl font-bold ${
                          i !== 0 ? "cursor-pointer" : ""
                        }`}
                        {...(i !== 0 && {
                          initial: {
                            opacity: 0.7,
                            color: properties.defaultFont,
                            scale: 1,
                          },
                          whileHover: {
                            opacity: 1,
                            color: properties.highlightRed,
                            scale: 1.5,
                          },
                        })}
                        onClick={() =>
                          i !== 0 &&
                          criteriaDispatch({
                            type: "REMOVE_CRITERION",
                            payload: { criterionId: i },
                          })
                        }
                        layout
                      >
                        X
                      </motion.p>
                    )}
                  </motion.section>
                ))}
              </AnimatePresence>
            </section>

            {serveAsAnAddReviewComponent && (
              <Button
                disabled={login === undefined}
                onClick={login === undefined ? undefined : handleUploadClick}
              >
                {login
                  ? isSendingANewReview
                    ? "Uploading..."
                    : "Upload a review"
                  : "Log in to upload a review"}
              </Button>
            )}
            {isSendingANewReview && <LoadingFallback />}
            {((sendingNewReviewError && errorsRelatedToCriteriaValidation) ||
              hasErrorNotRelatedToValidation) && (
              <ReviewContentErrorsContainer classNameIndicator="review-criteria-validation-and-more">
                {hasErrorNotRelatedToValidation && (
                  <Error message={hasErrorNotRelatedToValidation.message} />
                )}
                {errorsRelatedToCriteriaValidation}
              </ReviewContentErrorsContainer>
            )}
          </motion.section>
        </AnimatedAppearance>
      </section>
      {userReview && <ReviewRemoveContentPart />}
    </>
  );
}
