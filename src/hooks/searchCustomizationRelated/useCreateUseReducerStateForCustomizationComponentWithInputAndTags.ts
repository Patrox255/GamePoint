import { Reducer, useCallback, useMemo, useReducer } from "react";
import { Location, NavigateFunction } from "react-router-dom";

import generateInitialStateFromSearchParamsOrSessionStorage from "../../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import useChangeSearchParamsAndSessionStorageWhenUseReducerChanges from "../useChangeSearchParamsWhenUseReducerChanges";
import useCompareComplexForUseMemo from "../useCompareComplexForUseMemo";
import removeRandomElementFromAnArray from "../../helpers/removeRandomElementFromAnArray";

type ISelectedTagsProperty = string[];

export interface ISelectedTags {
  stateArr: ISelectedTagsProperty;
  debouncedStateArr: ISelectedTagsProperty;
}

export type ISelectedTagsReducer =
  | {
      type: "CHANGE_DEBOUNCED_STATE";
      payload: {
        newStateArr: ISelectedTagsProperty;
      };
    }
  | {
      type: "ADD_VALUE_TO_ARR" | "REMOVE_VALUE_FROM_ARR";
      payload: {
        value: string;
      };
    }
  | {
      type: "RESET";
    };

const selectedTagsReducerGenerator: (
  maxAmountOfSelectedTags?: number
) => Reducer<ISelectedTags, ISelectedTagsReducer> = (maxAmountOfSelectedTags) =>
  function (state: ISelectedTags, action: ISelectedTagsReducer) {
    const { type } = action;
    switch (type) {
      case "ADD_VALUE_TO_ARR": {
        const {
          payload: { value },
        } = action;
        const { stateArr } = state;
        return state.stateArr.includes(value!)
          ? state
          : {
              ...state,
              stateArr: [
                ...(maxAmountOfSelectedTags &&
                stateArr.length >= maxAmountOfSelectedTags
                  ? removeRandomElementFromAnArray(stateArr)
                  : stateArr),
                value,
              ],
            };
      }
      case "REMOVE_VALUE_FROM_ARR": {
        const {
          payload: { value },
        } = action;
        return {
          ...state,
          stateArr: state.stateArr.filter(
            (existingValue) => existingValue !== value
          ),
        };
      }
      case "CHANGE_DEBOUNCED_STATE": {
        const {
          payload: { newStateArr },
        } = action;
        return { ...state, debouncedStateArr: [...newStateArr!] };
      }
      case "RESET":
        return { ...state, stateArr: [] };

      default:
        return state;
    }
  };

export default function useCreateUseReducerStateForCustomizationComponentWithInputAndTags({
  location,
  navigate,
  searchParams,
  searchParamName,
  omitChangingSearchParams,
  maxAmountOfSelectedTags,
}: {
  location: Location;
  navigate: NavigateFunction;
  searchParams: URLSearchParams;
  searchParamName: string;
  omitChangingSearchParams?: boolean;
  maxAmountOfSelectedTags?: number;
}) {
  const initialSelectedTagsState: ISelectedTags = {
    stateArr: generateInitialStateFromSearchParamsOrSessionStorage(
      [],
      searchParams,
      searchParamName
    ),
    debouncedStateArr: generateInitialStateFromSearchParamsOrSessionStorage(
      [],
      searchParams,
      searchParamName
    ),
  };

  const selectedTagsReducer = useMemo(
    () => selectedTagsReducerGenerator(maxAmountOfSelectedTags),
    [maxAmountOfSelectedTags]
  );
  const [selectedTagsStateUnstable, selectedTagsDispatch] = useReducer(
    selectedTagsReducer,
    initialSelectedTagsState
  );
  const selectedTagsState = useCompareComplexForUseMemo(
    selectedTagsStateUnstable
  );

  const selectedTagsDispatchCallback = useCallback(
    (newState: ISelectedTagsProperty) => {
      selectedTagsDispatch({
        type: "CHANGE_DEBOUNCED_STATE",
        payload: { newStateArr: newState },
      });
    },
    []
  );

  useChangeSearchParamsAndSessionStorageWhenUseReducerChanges({
    stateNormalProperty: selectedTagsState.stateArr,
    stateDebouncedProperty: selectedTagsState.debouncedStateArr,
    location,
    navigate,
    searchParamName: searchParamName,
    dispatchCallbackFn: selectedTagsDispatchCallback,
    omitChangingSearchParams,
  });

  return { selectedTagsState, selectedTagsDispatch };
}
