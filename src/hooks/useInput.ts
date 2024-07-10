import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useAppDispatch } from "./reduxStore";
import useDebouncing from "./useDebouncing";

export const useInput = function <T extends string | number>({
  stateValue,
  setStateValue,
  setStateAction,
  searchParamName,
  debouncingTime = 500,
  saveDebouncedStateInSearchParamsAndSessionStorage = true,
}: {
  stateValue?: T;
  setStateValue?:
    | Dispatch<SetStateAction<T>>
    | ((newState: T) => void)
    | Dispatch<SetStateAction<T>>;
  setStateAction?: ActionCreatorWithPayload<string, string>;
  searchParamName: string;
  debouncingTime?: number;
  saveDebouncedStateInSearchParamsAndSessionStorage?: boolean;
}) {
  const dispatch = useAppDispatch();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const [queryDebouncingState, setQueryDebouncingState] = useState<T>(
    stateValue!
  );

  const debouncingFn = useCallback(() => {
    setQueryDebouncingState(stateValue!);
    if (!saveDebouncedStateInSearchParamsAndSessionStorage) return;
    searchParams.set(searchParamName, JSON.stringify(stateValue));
    sessionStorage.setItem(searchParamName, JSON.stringify(stateValue));
    navigate(createUrlWithCurrentSearchParams({ searchParams, pathname }), {
      replace: true,
    });
  }, [
    searchParams,
    stateValue,
    pathname,
    navigate,
    searchParamName,
    saveDebouncedStateInSearchParamsAndSessionStorage,
  ]);

  useDebouncing(debouncingFn, stateValue !== undefined, debouncingTime);

  function handleInputChange(newValue: string) {
    stateValue !== undefined &&
      setStateValue &&
      setStateValue(
        typeof stateValue === "string"
          ? (newValue as T)
          : (parseFloat(newValue) as T)
      );
    stateValue !== undefined &&
      setStateAction &&
      dispatch(setStateAction(newValue));
  }

  return {
    handleInputChange,
    location,
    navigate,
    searchParams,
    queryDebouncingState,
  };
};
