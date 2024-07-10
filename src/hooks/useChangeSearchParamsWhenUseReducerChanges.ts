import { useEffect, useMemo } from "react";
import { Location, NavigateFunction } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";

import useCompareComplexForUseMemo, {
  are2ObjectsEqualTopLevel,
} from "./useCompareComplexForUseMemo";
import debounce from "lodash.debounce";

const idsOfDeeperStates: { [key: string]: { [key: string]: number } } = {};

export default function useChangeSearchParamsWhenUseReducerChanges<T>({
  stateNormalProperty,
  stateDebouncedProperty,
  searchParamName,
  location,
  navigate,
  dispatchCallbackFn,
  timeToWait = 500,
  idOfDeeperStateThatIsSentAndDispatchCanChangeIt,
  provideSearchParamNameToDispatch = false,
}: {
  stateNormalProperty: T;
  stateDebouncedProperty: T;
  searchParamName: string;
  location: Location;
  navigate: NavigateFunction;
  dispatchCallbackFn: (
    newState: T,
    searchParamName: string
  ) => void | ((newState: T) => void);
  timeToWait?: number;
  idOfDeeperStateThatIsSentAndDispatchCanChangeIt?: string;
  provideSearchParamNameToDispatch?: boolean;
}) {
  // This is used when the provided dispatchCallback is able to perform an action which in result can also modify multiple state
  // properties from different instances of this hook and then without this we would try to update our search params at the same
  // time which simply would catch change of only one property and because of that I created such ID to make sure that in such
  // case search params modifications are distributed over time
  useEffect(() => {
    if (!idOfDeeperStateThatIsSentAndDispatchCanChangeIt) return;

    if (
      idsOfDeeperStates[idOfDeeperStateThatIsSentAndDispatchCanChangeIt] !==
      undefined
    ) {
      if (
        idsOfDeeperStates[idOfDeeperStateThatIsSentAndDispatchCanChangeIt][
          searchParamName
        ] !== undefined
      )
        return;
      const index = [
        ...Object.entries(
          idsOfDeeperStates[idOfDeeperStateThatIsSentAndDispatchCanChangeIt]
        ),
      ].length;
      idsOfDeeperStates[idOfDeeperStateThatIsSentAndDispatchCanChangeIt][
        searchParamName
      ] = index;
    } else {
      idsOfDeeperStates[idOfDeeperStateThatIsSentAndDispatchCanChangeIt] = {
        [searchParamName]: 0,
      };
    }
  }, [idOfDeeperStateThatIsSentAndDispatchCanChangeIt, searchParamName]);

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

  const debouncedUpdate = useMemo(
    () =>
      debounce((stateNormalPropertyMemoized: T) => {
        provideSearchParamNameToDispatch
          ? dispatchCallbackFn(stateNormalPropertyMemoized, searchParamName)
          : (dispatchCallbackFn as (newState: T) => void)(
              stateNormalPropertyMemoized
            );
        searchParams.set(
          searchParamName,
          JSON.stringify(stateNormalPropertyMemoized)
        );
        sessionStorage.setItem(
          searchParamName,
          JSON.stringify(stateNormalPropertyMemoized)
        );
        navigate(createUrlWithCurrentSearchParams({ searchParams, pathname }), {
          replace: true,
        });
      }, timeToWait + (!idOfDeeperStateThatIsSentAndDispatchCanChangeIt || idsOfDeeperStates[idOfDeeperStateThatIsSentAndDispatchCanChangeIt] === undefined ? 0 : idsOfDeeperStates[idOfDeeperStateThatIsSentAndDispatchCanChangeIt!][searchParamName] * 50)),
    [
      timeToWait,
      idOfDeeperStateThatIsSentAndDispatchCanChangeIt,
      searchParamName,
      provideSearchParamNameToDispatch,
      dispatchCallbackFn,
      searchParams,
      navigate,
      pathname,
    ]
  );

  console.log(typeof stateNormalPropertyMemoized, stateNormalPropertyMemoized);

  useEffect(() => {
    if (
      (typeof stateNormalPropertyMemoized === "object" &&
        are2ObjectsEqualTopLevel(
          stateNormalPropertyMemoized as object,
          stateDebouncedPropertyMemoized as object
        )) ||
      (typeof stateNormalPropertyMemoized !== "object" &&
        stateNormalPropertyMemoized === stateDebouncedPropertyMemoized)
    ) {
      return;
    }
    debouncedUpdate(stateNormalPropertyMemoized);
    return () => {
      debouncedUpdate.cancel();
    };
  }, [
    debouncedUpdate,
    stateDebouncedPropertyMemoized,
    stateNormalPropertyMemoized,
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
