import { useAnimate, motion } from "framer-motion";
import { useEffect } from "react";
import customColors from "../../styles/properties";

export default function PriceTag({
  price,
  discount,
  startAnimation = false,
  removeOriginalPriceAfterAnimation = false,
}: {
  price: number;
  discount: number;
  startAnimation: boolean;
  removeOriginalPriceAfterAnimation?: boolean;
}) {
  const [scope, animate] = useAnimate();

  const priceFormat = new Intl.NumberFormat(navigator.language, {
    style: "currency",
    currency: "USD",
    useGrouping: false,
    maximumFractionDigits: 2,
  });

  const isFree = price === 0 || discount === 100;
  const hasDiscount = discount !== 0;
  const priceAfterDiscount =
    Math.trunc((1 - discount / 100) * price * 100) / 100;

  useEffect(() => {
    if (isFree || !hasDiscount || !startAnimation) return;

    const sequence = async () => {
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
            ...(removeOriginalPriceAfterAnimation && { opacity: 0 }),
          },
          { duration: 0.5 }
        ),
      ]);
      await animate(
        ".discount",
        {
          opacity: 1,
          backgroundColor: customColors.highlightGreen,
          width: "auto",
          padding: "0.5rem",
          fontWeight: 700,
        },
        Object.fromEntries(
          ["opacity", "backgroundColor", "width", "padding", "fontWeight"].map(
            (property) => [
              property,
              { duration: ["width", "padding"].includes(property) ? 0 : 0.5 },
            ]
          )
        )
      );
    };
    sequence();
  }, [
    isFree,
    hasDiscount,
    animate,
    startAnimation,
    removeOriginalPriceAfterAnimation,
  ]);

  return (
    <div
      className="product-price-div flex gap-2 justify-center items-center w-3/8"
      ref={scope}
    >
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
      {isFree && <p>Free To Play</p>}
      {!isFree && hasDiscount && (
        <>
          <motion.p
            className="new-price text-lg text-highlightRed"
            initial={{ opacity: 0, width: 0, fontWeight: 400 }}
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
    </div>
  );
}
