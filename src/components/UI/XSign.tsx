import { motion } from "framer-motion";

import properties from "../../styles/properties";

export default function XSign({
  disabled = false,
  onClick,
}: {
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.p
      className={`inline ml-3 text-2xl font-bold ${
        !disabled ? "cursor-pointer" : ""
      }`}
      {...(!disabled && {
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
      onClick={() => !disabled && onClick?.()}
      layout
    >
      X
    </motion.p>
  );
}
