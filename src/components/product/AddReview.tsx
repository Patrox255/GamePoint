import { AnimatePresence, motion } from "framer-motion";

import Button from "../UI/Button";
import HeaderMedium from "../UI/headers/HeaderMedium";
import Input from "../UI/Input";
import TextArea from "../UI/TextArea";
import StarSVG from "../UI/svg/StarSVG";
import { useContext } from "react";
import { AddReviewContext } from "../../store/product/AddReviewContext";
import properties from "../../styles/properties";
import AnimatedAppearance from "../UI/AnimatedAppearance";
import { isEqual } from "lodash";

export default function AddReview() {
  const {
    content,
    handleContentChange,
    criteria,
    criteriaDispatch,
    debouncedCriteria,
    currentlyHoveredCriterion,
    setCurrentlyHoveredCriterion,
  } = useContext(AddReviewContext);
  console.log(criteria);

  return (
    <section className="add-review flex w-full py-3">
      <section className="add-review-content w-1/2 self-stretch">
        <TextArea
          widthTailwindClass="w-full h-full"
          rows={8}
          placeholder="Enter your review content"
          value={content}
          onChange={handleContentChange}
        ></TextArea>
      </section>
      <motion.section className="add-review-criteria-container flex self-stretch w-1/2 items-center justify-center flex-col">
        <section className="w-full">
          <HeaderMedium>Review Criteria</HeaderMedium>
        </section>
        <AnimatedAppearance>
          <section className="add-review-criteria w-full min-h-full flex flex-col gap-2 pb-4 py-2">
            <AnimatePresence>
              {criteria.map((criterionObj, i) => (
                <motion.section
                  className="add-review-criterion flex items-center justify-center h-full gap-3"
                  key={`criterion-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ opacity: 1 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                >
                  <Input
                    value={criterionObj.criterionName}
                    placeholder="Criterion name"
                    width="w-1/4"
                    onChange={(value) =>
                      criteriaDispatch({
                        type: "CHANGE_CRITERION",
                        payload: { newCriterionName: value, criterionId: i },
                      })
                    }
                    onFocus={() =>
                      i === criteria.length - 1 &&
                      isEqual(criteria, debouncedCriteria) &&
                      i !== 9 &&
                      criteriaDispatch({ type: "ADD_CRITERION", payload: {} })
                    }
                  />
                  <motion.section className="criterion-stars flex" layout>
                    {Array.from({ length: 5 }, (_, i) => i).map((rating) => (
                      <StarSVG
                        size="48px"
                        key={`criterion-example-star-${rating}`}
                        onClick={() =>
                          criteriaDispatch({
                            type: "CHANGE_CRITERION",
                            payload: {
                              criterionId: i,
                              newCriterionRating:
                                criterionObj.rating === rating ? null : rating,
                            },
                          })
                        }
                        active={
                          currentlyHoveredCriterion &&
                          currentlyHoveredCriterion.index === i
                            ? rating <= currentlyHoveredCriterion.rating
                            : criterionObj.rating !== null &&
                              rating <= criterionObj.rating
                        }
                        onMouseLeave={() =>
                          setCurrentlyHoveredCriterion(undefined)
                        }
                        onMouseEnter={() =>
                          setCurrentlyHoveredCriterion({ index: i, rating })
                        }
                      />
                    ))}
                  </motion.section>
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
                </motion.section>
              ))}
            </AnimatePresence>
          </section>
        </AnimatedAppearance>
        <Button>Upload</Button>
      </motion.section>
    </section>
  );
}
