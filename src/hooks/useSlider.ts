import { Reducer, useCallback, useEffect, useReducer, useRef } from "react";

const getNewElementIndex = (
  curActiveElementIndex: number,
  elementsLength: number,
  operation: availableIndexManipulationOperations = "increment"
) =>
  operation === "increment"
    ? curActiveElementIndex === elementsLength - 1
      ? 0
      : curActiveElementIndex + 1
    : curActiveElementIndex === 0
    ? elementsLength - 1
    : curActiveElementIndex - 1;

type availableIndexManipulationOperations = "increment" | "decrement";

export type additionalActionsAfterChangingElementFnForUseSlider = (
  newArtworkIndex: number
) => void | (() => void);

export type newStateIndexOrFnRelyingOnCurState =
  | number
  | ((curStateIndex: number) => number);

export type manageExternalStateInsteadOfTheOneInUseSliderFn = (
  newStateIndexOrFnRelyingOnCurState: newStateIndexOrFnRelyingOnCurState
) => void;

interface ISliderReducerState {
  activeElementIndexState: number;
  canCount: boolean;
  wentBackToTheLastElement: boolean;
  wentAheadToTheFirstElement: boolean;
  elementsLength: number;
  programaticallyStartTimer: boolean;
}

type sliderReducerChangeIndexAction = {
  type: "CHANGE_ACTIVE_ELEMENT_INDEX";
  payload?: {
    operation?: availableIndexManipulationOperations;
    newActiveElementIndex?: number;
  };
};

type sliderReducerChangeCanCountAction = {
  type: "CHANGE_CAN_COUNT";
  payload: { newCanCount: boolean };
};

type sliderReducerResetWentBackOrAheadState = {
  type: "RESET_WENT_BACK_OR_AHEAD_STATE";
};

type sliderReducerActions =
  | sliderReducerChangeCanCountAction
  | sliderReducerChangeIndexAction
  | sliderReducerResetWentBackOrAheadState;

type sliderReducerType = Reducer<ISliderReducerState, sliderReducerActions>;

const sliderReducer: sliderReducerType = function (state, action) {
  const elementsLength = state.elementsLength;
  const programaticallyStartTimer = state.programaticallyStartTimer;
  switch (action.type) {
    case "CHANGE_ACTIVE_ELEMENT_INDEX": {
      const { payload } = action;
      const operation = payload?.operation;
      const newActiveElementIndex =
        payload?.newActiveElementIndex ??
        getNewElementIndex(
          state.activeElementIndexState,
          elementsLength,
          operation
        );
      return {
        ...state,
        activeElementIndexState: newActiveElementIndex,
        canCount: programaticallyStartTimer ? false : true,
        wentAheadToTheFirstElement:
          operation === "increment" && newActiveElementIndex === 0
            ? true
            : false,
        wentBackToTheLastElement:
          operation === "decrement" &&
          newActiveElementIndex === elementsLength - 1
            ? true
            : false,
      };
    }
    case "CHANGE_CAN_COUNT": {
      const {
        payload: { newCanCount },
      } = action;
      return { ...state, canCount: newCanCount };
    }
    case "RESET_WENT_BACK_OR_AHEAD_STATE": {
      return {
        ...state,
        wentAheadToTheFirstElement: false,
        wentBackToTheLastElement: false,
      };
    }
    default:
      return state;
  }
};

const defaultSliderReducerState: ISliderReducerState = {
  activeElementIndexState: 0,
  wentAheadToTheFirstElement: false,
  wentBackToTheLastElement: false,
  canCount: true,
  elementsLength: 0,
  programaticallyStartTimer: false,
};

export const useSlider = function <T, Y>({
  elements,
  changeElementInterval,
  programaticallyStartTimer = false,
  additionalActionsAfterChangingElementFn,
  manageExternalStateInsteadOfTheOneHereFn,
  externalState,
  findCurrentElementsIndexBasedOnCurrentExternalState = (externalState: Y) =>
    (element: T) =>
      element === (externalState as unknown as T),
  additionalActionUponReachingTheBeginningByGoingForwardInTheEnd,
  additionalActionUponReachingTheEndByGoingBackwardsInTheBeginning,
}: {
  elements: T[];
  changeElementInterval: number;
  programaticallyStartTimer: boolean;
  additionalActionsAfterChangingElementFn?: additionalActionsAfterChangingElementFnForUseSlider;
  manageExternalStateInsteadOfTheOneHereFn?: manageExternalStateInsteadOfTheOneInUseSliderFn;
  externalState?: Y;
  findCurrentElementsIndexBasedOnCurrentExternalState?: (
    externalState: Y
  ) => (element: T, index?: number) => boolean;
  additionalActionUponReachingTheBeginningByGoingForwardInTheEnd?: () => void;
  additionalActionUponReachingTheEndByGoingBackwardsInTheBeginning?: () => void;
}) {
  const [state, dispatch] = useReducer(sliderReducer, {
    ...defaultSliderReducerState,
    canCount: !programaticallyStartTimer,
    elementsLength: elements.length,
    programaticallyStartTimer,
  });

  const {
    activeElementIndexState,
    canCount,
    wentAheadToTheFirstElement,
    wentBackToTheLastElement,
  } = state;

  // const [activeElementIndexState, setActiveElementIndexState] =
  //   useState<number>(0);
  // const canCount = useRef<boolean>(programaticallyStartTimer ? false : true);
  // const setCanCount = (newCanCount: boolean) =>
  //   (canCount.current = newCanCount);
  // const [wentBackToTheLastElement, setWentBackToTheLastElement] =
  //   useState<boolean>(false);
  // const [wentAheadToTheFirstElement, setWentAheadToTheFirstElement] =
  //   useState<boolean>(false);

  // const setActiveElementIndex = manageExternalStateInsteadOfTheOneHereFn
  //   ? manageExternalStateInsteadOfTheOneHereFn
  //   : setActiveElementIndexState;
  const activeElementIndex =
    externalState && findCurrentElementsIndexBasedOnCurrentExternalState
      ? elements.findIndex(
          findCurrentElementsIndexBasedOnCurrentExternalState(externalState)
        )
      : activeElementIndexState;

  console.log(
    activeElementIndex,
    wentAheadToTheFirstElement,
    wentBackToTheLastElement
  );

  // const changeActiveElementIndex = useCallback(
  //   (operation: "increment" | "decrement" = "increment") => {
  //     let newArtworkIndex: number;
  //     setActiveElementIndex((curActiveElementIndex) => {
  //       newArtworkIndex = getNewElementIndex(
  //         curActiveElementIndex,
  //         elements.length,
  //         operation
  //       );
  //       programaticallyStartTimer && setCanCount(false);
  //       return newArtworkIndex;
  //     });
  //   },
  //   [elements.length, programaticallyStartTimer, setActiveElementIndex]
  // );

  useEffect(() => {
    additionalActionsAfterChangingElementFn &&
      additionalActionsAfterChangingElementFn(activeElementIndex);
  }, [activeElementIndex, additionalActionsAfterChangingElementFn]);

  useEffect(() => {
    if (
      (!wentAheadToTheFirstElement && !wentBackToTheLastElement) ||
      (!additionalActionUponReachingTheBeginningByGoingForwardInTheEnd &&
        !additionalActionUponReachingTheEndByGoingBackwardsInTheBeginning)
    )
      return;
    additionalActionUponReachingTheBeginningByGoingForwardInTheEnd &&
      wentAheadToTheFirstElement &&
      additionalActionUponReachingTheBeginningByGoingForwardInTheEnd();
    additionalActionUponReachingTheEndByGoingBackwardsInTheBeginning &&
      wentBackToTheLastElement &&
      additionalActionUponReachingTheEndByGoingBackwardsInTheBeginning();
    dispatch({ type: "RESET_WENT_BACK_OR_AHEAD_STATE" });
  }, [
    additionalActionUponReachingTheBeginningByGoingForwardInTheEnd,
    additionalActionUponReachingTheEndByGoingBackwardsInTheBeginning,
    wentAheadToTheFirstElement,
    wentBackToTheLastElement,
  ]);

  const currentInterval = useRef<number>(changeElementInterval);

  useEffect(() => {
    if (elements.length <= 1) return;
    if (manageExternalStateInsteadOfTheOneHereFn) return;
    const timer = setInterval(() => {
      if (!canCount) return;
      currentInterval.current -= 50;
      if (currentInterval.current === 0) {
        dispatch({
          type: "CHANGE_ACTIVE_ELEMENT_INDEX",
        });
        currentInterval.current = changeElementInterval;
      }
    }, 50);
    return () => (timer ? clearInterval(timer) : undefined);
  }, [
    changeElementInterval,
    canCount,
    elements.length,
    activeElementIndex,
    manageExternalStateInsteadOfTheOneHereFn,
    programaticallyStartTimer,
  ]);

  useEffect(() => {
    currentInterval.current = changeElementInterval;
  }, [activeElementIndex, changeElementInterval]);

  const setActiveElementStable = useCallback(
    (newActiveElementIndex: number) => {
      dispatch({
        type: "CHANGE_ACTIVE_ELEMENT_INDEX",
        payload: { newActiveElementIndex },
      });
    },
    []
  );

  const setCanCountStable = useCallback(
    (newCanCount: boolean) =>
      dispatch({ type: "CHANGE_CAN_COUNT", payload: { newCanCount } }),
    []
  );

  const changeActiveElementIndex = useCallback(
    (operation: availableIndexManipulationOperations = "increment") => {
      if (!manageExternalStateInsteadOfTheOneHereFn)
        return dispatch({
          type: "CHANGE_ACTIVE_ELEMENT_INDEX",
          payload: { operation },
        });
      const newElementIndex = getNewElementIndex(
        activeElementIndex,
        elements.length,
        operation
      );
      console.log(
        newElementIndex,
        activeElementIndex,
        elements.length,
        operation
      );
      manageExternalStateInsteadOfTheOneHereFn(newElementIndex);
      dispatch({
        type: "CHANGE_ACTIVE_ELEMENT_INDEX",
        payload: { operation, newActiveElementIndex: newElementIndex },
      });
    },
    [
      activeElementIndex,
      elements.length,
      manageExternalStateInsteadOfTheOneHereFn,
    ]
  );

  return {
    activeElementIndex: activeElementIndex,
    setActiveElementIndex: setActiveElementStable,
    changeActiveElementIndex,
    setCanCount: setCanCountStable,
    canCount,
  };
};
