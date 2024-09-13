import { ReactNode, createContext, useRef } from "react";

import {
  additionalActionsAfterChangingElementFnForUseSlider,
  manageExternalStateInsteadOfTheOneInUseSliderFn,
  useSlider,
} from "../../../hooks/useSlider";
import AnimatedAppearance from "../../UI/AnimatedAppearance";
import { isEqual } from "lodash";

export const SliderContext = createContext<{
  activeElementIndex: number;
  changeActiveElementIndex: (operation: "increment" | "decrement") => void;
  setCanCountProductChange: (newCanCountState: boolean) => void;
  CanCountProductChange: boolean;
}>({
  activeElementIndex: -1,
  changeActiveElementIndex: () => {},
  setCanCountProductChange: () => {},
  CanCountProductChange: false,
});

export default function DataSlider<ElementInterface, Y>({
  elements,
  children,
  additionalActionsAfterChangingElementFnForUseSlider,
  manageExternalStateInsteadOfTheOneHereFn,
  externalState,
  findCurrentElementsIndexBasedOnCurrentExternalState,
  additionalActionUponReachingTheBeginningByGoingForwardInTheEnd,
  additionalActionUponReachingTheEndByGoingBackwardsInTheBeginning,
  customSliderContainerWidthTailwindClass = "w-4/5",
}: {
  elements: ElementInterface[];
  children: ReactNode;
  additionalActionsAfterChangingElementFnForUseSlider?: additionalActionsAfterChangingElementFnForUseSlider;
  manageExternalStateInsteadOfTheOneHereFn?: manageExternalStateInsteadOfTheOneInUseSliderFn;
  externalState?: Y;
  findCurrentElementsIndexBasedOnCurrentExternalState?: (
    externalState: Y
  ) => (element: ElementInterface, index?: number) => boolean;
  additionalActionUponReachingTheBeginningByGoingForwardInTheEnd?: () => void;
  additionalActionUponReachingTheEndByGoingBackwardsInTheBeginning?: () => void;
  customSliderContainerWidthTailwindClass?: string;
}) {
  const stableElements = useRef<ElementInterface[]>();
  if (!stableElements.current) stableElements.current = elements;
  if (!isEqual(elements, stableElements)) stableElements.current = elements;

  const {
    activeElementIndex,
    changeActiveElementIndex,
    setCanCount: setCanCountProductChange,
    canCount: CanCountProductChange,
  } = useSlider({
    elements: stableElements.current,
    changeElementInterval: 20000,
    programaticallyStartTimer: true,
    additionalActionsAfterChangingElementFn:
      additionalActionsAfterChangingElementFnForUseSlider,
    manageExternalStateInsteadOfTheOneHereFn,
    externalState,
    findCurrentElementsIndexBasedOnCurrentExternalState,
    additionalActionUponReachingTheBeginningByGoingForwardInTheEnd,
    additionalActionUponReachingTheEndByGoingBackwardsInTheBeginning,
  });

  return (
    <AnimatedAppearance>
      <div
        className={`data-slider-container flex justify-center items-center text-center gap-8 ${customSliderContainerWidthTailwindClass}`}
      >
        <SliderContext.Provider
          value={{
            activeElementIndex,
            changeActiveElementIndex,
            setCanCountProductChange,
            CanCountProductChange,
          }}
        >
          {children}
        </SliderContext.Provider>
      </div>
    </AnimatedAppearance>
  );
}
