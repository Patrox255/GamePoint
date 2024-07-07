import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";
import useDebouncing from "./useDebouncing";
import generateInitialStateFromSearchParams from "../helpers/generateInitialStateFromSearchParams";

export const useStateWithSearchParams = function <T>(
  initialState: T,
  searchParamName: string,
  pathName?: string
) {
  const { search, pathname } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const searchParamValue = searchParams.get(searchParamName);
  const navigate = useNavigate();

  const [state, setState] = useState<T>(
    generateInitialStateFromSearchParams(initialState, searchParamValue)
  );

  const debouncingFn = useCallback(() => {
    searchParams.set(searchParamName, JSON.stringify(state));
    navigate(
      createUrlWithCurrentSearchParams({
        searchParams,
        pathname: pathName ? pathName : pathname,
      }),
      { replace: true }
    );
  }, [searchParams, searchParamName, state, navigate, pathName, pathname]);
  useDebouncing(debouncingFn, searchParamValue != state);

  const setStateWithSearchParams = useCallback((newState: T) => {
    console.log(newState);
    setState(newState);
  }, []);

  return { state, setStateWithSearchParams, searchParams };
};
