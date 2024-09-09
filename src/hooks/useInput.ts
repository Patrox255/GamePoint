import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useAppDispatch } from "./reduxStore";
import useDebouncing from "./useDebouncing";
import useCompareComplexForUseMemo from "./useCompareComplexForUseMemo";

const sameTimeOccurrenceIdsAndArrays: {
  [key: string]: { [key: string]: number };
} = {};

export const useInput = function <
  stateType extends string | number | (string | Date)
>({
  stateValue,
  setStateValue,
  setStateAction,
  searchParamName,
  debouncingTime = 500,
  saveDebouncedStateInSearchParams = true,
  saveDebouncedStateInSessionStorage = true,
  sameTimeOccurrenceChanceId,
  defaultStateValueInCaseOfCreatingStateHere,
}: {
  stateValue?: stateType;
  setStateValue?:
    | Dispatch<SetStateAction<stateType>>
    | ((newState: stateType) => void)
    | Dispatch<SetStateAction<stateType>>;
  setStateAction?: ActionCreatorWithPayload<string, string>;
  searchParamName: string;
  debouncingTime?: number;
  saveDebouncedStateInSearchParams?: boolean;
  saveDebouncedStateInSessionStorage?: boolean;
  sameTimeOccurrenceChanceId?: string;
  defaultStateValueInCaseOfCreatingStateHere?: stateType;
}) {
  const dispatch = useAppDispatch();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const [queryDebouncingState, setQueryDebouncingState] = useState<stateType>(
    stateValue!
  );
  const [queryState, setQueryState] = useState<stateType | undefined>(
    defaultStateValueInCaseOfCreatingStateHere
  );
  const usingExternalStateValue = stateValue !== undefined;
  const stateValueToSuperviseStable = useCompareComplexForUseMemo(
    usingExternalStateValue ? stateValue : queryState!
  );

  const initialStateValueToAvoidRecreatingHandleInputChangeFn =
    useRef<stateType>();
  if (
    !initialStateValueToAvoidRecreatingHandleInputChangeFn.current &&
    stateValueToSuperviseStable !==
      initialStateValueToAvoidRecreatingHandleInputChangeFn.current
  ) {
    initialStateValueToAvoidRecreatingHandleInputChangeFn.current =
      stateValueToSuperviseStable;
  }

  useEffect(() => {
    if (!sameTimeOccurrenceChanceId) return;

    if (
      sameTimeOccurrenceIdsAndArrays[sameTimeOccurrenceChanceId] !== undefined
    ) {
      if (
        sameTimeOccurrenceIdsAndArrays[sameTimeOccurrenceChanceId][
          searchParamName
        ]
      )
        return;
      sameTimeOccurrenceIdsAndArrays[sameTimeOccurrenceChanceId][
        searchParamName
      ] = [
        ...Object.entries(
          sameTimeOccurrenceIdsAndArrays[sameTimeOccurrenceChanceId]
        ),
      ].length;
    } else {
      sameTimeOccurrenceIdsAndArrays[sameTimeOccurrenceChanceId] = {
        [searchParamName]: 0,
      };
    }
  }, [sameTimeOccurrenceChanceId, searchParamName]);

  const debouncingFn = useCallback(() => {
    setQueryDebouncingState(stateValueToSuperviseStable!);
    if (saveDebouncedStateInSessionStorage)
      sessionStorage.setItem(
        searchParamName,
        JSON.stringify(stateValueToSuperviseStable)
      );
    if (saveDebouncedStateInSearchParams) {
      searchParams.set(
        searchParamName,
        JSON.stringify(stateValueToSuperviseStable)
      );
      navigate(createUrlWithCurrentSearchParams({ searchParams, pathname }), {
        replace: true,
      });
    }
  }, [
    stateValueToSuperviseStable,
    saveDebouncedStateInSessionStorage,
    searchParamName,
    saveDebouncedStateInSearchParams,
    searchParams,
    navigate,
    pathname,
  ]);

  useDebouncing(
    debouncingFn,
    stateValueToSuperviseStable !== undefined &&
      stateValueToSuperviseStable !== queryDebouncingState,
    debouncingTime +
      (sameTimeOccurrenceChanceId &&
      sameTimeOccurrenceIdsAndArrays[sameTimeOccurrenceChanceId] !==
        undefined &&
      sameTimeOccurrenceIdsAndArrays[sameTimeOccurrenceChanceId][
        searchParamName
      ] !== undefined
        ? sameTimeOccurrenceIdsAndArrays[sameTimeOccurrenceChanceId][
            searchParamName
          ] * 50
        : 0)
  );

  const handleInputChange = useCallback(
    (newValue: stateType) => {
      if (stateValueToSuperviseStable === undefined) return;
      const setStateArg =
        typeof stateValueToSuperviseStable === "string" ||
        typeof stateValueToSuperviseStable === "object"
          ? (newValue as stateType)
          : (parseFloat(newValue as string) as stateType);
      usingExternalStateValue
        ? setStateValue && setStateValue(setStateArg)
        : setQueryState(setStateArg);
      typeof newValue === "string" &&
        setStateAction &&
        dispatch(setStateAction(newValue));
    },
    [
      dispatch,
      setStateAction,
      setStateValue,
      stateValueToSuperviseStable,
      usingExternalStateValue,
    ]
  );

  return {
    handleInputChange,
    location,
    navigate,
    searchParams,
    queryDebouncingState,
    setQueryDebouncingState,
    inputValueInCaseOfCreatingStateHere: queryState,
  };
};
