import { AnimatePresence, motion } from "framer-motion";

import Button from "../UI/Button";
import Header from "../UI/headers/Header";
import Input from "../UI/Input";
import TextArea from "../UI/TextArea";
import StarSVG from "../UI/svg/StarSVG";
import { useContext } from "react";
import { AddReviewContext } from "../../store/product/AddReviewContext";
import properties from "../../styles/properties";
import AnimatedAppearance from "../UI/AnimatedAppearance";
import { isEqual } from "lodash";
import { IReview } from "../../models/review.model";
import { dateTimeFormat } from "../../helpers/dateTimeFormat";

export default function ReviewContent({
  reviewToRender,
}: {
  reviewToRender?: IReview;
}) {
  const {
    content,
    handleContentChange,
    criteria: ctxCriteria,
    criteriaDispatch,
    debouncedCriteria,
    currentlyHoveredCriterion,
    setCurrentlyHoveredCriterion,
  } = useContext(AddReviewContext);

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

  return (
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
              &nbsp; on {dateTimeFormat.format(reviewToRender.date)}
            </div>
          )}
          {reviewContent}
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
                      : `-${(reviewToRender as IReview & { _id: string })._id}`
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
                    />
                  ) : (
                    <p className="max-w-1/4">{criterionObj.criterionName}</p>
                  )}
                  <motion.section className="criterion-stars flex" layout>
                    {Array.from({ length: 5 }, (_, i) => i).map((rating) => (
                      <StarSVG
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

          {serveAsAnAddReviewComponent && <Button>Upload</Button>}
        </motion.section>
      </AnimatedAppearance>
    </section>
  );
}
