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
}: {
  stateValue?: T;
  setStateValue?: Dispatch<SetStateAction<T>> | ((newState: T) => void);
  setStateAction?: ActionCreatorWithPayload<string, string>;
  searchParamName: string;
  debouncingTime?: number;
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
    searchParams.set(searchParamName, stateValue! + "");
    navigate(createUrlWithCurrentSearchParams({ searchParams, pathname }), {
      replace: true,
    });
  }, [searchParams, stateValue, pathname, navigate, searchParamName]);

  useDebouncing(debouncingFn, stateValue !== undefined, debouncingTime);

  function handleInputChange(newValue: string) {
    console.log(searchParamName, newValue, stateValue !== undefined);
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
