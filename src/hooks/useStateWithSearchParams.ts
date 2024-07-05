import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../helpers/createUrlWithCurrentSearchParams";
import useDebouncing from "./useDebouncing";

export const useStateWithSearchParams = function <T>(
  initialState: T,
  searchParamName: string,
  pathName: string
) {
  const { search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const searchParamValue = searchParams.get(searchParamName);
  const navigate = useNavigate();

  let initialStateFromParams;

  try {
    initialStateFromParams = JSON.parse(searchParamValue!);
    if (typeof initialStateFromParams !== typeof initialState) throw "";
  } catch (e) {
    initialStateFromParams = initialState;
  }

  const [state, setState] = useState<T | null>(initialStateFromParams);

  const debouncingFn = useCallback(() => {
    searchParams.set(searchParamName, JSON.stringify(state));
    navigate(
      createUrlWithCurrentSearchParams({
        searchParams,
        pathname: pathName,
      }),
      { replace: true }
    );
  }, [searchParams, searchParamName, state, navigate, pathName]);
  useDebouncing(debouncingFn, searchParamValue != state);

  //   useEffect(() => {
  //     if (searchParamValue == state) return;
  //     console.log("SET");
  //     const timer = setTimeout(() => {
  //       searchParams.set(searchParamName, JSON.stringify(state));
  //       navigate(
  //         createUrlWithCurrentSearchParams({
  //           searchParams,
  //           pathname: "/products",
  //         }),
  //         { replace: true }
  //       );
  //     }, 2000);

  //     return () => {
  //       console.log("REMOVED");
  //       clearTimeout(timer);
  //     };
  //   }, [state, searchParams, searchParamName, navigate, searchParamValue]);

  function setStateWithSearchParams(newState: T) {
    console.log(newState);
    setState(newState);
    // searchParams.set(searchParamName, JSON.stringify(newState));
    // navigate(
    //   createUrlWithCurrentSearchParams({ searchParams, pathname: "/products" }),
    //   { replace: true }
    // );
  }

  return { state, setStateWithSearchParams };
};
