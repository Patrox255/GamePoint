import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useAppDispatch } from "./reduxStore";
import useDebouncing from "./useDebouncing";

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
  const stateValueToSupervise = usingExternalStateValue
    ? stateValue
    : queryState!;

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
    setQueryDebouncingState(stateValueToSupervise!);
    if (saveDebouncedStateInSessionStorage)
      sessionStorage.setItem(
        searchParamName,
        JSON.stringify(stateValueToSupervise)
      );
    if (saveDebouncedStateInSearchParams) {
      searchParams.set(searchParamName, JSON.stringify(stateValueToSupervise));
      navigate(createUrlWithCurrentSearchParams({ searchParams, pathname }), {
        replace: true,
      });
    }
  }, [
    stateValueToSupervise,
    saveDebouncedStateInSessionStorage,
    searchParamName,
    saveDebouncedStateInSearchParams,
    searchParams,
    navigate,
    pathname,
  ]);

  useDebouncing(
    debouncingFn,
    stateValueToSupervise !== undefined &&
      stateValueToSupervise !== queryDebouncingState,
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

  function handleInputChange(newValue: stateType) {
    if (stateValueToSupervise === undefined) return;
    const setStateArg =
      typeof stateValueToSupervise === "string" ||
      typeof stateValueToSupervise === "object"
        ? (newValue as stateType)
        : (parseFloat(newValue as string) as stateType);
    usingExternalStateValue
      ? setStateValue && setStateValue(setStateArg)
      : setQueryState(setStateArg);
    typeof newValue === "string" &&
      setStateAction &&
      dispatch(setStateAction(newValue));
  }

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
