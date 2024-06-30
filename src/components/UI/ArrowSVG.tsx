import { motion } from "framer-motion";

export default function ArrowSVG({
  arrowSrc,
  alt,
  onClick,
  translateXVal = "-2rem",
}: {
  arrowSrc: string;
  alt: string;
  onClick: () => void;
  translateXVal?: string;
}) {
  return (
    <motion.img
      src={arrowSrc}
      className="w-1/5 h-24 cursor-pointer"
      alt={alt}
      initial={{ opacity: 0.5, transform: "translateX(0)" }}
      whileHover={{ opacity: 1, transform: `translateX(${translateXVal})` }}
      onClick={onClick}
    />
  );
}
