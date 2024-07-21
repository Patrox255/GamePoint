import { motion } from "framer-motion";
import { ReactNode, useContext } from "react";
import { DropDownMenuContext } from "./DropDownMenuWrapper";
import Error from "../Error";

export default function DropDownMenuDroppedElementsContainer({
  children,
  customPaddingsTailwindClasses,
}: {
  children: ReactNode;
  customPaddingsTailwindClasses?: {
    px?: string;
    py?: string;
  };
}) {
  const { showResults } = useContext(DropDownMenuContext);

  if (showResults === undefined)
    return (
      <Error message="Dropdown menu elements container must be placed inside dropdown menu wrapper!" />
    );

  return (
    <motion.div
      className={`dropdown-menu-elements-container bg-darkerBg ${
        customPaddingsTailwindClasses?.py
          ? customPaddingsTailwindClasses.py
          : "py-5"
      } ${
        customPaddingsTailwindClasses?.px
          ? customPaddingsTailwindClasses.px
          : "px-3"
      } absolute bottom-0 translate-y-[100%] flex justify-center overflow-y-auto overflow-x-clip max-h-[40vh] z-100 w-full ${
        showResults ? "pointer-events-auto" : "pointer-events-none"
      }`}
      initial={{ opacity: 0 }}
      animate={{
        opacity: showResults ? 1 : 0,
      }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}
