import { motion } from "framer-motion";
import triangularArrowSVG from "../../../assets/triangular-arrow.svg";
import { useContext } from "react";
import { SearchCustomizationContext } from "../../../store/products/SearchCustomizationContext";

export default function OrderCustomization() {
  const paragraphClasses =
    "flex items-center justify-center cursor-pointer gap-2";

  const { orderCustomizationState, orderCustomizationDispatch } = useContext(
    SearchCustomizationContext
  );

  return (
    <header className="flex justify-center items-center w-full pb-4 text-lg font-bold">
      {["Popularity", "Title", "Price"].map((tag) => {
        const currentCustomizationStateKey = tag.toLowerCase() as
          | "popularity"
          | "title"
          | "price";
        return (
          <section
            className="w-full flex justify-center items-center"
            key={tag}
          >
            <motion.p
              className={paragraphClasses}
              initial={{ opacity: 0.5 }}
              whileHover={{ opacity: 1 }}
              onClick={() =>
                orderCustomizationDispatch({
                  type: "CHANGE_PROPERTY_VALUE",
                  payload: {
                    fieldName: currentCustomizationStateKey,
                    newState:
                      orderCustomizationState[currentCustomizationStateKey]
                        .value === ""
                        ? "1"
                        : orderCustomizationState[currentCustomizationStateKey]
                            .value === "-1"
                        ? ""
                        : "-1",
                  },
                })
              }
            >
              {tag}
              <motion.img
                src={triangularArrowSVG}
                className="w-5"
                variants={{
                  ascending: {
                    opacity: 1,
                    width: "1.25rem",
                    rotate: 0,
                  },
                  descending: {
                    opacity: 1,
                    width: "1.25rem",
                    rotate: "180deg",
                  },
                  hidden: {
                    opacity: 0,
                    width: 0,
                  },
                }}
                initial={
                  orderCustomizationState[currentCustomizationStateKey]
                    .value === "-1"
                    ? "ascending"
                    : "hidden"
                }
                animate={
                  orderCustomizationState[currentCustomizationStateKey]
                    .value === ""
                    ? undefined
                    : orderCustomizationState[currentCustomizationStateKey]
                        .value === "1"
                    ? "ascending"
                    : "descending"
                }
              />
            </motion.p>
          </section>
        );
      })}
    </header>
  );
}
