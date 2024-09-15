/* eslint-disable react-refresh/only-export-components */
import {
  useAnimate,
  motion,
  AnimationProps,
  DOMKeyframesDefinition,
} from "framer-motion";
import { useCallback, useContext, useEffect } from "react";

import customColors from "../../styles/properties";
import { GameResultContext } from "../main/nav/GamesResults";
import Error from "../UI/Error";
import { IGameWithQuantityBasedOnCartDetailsEntry } from "../../helpers/generateGamesWithQuantityOutOfCartDetailsEntries";
import properties from "../../styles/properties";

export const priceFormat = new Intl.NumberFormat(navigator.language, {
  style: "currency",
  currency: "USD",
  useGrouping: false,
  maximumFractionDigits: 2,
});

export function FreeToPlayTag() {
  return (
    <p className="price font-bold bg-highlightGreen py-2 px-3 rounded-xl">
      Free To Play
    </p>
  );
}

const hiddenInitialElementMotionPropFn = (
  useInitialDefaultFontColor: boolean = false
) =>
  ({
    opacity: 0,
    width: 0,
    fontWeight: 400,
    ...(useInitialDefaultFontColor && { color: properties.defaultFont }),
  } as AnimationProps["initial"]);

const quanityAndFinalPriceAnimationKeyframesDefinition: DOMKeyframesDefinition =
  {
    opacity: 1,
    width: "auto",
    fontWeight: 700,
    scale: [1.5, 1],
    color: properties.highlightRed,
  };

export default function PriceTag({
  priceFromProps,
  discountFromProps,
  finalPriceFromProps,
  startAnimation = false,
  removeOriginalPriceAfterAnimation = false,
}: {
  priceFromProps?: number;
  discountFromProps?: number;
  finalPriceFromProps?: number;
  startAnimation: boolean;
  removeOriginalPriceAfterAnimation?: boolean;
}) {
  const [scope, animate] = useAnimate();
  const { showQuantityAndFinalPrice, game } = useContext(GameResultContext);
  const price = priceFromProps ?? game?.price;
  const discount = discountFromProps ?? game?.discount;
  const priceAfterDiscount = finalPriceFromProps ?? game?.finalPrice;

  const isFree = price === 0 || discount === 100;
  const hasDiscount = discount !== 0;
  const quantityFramerMotionAnimateEntry = useCallback(
    () =>
      animate(".quantity", quanityAndFinalPriceAnimationKeyframesDefinition),
    [animate]
  );
  const finalPriceFramerMotionAnimateEntry = useCallback(
    () =>
      animate(".final-price", quanityAndFinalPriceAnimationKeyframesDefinition),
    [animate]
  );

  const quantityHigherThanOne =
    showQuantityAndFinalPrice &&
    (game as IGameWithQuantityBasedOnCartDetailsEntry).quantity > 1;

  useEffect(() => {
    const sequence = async () => {
      if (isFree || !hasDiscount || !startAnimation) {
        if (quantityHigherThanOne)
          await Promise.all([
            quantityFramerMotionAnimateEntry(),
            finalPriceFramerMotionAnimateEntry(),
          ]);
        return;
      }

      await Promise.all([
        animate(
          ".new-price",
          {
            opacity: 1,
            transform: ["scale(1.2)", "scale(1)"],
            width: "auto",
            fontWeight: 700,
          },
          { duration: 0.5 }
        ),
        animate(
          ".price",
          {
            textDecorationLine: "line-through",
            fontSize: ".8rem",
            ...(hasDiscount && { fontWeight: 400 }),
            ...(removeOriginalPriceAfterAnimation && { opacity: 0, width: 0 }),
          },
          { duration: 0.5 }
        ),
      ]);
      const discountAndPossibleFinalPriceWithQuantity = [
        animate(
          ".discount",
          {
            opacity: 1,
            backgroundColor: customColors.highlightGreen,
            width: "auto",
            padding: "0.5rem",
            fontWeight: 700,
          },
          Object.fromEntries(
            [
              "opacity",
              "backgroundColor",
              "width",
              "padding",
              "fontWeight",
            ].map((property) => [
              property,
              { duration: ["width", "padding"].includes(property) ? 0 : 0.5 },
            ])
          )
        ),
      ];
      if (quantityHigherThanOne)
        discountAndPossibleFinalPriceWithQuantity.push(
          quantityFramerMotionAnimateEntry()
        );
      if (showQuantityAndFinalPrice)
        discountAndPossibleFinalPriceWithQuantity.push(
          finalPriceFramerMotionAnimateEntry()
        );
      await Promise.all(discountAndPossibleFinalPriceWithQuantity);
    };
    sequence();
  }, [
    isFree,
    hasDiscount,
    animate,
    startAnimation,
    removeOriginalPriceAfterAnimation,
    showQuantityAndFinalPrice,
    quantityHigherThanOne,
    quantityFramerMotionAnimateEntry,
    finalPriceFramerMotionAnimateEntry,
  ]);

  if (
    price === undefined ||
    discount === undefined ||
    priceAfterDiscount === undefined
  )
    return (
      <Error
        message="Has to provide required price information through game result context provider or props!"
        smallVersion
      />
    );

  return (
    <div
      className="product-price-div flex gap-2 justify-center items-center w-3/8"
      ref={scope}
    >
      {quantityHigherThanOne && (
        <motion.p
          className="quantity flex gap-2 justify-center items-center"
          initial={hiddenInitialElementMotionPropFn(true)}
        >
          {(game as IGameWithQuantityBasedOnCartDetailsEntry).quantity}
          <span>x</span>
        </motion.p>
      )}
      {!isFree && (
        <motion.p
          className={`price ${!hasDiscount && "font-bold"}`}
          initial={{
            textDecorationLine: "none",
            fontSize: "1rem",
            ...(hasDiscount && { fontWeight: 700 }),
          }}
        >
          {priceFormat.format(price)}
        </motion.p>
      )}
      {isFree && <FreeToPlayTag />}
      {!isFree && hasDiscount && (
        <>
          <motion.p
            className="new-price text-lg text-highlightRed"
            initial={hiddenInitialElementMotionPropFn()}
          >
            {priceFormat.format(priceAfterDiscount)}
          </motion.p>
          <motion.p
            className="discount rounded-xl"
            initial={{
              backgroundColor: customColors.bodyBg,
              opacity: 0,
              width: 0,
              padding: 0,
              fontWeight: 400,
            }}
          >
            -{discount}%
          </motion.p>
        </>
      )}
      {quantityHigherThanOne && (
        <motion.p
          className="final-price font-bold"
          initial={hiddenInitialElementMotionPropFn()}
        >
          {priceFormat.format(
            (game as IGameWithQuantityBasedOnCartDetailsEntry).quantity *
              priceAfterDiscount
          )}
        </motion.p>
      )}
    </div>
  );
}
