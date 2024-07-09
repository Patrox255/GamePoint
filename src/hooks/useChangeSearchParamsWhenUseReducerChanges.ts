import { useEffect, useMemo } from "react";
import { Location, NavigateFunction } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";

import useCompareComplexForUseMemo from "./useCompareComplexForUseMemo";
// import debounce from "lodash.debounce";

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

  const stableStateNormalProperty =
    useCompareComplexForUseMemo(stateNormalProperty);
  const stableStateDebouncedProperty = useCompareComplexForUseMemo(
    stateDebouncedProperty
  );

  const stateNormalPropertyMemoized = useMemo(
    () => stableStateNormalProperty,
    [stableStateNormalProperty]
  );
  const stateDebouncedPropertyMemoized = useMemo(
    () => stableStateDebouncedProperty,
    [stableStateDebouncedProperty]
  );

  console.log(stateNormalPropertyMemoized, stateDebouncedPropertyMemoized);

  useEffect(() => {
    if (stateNormalPropertyMemoized === stateDebouncedPropertyMemoized) return;
    console.log(
      "CHANGED",
      stateNormalPropertyMemoized,
      stateDebouncedPropertyMemoized
    );
    const timer = setTimeout(() => {
      dispatchCallbackFn(stateNormalPropertyMemoized, searchParamName);
      searchParams.set(
        searchParamName,
        JSON.stringify(stateNormalPropertyMemoized)
      );
      navigate(createUrlWithCurrentSearchParams({ searchParams, pathname }), {
        replace: true,
      });
    }, timeToWait);
    return () => clearTimeout(timer);
  }, [
    stateNormalPropertyMemoized,
    stateDebouncedPropertyMemoized,
    searchParamName,
    navigate,
    pathname,
    searchParams,
    dispatchCallbackFn,
    timeToWait,
  ]);

  // const debouncedUpdate = useMemo(
  //   () =>
  //     debounce((stateNormalProperty: T) => {
  //       dispatchCallbackFn(stateNormalProperty, searchParamName);
  //       searchParams.set(searchParamName, JSON.stringify(stateNormalProperty));
  //       navigate(createUrlWithCurrentSearchParams({ searchParams, pathname }), {
  //         replace: true,
  //       });
  //     }, timeToWait),
  //   [
  //     dispatchCallbackFn,
  //     navigate,
  //     pathname,
  //     searchParamName,
  //     searchParams,
  //     timeToWait,
  //   ]
  // );

  // useEffect(() => {
  //   if (stateNormalProperty === stateDebouncedProperty) return;

  //   debouncedUpdate(stateNormalProperty);

  //   return () => debouncedUpdate.cancel();
  // }, [debouncedUpdate, stateDebouncedProperty, stateNormalProperty]);
}
