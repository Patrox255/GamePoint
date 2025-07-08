import { motion } from "framer-motion";
import {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DropDownMenuContext } from "./DropDownMenuWrapper";
import Error from "../Error";
import { debounce } from "lodash";
import windowMatchMediaQueries from "../../../helpers/windowMatchMediaQueries";

export default function DropDownMenuDroppedElementsContainer({
  children,
  customPaddingsTailwindClasses,
  lightTheme,
  extendWidthOnLowerResolutions = false,
  lowerResolutionQueryId = "lg",
}: {
  children: ReactNode;
  customPaddingsTailwindClasses?: {
    px?: string;
    py?: string;
  };
  lightTheme?: boolean;
  extendWidthOnLowerResolutions?: boolean;
  lowerResolutionQueryId?: keyof typeof windowMatchMediaQueries;
}) {
  const [dropdownMenuLowResolutionWidth, setDropdownMenuLowResolutionWidth] =
    useState<number>(0);
  const { showResults } = useContext(DropDownMenuContext);
  const dropdownMenuElementsContainerRef = useRef<HTMLDivElement>(null);
  const dropdownMenuElementsWrapperRef = useRef<
    HTMLDivElement | undefined | null
  >(undefined);

  const handleResizeDebounced = useMemo(
    () =>
      debounce(() => {
        if (!dropdownMenuElementsWrapperRef.current) {
          dropdownMenuElementsWrapperRef.current =
            dropdownMenuElementsContainerRef.current?.closest(
              ".drop-down-menu-wrapper"
            );
        }
        if (!dropdownMenuElementsWrapperRef.current) return;

        setDropdownMenuLowResolutionWidth(
          document.documentElement.clientWidth -
            dropdownMenuElementsWrapperRef.current.getBoundingClientRect().x
        );
      }, 200),
    []
  );

  useEffect(() => {
    if (!extendWidthOnLowerResolutions) return;
    window.addEventListener("resize", handleResizeDebounced);
    handleResizeDebounced();

    return () => {
      if (!extendWidthOnLowerResolutions) return;
      window.removeEventListener("resize", handleResizeDebounced);
    };
  }, [handleResizeDebounced, extendWidthOnLowerResolutions]);

  if (showResults === undefined)
    return (
      <Error message="Dropdown menu elements container must be placed inside dropdown menu wrapper!" />
    );

  return (
    <motion.div
      className={`dropdown-menu-elements-container ${
        lightTheme ? "bg-bodyBg" : "bg-darkerBg"
      } ${
        customPaddingsTailwindClasses?.py
          ? customPaddingsTailwindClasses.py
          : "py-5"
      } ${
        customPaddingsTailwindClasses?.px
          ? customPaddingsTailwindClasses.px
          : "px-3"
      } absolute bottom-0 left-0 translate-y-[100%] flex justify-center overflow-y-auto overflow-x-clip max-h-[40vh] z-30 lg:w-full ${
        showResults ? "pointer-events-auto" : "pointer-events-none"
      }`}
      initial={{ opacity: 0 }}
      animate={{
        opacity: showResults ? 1 : 0,
      }}
      exit={{ opacity: 0 }}
      ref={dropdownMenuElementsContainerRef}
      style={{
        ...(extendWidthOnLowerResolutions &&
          dropdownMenuLowResolutionWidth &&
          !windowMatchMediaQueries[lowerResolutionQueryId].matches && {
            width: dropdownMenuLowResolutionWidth + "px",
            marginRight: "1rem",
          }),
      }}
    >
      {children}
    </motion.div>
  );
}
