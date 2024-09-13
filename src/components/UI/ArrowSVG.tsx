import { motion } from "framer-motion";

export default function ArrowSVG({
  arrowSrc,
  alt,
  onClick,
  translateXVal = "-2rem",
  disabled = false,
  customWidthTailwindClass = "w-16",
}: {
  arrowSrc: string;
  alt: string;
  onClick: () => void;
  translateXVal?: string;
  disabled?: boolean;
  customWidthTailwindClass?: string;
}) {
  const translateXParsedValue = parseFloat(translateXVal);
  const movingInReversedDirection = translateXParsedValue < 0;

  return (
    <motion.div
      className={`arrow-svg-control-container ${
        !disabled ? "cursor-pointer" : ""
      }`}
      variants={{
        unHovered: {
          ...(movingInReversedDirection
            ? { paddingLeft: translateXVal.slice(1) }
            : { paddingRight: translateXVal }),
        },
        hovered: {},
      }}
      initial="unHovered"
      whileHover={!disabled ? "hovered" : "unHovered"}
      onClick={!disabled ? onClick : undefined}
    >
      <motion.img
        src={arrowSrc}
        className={`${customWidthTailwindClass} h-24`}
        alt={alt}
        variants={{
          unHovered: { opacity: 0.5, transform: "translateX(0)" },
          hovered: {
            opacity: 1,
            transform: `translateX(${translateXVal})`,
          },
        }}
      />
    </motion.div>
  );
}
