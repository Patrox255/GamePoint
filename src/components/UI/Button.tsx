import { MouseEventHandler, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import customColors from "../../styles/colors";

export default function Button({
  children = "",
  active = false,
  passedKey = undefined,
  additionalTailwindCSS = { px: "px-6", py: "py-2" },
  onClick = undefined,
  useBorder = true,
  useBgColor = true,
  ...props // sadly it is not supported in TS so I add each prop individually
}: {
  children?: ReactNode;
  active?: boolean;
  passedKey?: string;
  additionalTailwindCSS?: {
    px: string;
    py: string;
  } | null;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  useBorder?: boolean;
  useBgColor?: boolean;
}) {
  const initialClasses = {
    opacity: 0.5,
    ...(useBgColor && { backgroundColor: customColors.bodyBg }),
    boxShadow: "none",
    transform: "scale(0.9)",
  };

  const activeClasses = {
    opacity: 1,
    ...(useBgColor && { backgroundColor: customColors.highlightRed }),
    boxShadow: "0 0 40px -4px rgba(173,52,52,1)",
    transform: "scale(1)",
  };

  const basicClasses = {
    ...initialClasses,
    transform: "scale(1)",
  };

  return (
    <AnimatePresence mode="wait">
      <motion.button
        {...props}
        className={`${
          useBorder ? "border-highlightRed border-2" : ""
        } rounded-lg font-bold ${
          additionalTailwindCSS &&
          Object.values(additionalTailwindCSS).join(" ")
        }`}
        whileHover={activeClasses}
        initial={initialClasses}
        animate={active ? activeClasses : basicClasses}
        disabled={active}
        key={passedKey}
        onClick={onClick}
      >
        {children}
      </motion.button>
    </AnimatePresence>
  );
}
