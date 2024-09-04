import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";
import useDebouncing from "./useDebouncing";
import generateInitialStateFromSearchParams from "../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import useCompareComplexForUseMemo from "./useCompareComplexForUseMemo";

export const useStateWithSearchParams = function <T>(
  initialStateStable: T,
  searchParamName: string,
  pathName?: string,
  useDebouncingTimeout: boolean = true,
  storeEvenInitialValue: boolean = true
) {
  const { search, pathname } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const navigate = useNavigate();

  const initialValueForUseState = generateInitialStateFromSearchParams(
    initialStateStable,
    searchParams,
    searchParamName
  );

  const [state, setState] = useState<T>(initialValueForUseState);
  const [debouncingState, setDebouncingState] = useState<T>(
    initialValueForUseState
  );

  const stateStable = useCompareComplexForUseMemo(state);
  const debouncingStateStable = useCompareComplexForUseMemo(debouncingState);

  const debouncingFn = useCallback(() => {
    setDebouncingState(stateStable);
    if (!searchParamName) return;
    const navigateToRefreshChangedSearchParams = () =>
      navigate(
        createUrlWithCurrentSearchParams({
          searchParams,
          pathname: pathName ? pathName : pathname,
        }),
        { replace: true }
      );
    if (!storeEvenInitialValue && stateStable === initialStateStable) {
      searchParams.delete(searchParamName);
      sessionStorage.removeItem(searchParamName);
      navigateToRefreshChangedSearchParams();
      return;
    }
    searchParams.set(searchParamName, JSON.stringify(stateStable));
    sessionStorage.setItem(searchParamName, JSON.stringify(stateStable));
    navigateToRefreshChangedSearchParams();
  }, [
    stateStable,
    searchParamName,
    storeEvenInitialValue,
    initialStateStable,
    searchParams,
    navigate,
    pathName,
    pathname,
  ]);
  useDebouncing(
    debouncingFn,
    debouncingState != state,
    useDebouncingTimeout ? 500 : 0
  );

  const setStateWithSearchParams = useCallback((newState: T) => {
    setState(newState);
  }, []);

  return {
    state: stateStable,
    setStateWithSearchParams,
    searchParams,
    debouncingState: debouncingStateStable,
  };
};
