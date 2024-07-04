import { Dispatch, SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useAppDispatch } from "./reduxStore";

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
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  function handleInputChange(newValue: string) {
    searchParams.set("query", newValue);
    navigate(createUrlWithCurrentSearchParams({ searchParams, location }), {
      replace: true,
    });
    stateValue !== undefined && setStateValue && setStateValue(newValue);
    stateValue !== undefined &&
      setStateAction &&
      dispatch(setStateAction(newValue));
  }

  return { handleInputChange, location, navigate, searchParams };
};
