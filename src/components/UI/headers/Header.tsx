import { AnimationProps, motion } from "framer-motion";
import { ReactNode, useContext } from "react";
import { HeaderLinkContext } from "./HeaderLink";

export const defaultHeaderTailwindCSS = "pb-2 font-bold inline";

const headerSizesProperties = {
  small: {
    element: motion.h3,
    tailwindSizeClass: "text-lg",
  },
  medium: {
    element: motion.h2,
    tailwindSizeClass: "text-xl",
  },
  large: {
    element: motion.h1,
    tailwindSizeClass: "text-4xl",
  },
};

export default function Header({
  children,
  motionAnimationProperties,
  usePaddingBottom = true,
  size = "medium",
}: {
  children: ReactNode;
  motionAnimationProperties?: AnimationProps;
  usePaddingBottom?: boolean;
  size?: "small" | "medium" | "large";
}) {
  const { headerAnimationProps } = useContext(HeaderLinkContext);
  const usesHeaderLinkContext = Object.keys(headerAnimationProps).length !== 0;

  const HeaderElement = headerSizesProperties[size].element;
  const headerSizeTailwindClass = headerSizesProperties[size].tailwindSizeClass;

  return (
    <HeaderElement
      className={`${headerSizeTailwindClass} ${
        usePaddingBottom
          ? defaultHeaderTailwindCSS
          : defaultHeaderTailwindCSS.replace("pb-2", "")
      } ${usesHeaderLinkContext ? "cursor-pointer" : "text-highlightRed"}`}
      {...motionAnimationProperties}
      {...(usesHeaderLinkContext ? headerAnimationProps : {})}
    >
      {children}
    </HeaderElement>
  );
}
