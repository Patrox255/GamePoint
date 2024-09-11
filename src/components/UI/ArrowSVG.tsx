import { motion } from "framer-motion";

export default function ArrowSVG({
  arrowSrc,
  alt,
  onClick,
  translateXVal = "-2rem",
  disabled = false,
  customWidthTailwindClass = "w-1/5",
}: {
  arrowSrc: string;
  alt: string;
  onClick: () => void;
  translateXVal?: string;
  disabled?: boolean;
  customWidthTailwindClass?: string;
}) {
  return (
    <motion.img
      src={arrowSrc}
      className={`${customWidthTailwindClass} h-24 cursor-pointer`}
      alt={alt}
      initial={{ opacity: 0.5, transform: "translateX(0)" }}
      whileHover={
        !disabled
          ? { opacity: 1, transform: `translateX(${translateXVal})` }
          : undefined
      }
      onClick={!disabled ? onClick : undefined}
    />
  );
}
