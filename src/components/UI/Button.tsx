import { MouseEventHandler, ReactNode, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import properties from "../../styles/properties";
import { ContactInformationFormContentContext } from "../formRelated/ContactInformationFormContent";

const defaultAdditionalTailwindCSS = { px: "px-6", py: "py-2" };

export default function Button({
  children = "",
  active = false,
  passedKey = undefined,
  additionalTailwindCSS = defaultAdditionalTailwindCSS,
  onClick = undefined,
  useBorder = true,
  useBgColor = true,
  disabled = false, // only to leave this button greyed out and disable onclick if some feature is not available
  canClickWhileActive = false,
  type,
  useRounded = true,
  ...props // sadly it is not supported in TS so I add each prop individually
}: {
  children?: ReactNode;
  active?: boolean;
  passedKey?: string;
  additionalTailwindCSS?: {
    px?: string;
    py?: string;
    width?: string;
  } | null;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  useBorder?: boolean;
  useBgColor?: boolean;
  disabled?: boolean;
  canClickWhileActive?: boolean;
  type?: "submit" | "reset" | "button";
  useRounded?: boolean;
}) {
  const onClickFromContactInformationFormCtx = useContext(
    ContactInformationFormContentContext
  ).goBackBtnClickHandler;

  const initialClasses = {
    opacity: 0.5,
    ...(useBgColor && { backgroundColor: properties.bodyBg }),
    boxShadow: "none",
    transform: "scale(0.9)",
    cursor: "pointer",
  };

  const hoverClasses = {
    opacity: 1,
    ...(useBgColor && { backgroundColor: properties.highlightRed }),
    boxShadow: properties.boxShadow,
    transform: "scale(1)",
  };

  const activeClasses = {
    ...hoverClasses,
    ...(canClickWhileActive ? {} : { cursor: "not-allowed" }),
  };

  const basicClasses = {
    ...initialClasses,
    transform: "scale(1)",
  };

  const disabledClasses = {
    ...basicClasses,
    opacity: 0.3,
    cursor: "not-allowed",
  };

  ["px", "py"].forEach((additionalTailwindCSSProperty) => {
    const additionalTailwindCSSKey =
      additionalTailwindCSSProperty as keyof typeof additionalTailwindCSS;
    if (
      additionalTailwindCSS &&
      !additionalTailwindCSS[additionalTailwindCSSKey]
    )
      additionalTailwindCSS[additionalTailwindCSSKey] =
        defaultAdditionalTailwindCSS[additionalTailwindCSSKey];
  });

  return (
    <AnimatePresence mode="wait">
      <motion.button
        type={type}
        {...props}
        className={`${useBorder ? "border-highlightRed border-2" : ""} ${
          useRounded ? "rounded-lg" : ""
        } font-bold ${
          additionalTailwindCSS &&
          Object.values(additionalTailwindCSS).join(" ")
        }`}
        whileHover={
          disabled
            ? undefined
            : active
            ? canClickWhileActive
              ? basicClasses
              : undefined
            : hoverClasses
        }
        initial={initialClasses}
        animate={
          active ? activeClasses : disabled ? disabledClasses : basicClasses
        }
        disabled={(active && !canClickWhileActive) || disabled}
        key={passedKey}
        onClick={onClickFromContactInformationFormCtx || onClick}
      >
        {children}
      </motion.button>
    </AnimatePresence>
  );
}
