import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";
import useDebouncing from "./useDebouncing";
import generateInitialStateFromSearchParams from "../helpers/generateInitialStateFromSearchParamsOrSessionStorage";

export const useStateWithSearchParams = function <T>(
  initialState: T,
  searchParamName: string,
  pathName?: string
) {
  const { search, pathname } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const navigate = useNavigate();

  const initialValueForUseState = generateInitialStateFromSearchParams(
    initialState,
    searchParams,
    searchParamName
  );

  const [state, setState] = useState<T>(initialValueForUseState);
  const [debouncingState, setDebouncingState] = useState<T>(
    initialValueForUseState
  );

  const debouncingFn = useCallback(() => {
    setDebouncingState(state);
    if (!searchParamName) return;
    searchParams.set(searchParamName, JSON.stringify(state));
    sessionStorage.setItem(searchParamName, JSON.stringify(state));
    navigate(
      createUrlWithCurrentSearchParams({
        searchParams,
        pathname: pathName ? pathName : pathname,
      }),
      { replace: true }
    );
  }, [searchParams, searchParamName, state, navigate, pathName, pathname]);
  useDebouncing(debouncingFn, debouncingState != state, 500);

  const setStateWithSearchParams = useCallback((newState: T) => {
    setState(newState);
  }, []);

  return { state, setStateWithSearchParams, searchParams, debouncingState };
};
