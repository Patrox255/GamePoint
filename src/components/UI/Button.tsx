import { MouseEventHandler, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import properties from "../../styles/properties";

export default function Button({
  children = "",
  active = false,
  passedKey = undefined,
  additionalTailwindCSS = { px: "px-6", py: "py-2" },
  onClick = undefined,
  useBorder = true,
  useBgColor = true,
  disabled = false, // only to leave this button greyed out and disable onclick if some feature is not available
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
  disabled?: boolean;
}) {
  const initialClasses = {
    opacity: 0.5,
    ...(useBgColor && { backgroundColor: properties.bodyBg }),
    boxShadow: "none",
    transform: "scale(0.9)",
  };

  const activeClasses = {
    opacity: 1,
    ...(useBgColor && { backgroundColor: properties.highlightRed }),
    boxShadow: properties.boxShadow,
    transform: "scale(1)",
  };

  const basicClasses = {
    ...initialClasses,
    transform: "scale(1)",
  };

  const disabledClasses = {
    ...basicClasses,
    opacity: 0.3,
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
        whileHover={disabled ? undefined : activeClasses}
        initial={initialClasses}
        animate={
          active ? activeClasses : disabled ? disabledClasses : basicClasses
        }
        disabled={active || disabled}
        key={passedKey}
        onClick={onClick}
      >
        {children}
      </motion.button>
    </AnimatePresence>
  );
}
