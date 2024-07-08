import {
  createContext,
  ReactNode,
  Reducer,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useInput } from "../hooks/useInput";
import { useAppSelector } from "../hooks/reduxStore";
import { actions } from "./mainSearchBarSlice";
import generateInitialStateFromSearchParams from "../helpers/generateInitialStateFromSearchParams";
import useChangeSearchParamsWhenUseReducerChanges from "../hooks/useChangeSearchParamsWhenUseReducerChanges";

interface IOrderCustomization {
  popularity: "" | "1" | "-1";
  title: "" | "1" | "-1";
  price: "" | "1" | "-1";
  debouncedPopularity: "" | "1" | "-1";
  debouncedTitle: "" | "1" | "-1";
  debouncedPrice: "" | "1" | "-1";
}

type IOrderCustomizationReducerPossibleStateValues = "" | "1" | "-1";

interface IOrderCustomizationReducer {
  type: "CHANGE_STATE";
  payload: {
    fieldName: "popularity" | "title" | "price";
    newState: IOrderCustomizationReducerPossibleStateValues;
    debouncingExecution?: boolean;
  };
}

export const SearchCustomizationContext = createContext<{
  minPrice: number;
  maxPrice: number;
  handleMinChange: (newMinPrice: string) => void;
  handleMaxChange: (newMaxPrice: string) => void;
  handleSearchTermChange: (newInputValue: string) => void;
  searchTermDebouncingState: string;
  minQueryDebouncingState: number;
  maxQueryDebouncingState: number;
  orderCustomizationState: IOrderCustomization;
  orderCustomizationDispatch: React.Dispatch<IOrderCustomizationReducer>;
}>({
  minPrice: 0,
  maxPrice: 0,
  handleMinChange: () => {},
  handleMaxChange: () => {},
  handleSearchTermChange: () => {},
  searchTermDebouncingState: "",
  minQueryDebouncingState: 0,
  maxQueryDebouncingState: 0,
  orderCustomizationState: {} as IOrderCustomization,
  orderCustomizationDispatch: () => {},
});

const orderCustomizationReducer: Reducer<
  IOrderCustomization,
  {
    type: "CHANGE_STATE";
    payload: {
      fieldName: "popularity" | "title" | "price";
      newState: "" | "1" | "-1";
      debouncingExecution?: boolean;
    };
  }
> = function (state, action) {
  if (action.type !== "CHANGE_STATE") return state;
  const { fieldName, debouncingExecution = false, newState } = action.payload;
  const debouncedFieldName = `debounced${fieldName.replace(
    fieldName[0],
    fieldName[0].toUpperCase()
  )}`;
  const updatedStateProperties = {
    ...(debouncingExecution
      ? { [debouncedFieldName]: newState }
      : { [fieldName]: newState }),
  };
  const updatedState = {
    ...state,
    ...updatedStateProperties,
  };
  return updatedState;
};

export default function SearchCustomizationContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const navigate = useNavigate();

  const searchTerm = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );
  const { handleInputChange, queryDebouncingState: searchTermDebouncingState } =
    useInput({
      stateValue: searchTerm,
      setStateAction: actions.setSearchTerm,
      searchParamName: "query",
    });

  const [min, setMin] = useState<number>(
    generateInitialStateFromSearchParams(NaN, searchParams.get("min"))
  );
  const [max, setMax] = useState<number>(
    generateInitialStateFromSearchParams(NaN, searchParams.get("max"))
  );
  const {
    handleInputChange: handleMinChange,
    queryDebouncingState: minQueryDebouncingState,
  } = useInput({
    stateValue: min,
    setStateValue: setMin,
    searchParamName: "min",
    debouncingTime: 600,
  });
  const {
    handleInputChange: handleMaxChange,
    queryDebouncingState: maxQueryDebouncingState,
  } = useInput({
    stateValue: max,
    setStateValue: setMax,
    searchParamName: "max",
  });

  const popularityParam = searchParams.get("popularity");
  const priceParam = searchParams.get("price");
  const titleParam = searchParams.get("title");

  const initialOrderCustomizationState: IOrderCustomization = {
    popularity: generateInitialStateFromSearchParams("", popularityParam),
    price: generateInitialStateFromSearchParams("", priceParam),
    title: generateInitialStateFromSearchParams("", titleParam),
    debouncedPopularity: generateInitialStateFromSearchParams(
      "",
      popularityParam
    ),
    debouncedPrice: generateInitialStateFromSearchParams("", priceParam),
    debouncedTitle: generateInitialStateFromSearchParams("", titleParam),
  };
  console.log(initialOrderCustomizationState);
  const [orderCustomizationState, orderCustomizationDispatch] = useReducer(
    orderCustomizationReducer,
    initialOrderCustomizationState
  );

  const {
    debouncedPopularity,
    debouncedPrice,
    debouncedTitle,
    popularity,
    price,
    title,
  } = orderCustomizationState;

  const orderCustomizationHookData = {
    location,
    navigate,
  };

  const orderCustomizationHookCallback = useCallback(
    (newState: string, searchParamName: string) => {
      orderCustomizationDispatch({
        type: "CHANGE_STATE",
        payload: {
          fieldName: searchParamName as "popularity" | "title" | "price",
          debouncingExecution: true,
          newState: newState as IOrderCustomizationReducerPossibleStateValues,
        },
      });
    },
    []
  );

  useChangeSearchParamsWhenUseReducerChanges({
    dispatchCallbackFn: orderCustomizationHookCallback,
    searchParamName: "popularity",
    stateNormalProperty: popularity,
    stateDebouncedProperty: debouncedPopularity,
    ...orderCustomizationHookData,
  });
  useChangeSearchParamsWhenUseReducerChanges({
    dispatchCallbackFn: orderCustomizationHookCallback,
    searchParamName: "price",
    stateNormalProperty: price,
    stateDebouncedProperty: debouncedPrice,
    ...orderCustomizationHookData,
  });
  useChangeSearchParamsWhenUseReducerChanges({
    dispatchCallbackFn: orderCustomizationHookCallback,
    searchParamName: "title",
    stateNormalProperty: title,
    stateDebouncedProperty: debouncedTitle,
    ...orderCustomizationHookData,
  });

  return (
    <SearchCustomizationContext.Provider
      value={{
        minPrice: min,
        maxPrice: max,
        handleMinChange,
        handleMaxChange,
        handleSearchTermChange: handleInputChange,
        minQueryDebouncingState,
        maxQueryDebouncingState,
        searchTermDebouncingState,
        orderCustomizationState,
        orderCustomizationDispatch,
      }}
    >
      {children}
    </SearchCustomizationContext.Provider>
  );
}
