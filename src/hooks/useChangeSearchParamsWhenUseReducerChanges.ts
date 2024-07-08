import { useEffect, useMemo } from "react";
import { Location, NavigateFunction } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";

export default function useChangeSearchParamsWhenUseReducerChanges<T>({
  stateNormalProperty,
  stateDebouncedProperty,
  searchParamName,
  location,
  navigate,
  dispatchCallbackFn,
  timeToWait = 500,
}: {
  stateNormalProperty: T;
  stateDebouncedProperty: T;
  searchParamName: string;
  location: Location;
  navigate: NavigateFunction;
  dispatchCallbackFn: (newState: T, searchParamName: string) => void;
  timeToWait?: number;
}) {
  const { search, pathname } = location;
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  useEffect(() => {
    if (stateNormalProperty === stateDebouncedProperty) return;
    const timer = setTimeout(() => {
      dispatchCallbackFn(stateNormalProperty, searchParamName);
      searchParams.set(searchParamName, JSON.stringify(stateNormalProperty));
      navigate(createUrlWithCurrentSearchParams({ searchParams, pathname }), {
        replace: true,
      });
    }, timeToWait);
    return () => clearTimeout(timer);
  }, [
    stateNormalProperty,
    stateDebouncedProperty,
    searchParamName,
    navigate,
    pathname,
    searchParams,
    dispatchCallbackFn,
    timeToWait,
  ]);
}
