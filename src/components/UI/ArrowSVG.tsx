import { motion } from "framer-motion";
import { useContext, useEffect, useMemo, useRef } from "react";
import { DatePickerInputFieldElementCtx } from "./DatePickerInputFieldElement";
import { debounce } from "lodash";
import { DatePickerDataSliderArrowIndicatorContext } from "../../store/UI/DatePickerDataSliderArrowIndicatorContext";
import { useWindowMatchMediaQueries } from "../../hooks/RWD/useWindowMatchMediaQueries";

export default function ArrowSVG({
  arrowSrc,
  alt,
  onClick,
  translateXVal = "-2rem",
  disabled = false,
  customWidthTailwindClass = "w-16",
  insideAlternateSliderLookTabsComponent = false,
  addPaddingWhenInsideAlternateSliderLookTabsComponent = false,
  arrowSvgHeightProp,
  setArrowSvgHeightProp,
}: {
  arrowSrc: string;
  alt: string;
  onClick: () => void;
  translateXVal?: string;
  disabled?: boolean;
  customWidthTailwindClass?: string;
  insideAlternateSliderLookTabsComponent?: boolean;
  addPaddingWhenInsideAlternateSliderLookTabsComponent?: boolean;
  arrowSvgHeightProp?: number | undefined;
  setArrowSvgHeightProp?: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
}) {
  const translateXParsedValue = parseFloat(translateXVal);
  const movingInReversedDirection = translateXParsedValue < 0;

  const {
    insideDatePicker,
    setArrowSvgHeight: setArrowSvgHeightFromDatePickerCtx,
    arrowSvgHeight: arrowSvgHeightFromDatePickerCtx,
  } = useContext(DatePickerInputFieldElementCtx);
  const arrowPlaceIndicator = useContext(
    DatePickerDataSliderArrowIndicatorContext
  );

  const arrowSvgHeight = insideDatePicker
    ? arrowSvgHeightFromDatePickerCtx
    : arrowSvgHeightProp;
  const setArrowSvgHeight = insideDatePicker
    ? setArrowSvgHeightFromDatePickerCtx
    : setArrowSvgHeightProp;

  const parsedWidthTailwindClass = parseInt(
    customWidthTailwindClass.slice(2),
    10
  );
  const oneArrowSvgRef = useRef<HTMLImageElement>(null);

  const appropriateMediaQueryMatchedForPushingArrow =
    !useWindowMatchMediaQueries("xs");

  const handleResizeEvent = useMemo(
    () =>
      debounce(
        () => {
          setArrowSvgHeight?.(
            oneArrowSvgRef.current?.getBoundingClientRect().height ?? 0
          );
        },

        200
      ),
    [setArrowSvgHeight]
  );

  useEffect(() => {
    if (arrowSvgHeight === undefined) return;
    window.addEventListener("resize", handleResizeEvent);

    return () => {
      window.removeEventListener("resize", handleResizeEvent);
    };
  }, [handleResizeEvent, arrowSvgHeight]);

  useEffect(() => {
    handleResizeEvent();
  }, [handleResizeEvent]);

  const pushArrow =
    arrowSvgHeight !== undefined && appropriateMediaQueryMatchedForPushingArrow;

  return (
    <motion.div
      className={`arrow-svg-control-container ${
        !disabled ? "cursor-pointer" : ""
      } ${insideAlternateSliderLookTabsComponent ? "absolute" : "absolute"} ${
        pushArrow && arrowPlaceIndicator === "lower" ? "" : "top-0"
      } ${
        !insideDatePicker && !insideAlternateSliderLookTabsComponent
          ? "sm:top-1/2"
          : ""
      } ${movingInReversedDirection ? "left-0" : "right-0"} z-10`}
      variants={{
        unHovered: {
          ...(!insideAlternateSliderLookTabsComponent ||
          addPaddingWhenInsideAlternateSliderLookTabsComponent
            ? movingInReversedDirection
              ? { paddingLeft: translateXVal.slice(1) }
              : { paddingRight: translateXVal }
            : {}),
        },
        hovered: {},
      }}
      initial="unHovered"
      whileHover={!disabled ? "hovered" : "unHovered"}
      onClick={!disabled ? onClick : undefined}
      style={{
        // Only happens when inside date picker
        ...(pushArrow &&
          arrowPlaceIndicator && {
            [arrowPlaceIndicator === "upper"
              ? "top"
              : "bottom"]: `-${arrowSvgHeight}px`,
          }),
      }}
    >
      <motion.img
        src={arrowSrc}
        className={`${customWidthTailwindClass} ${
          !parsedWidthTailwindClass ? "h-24" : `h-${parsedWidthTailwindClass}`
        }`}
        alt={alt}
        variants={{
          unHovered: { opacity: 0.5, transform: "translateX(0)" },
          hovered: {
            opacity: 1,
            transform: `translateX(${translateXVal})`,
          },
        }}
        ref={oneArrowSvgRef}
      />
    </motion.div>
  );
}
