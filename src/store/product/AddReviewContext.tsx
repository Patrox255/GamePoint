import {
  createContext,
  ReactNode,
  Reducer,
  useCallback,
  useReducer,
  useState,
} from "react";
import { useInput } from "../../hooks/useInput";
import generateInitialStateFromSearchParamsOrSessionStorage from "../../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import { useLocation } from "react-router-dom";
import useChangeSearchParamsWhenUseReducerChanges from "../../hooks/useChangeSearchParamsWhenUseReducerChanges";

interface ICriterion {
  criterionName: string;
  rating: number | null;
}

type currentlyHoveredCriterionState =
  | {
      index: number;
      rating: number;
    }
  | undefined;

export const AddReviewContext = createContext<{
  content: string;
  debouncedContent: string;
  handleContentChange: (newContent: string) => void;
  criteria: ICriterion[];
  debouncedCriteria: ICriterion[];
  criteriaDispatch: React.Dispatch<IAddReviewCriteriaAction>;
  currentlyHoveredCriterion: currentlyHoveredCriterionState;
  setCurrentlyHoveredCriterion: React.Dispatch<
    React.SetStateAction<currentlyHoveredCriterionState>
  >;
}>({
  content: "",
  debouncedContent: "",
  handleContentChange: () => {},
  criteria: [],
  debouncedCriteria: [],
  criteriaDispatch: () => {},
  currentlyHoveredCriterion: undefined,
  setCurrentlyHoveredCriterion: () => {},
});

type AddReviewCriteriaReducerActionTypes =
  | "ADD_CRITERION"
  | "REMOVE_CRITERION"
  | "CHANGE_STATE"
  | "CHANGE_CRITERION";

interface IAddReviewCriteriaAction {
  type: AddReviewCriteriaReducerActionTypes;
  payload: {
    newState?: ICriterion[];
    newCriterionName?: string;
    debouncedExecution?: boolean;
    criterionId?: number;
    newCriterionRating?: number | null;
  };
}

const AddReviewCriteriaReducer: Reducer<
  { criteria: ICriterion[]; debouncedCriteria: ICriterion[] },
  IAddReviewCriteriaAction
> = function (state, action) {
  const {
    type,
    payload: {
      newState,
      newCriterionName,
      debouncedExecution,
      criterionId,
      newCriterionRating,
    },
  } = action;
  const newCriteriaState = { ...state };
  switch (type) {
    case "ADD_CRITERION": {
      newCriteriaState.criteria = [
        ...state.criteria,
        {
          criterionName: "",
          rating: null,
        },
      ];
      return newCriteriaState;
    }
    case "REMOVE_CRITERION": {
      newCriteriaState.criteria = state.criteria.filter(
        (_, i) => i !== criterionId
      );
      return newCriteriaState;
    }
    case "CHANGE_STATE":
      return {
        ...state,
        ...(debouncedExecution
          ? { debouncedCriteria: newState! }
          : { criteria: newState! }),
      };

    case "CHANGE_CRITERION": {
      const criterionToChangeIndex = state.criteria.findIndex(
        (_, i) => i === criterionId
      );
      const newCriteria = state.criteria.map((criterionObj, i) =>
        i === criterionToChangeIndex
          ? {
              ...criterionObj,
              ...(newCriterionName !== undefined && {
                criterionName: newCriterionName,
              }),
              ...(newCriterionRating !== undefined && {
                rating: newCriterionRating,
              }),
            }
          : criterionObj
      ) as ICriterion[];
      return { ...newCriteriaState, criteria: newCriteria };
    }
    default:
      return state;
  }
};

export default function AddReviewContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();
  const { search } = location;
  const searchParams = new URLSearchParams(search);

  const initialReviewContent =
    generateInitialStateFromSearchParamsOrSessionStorage(
      "",
      searchParams,
      "reviewContent"
    );
  const [reviewContent, setReviewContent] =
    useState<string>(initialReviewContent);
  const { queryDebouncingState, handleInputChange, navigate } = useInput({
    searchParamName: "reviewContent",
    stateValue: reviewContent,
    setStateValue: setReviewContent,
    debouncingTime: 300,
  });

  const initialCriteriaProperty =
    generateInitialStateFromSearchParamsOrSessionStorage(
      [{ criterionName: "", criterionNameDebounced: "", rating: null }],
      searchParams,
      "reviewCriteria"
    );
  const [criteriaState, criteriaDispatch] = useReducer(
    AddReviewCriteriaReducer,
    {
      criteria: initialCriteriaProperty,
      debouncedCriteria: initialCriteriaProperty,
    }
  );

  const criteriaDispatchHookCallback = useCallback(
    (newState: ICriterion[]) =>
      criteriaDispatch({
        type: "CHANGE_STATE",
        payload: { debouncedExecution: true, newState },
      }),
    []
  );

  useChangeSearchParamsWhenUseReducerChanges({
    stateNormalProperty: criteriaState.criteria,
    stateDebouncedProperty: criteriaState.debouncedCriteria,
    searchParamName: "reviewCriteria",
    location,
    navigate,
    dispatchCallbackFn: criteriaDispatchHookCallback,
    timeToWait: 300,
  });

  const [currentlyHoveredCriterion, setCurrentlyHoveredCriterion] =
    useState<currentlyHoveredCriterionState>(undefined);

  return (
    <AddReviewContext.Provider
      value={{
        content: reviewContent,
        debouncedContent: queryDebouncingState,
        handleContentChange: handleInputChange,
        criteriaDispatch,
        criteria: criteriaState.criteria,
        debouncedCriteria: criteriaState.debouncedCriteria,
        currentlyHoveredCriterion,
        setCurrentlyHoveredCriterion,
      }}
    >
      {children}
    </AddReviewContext.Provider>
  );
}
