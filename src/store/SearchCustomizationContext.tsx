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

type IOrderCustomizationPropertyValues = "" | "1" | "-1";

export interface IOrderCustomizationProperty {
  value: IOrderCustomizationPropertyValues;
  order: number;
}

interface IOrderCustomization {
  popularity: IOrderCustomizationProperty;
  title: IOrderCustomizationProperty;
  price: IOrderCustomizationProperty;
  debouncedPopularity: IOrderCustomizationProperty;
  debouncedTitle: IOrderCustomizationProperty;
  debouncedPrice: IOrderCustomizationProperty;
}

interface IOrderCustomizationReducer {
  type: "CHANGE_PROPERTY_VALUE" | "CHANGE_PROPERTY";
  payload: {
    fieldName: "popularity" | "title" | "price";
    newState: IOrderCustomizationPropertyValues | IOrderCustomizationProperty;
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

type orderCustomizationReducerActionTypes =
  | "CHANGE_PROPERTY_VALUE"
  | "CHANGE_PROPERTY";

const orderCustomizationReducer: Reducer<
  IOrderCustomization,
  {
    type: orderCustomizationReducerActionTypes;
    payload: {
      fieldName: "popularity" | "title" | "price";
      newState: IOrderCustomizationPropertyValues | IOrderCustomizationProperty;
      debouncingExecution?: boolean;
    };
  }
> = function (state, action) {
  const { fieldName, debouncingExecution = false, newState } = action.payload;
  const debouncedFieldName = `debounced${fieldName.replace(
    fieldName[0],
    fieldName[0].toUpperCase()
  )}` as "debouncedPopularity" | "debouncedTitle" | "debouncedPrice";
  const currentStateProperty = debouncingExecution
    ? state[debouncedFieldName]
    : state[fieldName];
  switch (action.type) {
    case "CHANGE_PROPERTY_VALUE": {
      const removeStateProperty = newState === "";
      const usedStateProperties = [...Object.entries(state)].filter(
        (entry) =>
          (!debouncingExecution
            ? !entry[0].startsWith("debounced")
            : entry[0].startsWith("debounced")) &&
          (!debouncingExecution
            ? entry[0] !== fieldName
            : entry[0] !==
              `debounced${fieldName.replace(
                fieldName[0],
                fieldName[0].toUpperCase()
              )}`) &&
          !isNaN(entry[1].order)
      );
      console.log(usedStateProperties);
      const orderedPropertiesToOverrideOldOnesIfRemovingProperty =
        Object.fromEntries(
          usedStateProperties
            .sort((a, b) => a[1].order - b[1].order)
            .map((entry, i) => [entry[0], { ...entry[1], order: i }])
        );
      console.log(orderedPropertiesToOverrideOldOnesIfRemovingProperty);
      const newPropertyObj = {
        value: newState,
        order: removeStateProperty
          ? NaN
          : isNaN(currentStateProperty.order)
          ? usedStateProperties.length
          : currentStateProperty.order,
      };
      const updatedStateProperties = {
        ...(debouncingExecution
          ? { [debouncedFieldName]: newPropertyObj }
          : { [fieldName]: newPropertyObj }),
        ...(removeStateProperty
          ? orderedPropertiesToOverrideOldOnesIfRemovingProperty
          : undefined),
      };
      const updatedState = {
        ...state,
        ...updatedStateProperties,
      };
      return updatedState;
    }
    case "CHANGE_PROPERTY":
      return {
        ...state,
        [debouncingExecution ? debouncedFieldName : fieldName]: newState,
      };
    default:
      return state;
  }
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
  const defaultOrderCustomizationProperty = {
    value: "",
    order: NaN,
  };

  const initialOrderCustomizationState: IOrderCustomization = {
    popularity: generateInitialStateFromSearchParams(
      defaultOrderCustomizationProperty,
      popularityParam,
      true
    ),
    price: generateInitialStateFromSearchParams(
      defaultOrderCustomizationProperty,
      priceParam,
      true
    ),
    title: generateInitialStateFromSearchParams(
      defaultOrderCustomizationProperty,
      titleParam,
      true
    ),
    debouncedPopularity: generateInitialStateFromSearchParams(
      defaultOrderCustomizationProperty,
      popularityParam,
      true
    ),
    debouncedPrice: generateInitialStateFromSearchParams(
      defaultOrderCustomizationProperty,
      priceParam,
      true
    ),
    debouncedTitle: generateInitialStateFromSearchParams(
      defaultOrderCustomizationProperty,
      titleParam,
      true
    ),
  };
  const [orderCustomizationState, orderCustomizationDispatch] = useReducer(
    orderCustomizationReducer,
    initialOrderCustomizationState
  );
  console.log(orderCustomizationState);

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
    (newState: IOrderCustomizationProperty, searchParamName: string) => {
      orderCustomizationDispatch({
        type: "CHANGE_PROPERTY",
        payload: {
          fieldName: searchParamName as "popularity" | "title" | "price",
          debouncingExecution: true,
          newState,
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
