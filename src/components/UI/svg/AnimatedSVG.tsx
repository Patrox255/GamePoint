import { motion } from "framer-motion";
import properties from "../../../styles/properties";
import { ReactNode, useMemo } from "react";

const initialVariantAnimatedSVG = {
  opacity: 0.7,
  y: 0,
};
const hoverVariantAnimatedSVG = { y: -5, opacity: 1 };
const animateVariantAnimatedSVG = { opacity: 1 };

export default function AnimatedSVG({
  size,
  onClick,
  active = false,
  ableToClickWhileActive = false,
  onMouseEnter,
  onMouseLeave,
  hoverAnimation = true,
  svgPath,
  additionalTailwindClasses,
  defaultFill = properties.darkerBg,
  children,
  useVariants = false,
  modifyStrokeInsteadOfFill = false,
}: {
  size?: string;
  onClick?: () => void;
  active?: boolean;
  ableToClickWhileActive?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  hoverAnimation?: boolean;
  svgPath: ReactNode;
  additionalTailwindClasses?: string;
  defaultFill?: string;
  children?: ReactNode;
  useVariants?: boolean;
  modifyStrokeInsteadOfFill?: boolean;
}) {
  const initialVariantSVG = useMemo(
    () => ({
      ...initialVariantAnimatedSVG,
      ...(modifyStrokeInsteadOfFill
        ? { stroke: defaultFill }
        : { fill: defaultFill }),
    }),
    [defaultFill, modifyStrokeInsteadOfFill]
  );
  const hoverVariantSVG = useMemo(
    () => ({
      ...hoverVariantAnimatedSVG,
      ...(modifyStrokeInsteadOfFill
        ? { stroke: properties.highlightRed }
        : { fill: properties.highlightRed }),
    }),
    [modifyStrokeInsteadOfFill]
  );
  const animateVariantSVG = useMemo(
    () => ({
      ...animateVariantAnimatedSVG,
      ...(modifyStrokeInsteadOfFill
        ? { stroke: properties.highlightRed }
        : { fill: properties.highlightRed }),
    }),
    [modifyStrokeInsteadOfFill]
  );

  return (
    <motion.div
      className="flex"
      variants={
        useVariants
          ? {
              initial: initialVariantAnimatedSVG,
              hover: hoverVariantAnimatedSVG,
              animate: animateVariantAnimatedSVG,
            }
          : undefined
      }
      {...(useVariants && {
        initial: "initial",
        whileHover: hoverAnimation
          ? active
            ? ableToClickWhileActive
              ? "initial"
              : undefined
            : "hover"
          : undefined,

        animate: !active ? undefined : "animate",
      })}
    >
      <motion.svg
        {...(size && { width: size, height: size })}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={`${hoverAnimation ? "cursor-pointer" : undefined} ${
          additionalTailwindClasses ? additionalTailwindClasses : ""
        } lg:w-12 xs:w-6 w-4`}
        fill={defaultFill}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        variants={
          useVariants
            ? {
                initial: initialVariantSVG,
                hover: hoverVariantSVG,
                animate: animateVariantSVG,
              }
            : undefined
        }
        {...(!useVariants && {
          initial: initialVariantSVG,
          whileHover: hoverAnimation
            ? active
              ? ableToClickWhileActive
                ? initialVariantSVG
                : {}
              : hoverVariantSVG
            : {},
          animate: !active ? {} : { fill: properties.highlightRed, opacity: 1 },
        })}
      >
        {svgPath}
      </motion.svg>
      {children}
    </motion.div>
  );
}
