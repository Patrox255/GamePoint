import { AnimationProps, motion } from "framer-motion";
import { ReactNode, useContext } from "react";
import { HeaderLinkContext } from "./HeaderLink";

export const defaultMediumHeaderTailwindCSS = "text-xl pb-2 font-bold inline";

export default function HeaderMedium({
  children,
  motionAnimationProperties,
}: {
  children: ReactNode;
  motionAnimationProperties?: AnimationProps;
}) {
  const { headerAnimationProps } = useContext(HeaderLinkContext);
  const usesHeaderLinkContext = Object.keys(headerAnimationProps).length !== 0;

  return (
    <motion.h2
      className={`${defaultMediumHeaderTailwindCSS} ${
        usesHeaderLinkContext ? "cursor-pointer" : "text-highlightRed"
      }`}
      {...motionAnimationProperties}
      {...(usesHeaderLinkContext ? headerAnimationProps : {})}
    >
      {children}
    </motion.h2>
  );
}
