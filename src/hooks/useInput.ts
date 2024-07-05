import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useAppDispatch } from "./reduxStore";
import useDebouncing from "./useDebouncing";

export const useInput = function ({
  stateValue,
  setStateValue,
  setStateAction,
}: {
  stateValue?: string;
  setStateValue?: Dispatch<SetStateAction<string>>;
  setStateAction?: ActionCreatorWithPayload<string, string>;
}) {
  const dispatch = useAppDispatch();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  const debouncingFn = useCallback(() => {
    searchParams.set("query", stateValue!);
    navigate(createUrlWithCurrentSearchParams({ searchParams, pathname }), {
      replace: true,
    });
  }, [searchParams, stateValue, pathname, navigate]);

  useDebouncing(debouncingFn, stateValue !== undefined, 500);

  function handleInputChange(newValue: string) {
    stateValue !== undefined && setStateValue && setStateValue(newValue);
    stateValue !== undefined &&
      setStateAction &&
      dispatch(setStateAction(newValue));
  }

  return { handleInputChange, location, navigate, searchParams };
};
