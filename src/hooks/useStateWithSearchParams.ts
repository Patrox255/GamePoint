import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";
import useDebouncing from "./useDebouncing";
import generateInitialStateFromSearchParams from "../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import useCompareComplexForUseMemo from "./useCompareComplexForUseMemo";
import { isEqual } from "lodash";

export const useStateWithSearchParams = function <T>({
  initialStateStable,
  searchParamName,
  storeEvenInitialValue = true,
  useDebouncingTimeout = true,
  pathName,
  storeStateOnlyInSessionStorage = false,
}: {
  initialStateStable: T;
  searchParamName: string;
  pathName?: string;
  useDebouncingTimeout?: boolean;
  storeEvenInitialValue?: boolean;
  storeStateOnlyInSessionStorage?: boolean;
}) {
  const { search, pathname } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const navigate = useNavigate();

  const initialValueForUseState = generateInitialStateFromSearchParams(
    initialStateStable,
    searchParams,
    searchParamName,
    undefined,
    undefined,
    !storeStateOnlyInSessionStorage
  );

  const [state, setState] = useState<T>(initialValueForUseState);
  const [debouncingState, setDebouncingState] = useState<T>(
    initialValueForUseState
  );

  const stateStable = useCompareComplexForUseMemo(state);
  const debouncingStateStable = useCompareComplexForUseMemo(debouncingState);

  const navigateToRefreshChangedSearchParams = useCallback(
    () =>
      navigate(
        createUrlWithCurrentSearchParams({
          searchParams,
          pathname: pathName ? pathName : pathname,
        }),
        { replace: true }
      ),
    [navigate, pathName, pathname, searchParams]
  );

  const updateSearchParamsAndSessionStorageStoredState = useCallback(
    (newState: T) => {
      if (!storeEvenInitialValue && isEqual(newState, initialStateStable)) {
        sessionStorage.removeItem(searchParamName);
        if (storeStateOnlyInSessionStorage) return;
        searchParams.delete(searchParamName);
        navigateToRefreshChangedSearchParams();
        return;
      }
      sessionStorage.setItem(searchParamName, JSON.stringify(newState));
      if (storeStateOnlyInSessionStorage) return;
      searchParams.set(searchParamName, JSON.stringify(newState));
      navigateToRefreshChangedSearchParams();
    },
    [
      initialStateStable,
      navigateToRefreshChangedSearchParams,
      searchParamName,
      searchParams,
      storeEvenInitialValue,
      storeStateOnlyInSessionStorage,
    ]
  );

  const debouncingFn = useCallback(() => {
    setDebouncingState(stateStable);
    if (!searchParamName) return;
    updateSearchParamsAndSessionStorageStoredState(stateStable);
  }, [
    stateStable,
    searchParamName,
    updateSearchParamsAndSessionStorageStoredState,
  ]);
  useDebouncing(
    debouncingFn,
    !isEqual(debouncingState, state),
    useDebouncingTimeout ? 500 : 0
  );

  const setStateWithSearchParams = useCallback((newState: T) => {
    setState(newState);
  }, []);

  const setNormalAndDebouncingState = useCallback(
    (newState: T) => {
      setState(newState);
      setDebouncingState(newState);
      updateSearchParamsAndSessionStorageStoredState(newState);
    },
    [updateSearchParamsAndSessionStorageStoredState]
  );

  return {
    state: stateStable,
    setStateWithSearchParams,
    searchParams,
    debouncingState: debouncingStateStable,
    setNormalAndDebouncingState,
  };
};
