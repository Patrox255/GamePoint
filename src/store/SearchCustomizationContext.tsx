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
import generateInitialStateFromSearchParamsOrSessionStorage from "../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import useChangeSearchParamsWhenUseReducerChanges from "../hooks/useChangeSearchParamsWhenUseReducerChanges";
import { useStateWithSearchParams } from "../hooks/useStateWithSearchParams";

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
  type: orderCustomizationReducerActionTypes;
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
  discountActive: number;
  debouncedDiscountActive: number;
  setDiscountActive: (newDiscount: number) => void;
  selectedGenresState: ISelectedGenres;
  selectedGenresDispatch: React.Dispatch<ISelectedGenresReducer>;
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
  discountActive: 0,
  debouncedDiscountActive: 0,
  setDiscountActive: () => {},
  selectedGenresState: {} as ISelectedGenres,
  selectedGenresDispatch: () => {},
});

type orderCustomizationReducerActionTypes =
  | "CHANGE_PROPERTY_VALUE"
  | "CHANGE_PROPERTY";

const orderCustomizationReducer: Reducer<
  IOrderCustomization,
  IOrderCustomizationReducer
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
      console.log(state, action.payload);
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
      const orderedPropertiesToOverrideOldOnesIfRemovingProperty =
        Object.fromEntries(
          usedStateProperties
            .sort((a, b) => a[1].order - b[1].order)
            .map((entry, i) => [entry[0], { ...entry[1], order: i }])
        );
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

type ISelectedGenresProperty = string[];

interface ISelectedGenres {
  genres: ISelectedGenresProperty;
  debouncedGenres: ISelectedGenresProperty;
}

type ISelectedGenresReducer =
  | {
      type: "CHANGE_DEBOUNCED_PROPERTY";
      payload: {
        newGenres: ISelectedGenresProperty;
      };
    }
  | {
      type: "ADD_GENRE" | "REMOVE_GENRE";
      payload: {
        genreName: string;
      };
    };

const selectedGenresReducer: Reducer<ISelectedGenres, ISelectedGenresReducer> =
  function (state, action) {
    const { type, payload } = action;
    console.log(type, payload);
    switch (type) {
      case "ADD_GENRE": {
        const { genreName } = payload;
        return state.genres.includes(genreName!)
          ? state
          : { ...state, genres: [...state.genres, genreName] };
      }
      case "REMOVE_GENRE": {
        const { genreName } = payload;
        return {
          ...state,
          genres: state.genres.filter((genre) => genre !== genreName),
        };
      }
      case "CHANGE_DEBOUNCED_PROPERTY": {
        const { newGenres } = payload;
        return { ...state, debouncedGenres: [...newGenres!] };
      }
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
    generateInitialStateFromSearchParamsOrSessionStorage(
      NaN,
      searchParams,
      "min"
    )
  );
  const [max, setMax] = useState<number>(
    generateInitialStateFromSearchParamsOrSessionStorage(
      NaN,
      searchParams,
      "max"
    )
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

  const defaultOrderCustomizationProperty = {
    value: "",
    order: NaN,
  };

  const initialOrderCustomizationState: IOrderCustomization = {
    popularity: generateInitialStateFromSearchParamsOrSessionStorage(
      defaultOrderCustomizationProperty,
      searchParams,
      "popularity",
      true
    ),
    price: generateInitialStateFromSearchParamsOrSessionStorage(
      defaultOrderCustomizationProperty,
      searchParams,
      "price",
      true
    ),
    title: generateInitialStateFromSearchParamsOrSessionStorage(
      defaultOrderCustomizationProperty,
      searchParams,
      "title",
      true
    ),
    debouncedPopularity: generateInitialStateFromSearchParamsOrSessionStorage(
      defaultOrderCustomizationProperty,
      searchParams,
      "popularity",
      true
    ),
    debouncedPrice: generateInitialStateFromSearchParamsOrSessionStorage(
      defaultOrderCustomizationProperty,
      searchParams,
      "price",
      true
    ),
    debouncedTitle: generateInitialStateFromSearchParamsOrSessionStorage(
      defaultOrderCustomizationProperty,
      searchParams,
      "title",
      true
    ),
  };
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
    idOfDeeperStateThatIsSentAndDispatchCanChangeIt: "orderCustomization",
    provideSearchParamNameToDispatch: true,
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

  const {
    state: discountActive,
    setStateWithSearchParams: setDiscountActive,
    debouncingState: debouncedDiscountActive,
  } = useStateWithSearchParams(0, "discount", location.pathname);

  const initialSelectedGenresState: ISelectedGenres = {
    genres: generateInitialStateFromSearchParamsOrSessionStorage(
      [],
      searchParams,
      "genres"
    ),
    debouncedGenres: generateInitialStateFromSearchParamsOrSessionStorage(
      [],
      searchParams,
      "genres"
    ),
  };

  const [selectedGenresState, selectedGenresDispatch] = useReducer(
    selectedGenresReducer,
    initialSelectedGenresState
  );

  console.log(selectedGenresState);

  const selectedGenresDispatchCallback = useCallback(
    (newState: ISelectedGenresProperty) => {
      selectedGenresDispatch({
        type: "CHANGE_DEBOUNCED_PROPERTY",
        payload: { newGenres: newState },
      });
    },
    []
  );

  useChangeSearchParamsWhenUseReducerChanges({
    stateNormalProperty: selectedGenresState.genres,
    stateDebouncedProperty: selectedGenresState.debouncedGenres,
    location,
    navigate,
    searchParamName: "genres",
    dispatchCallbackFn: selectedGenresDispatchCallback,
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
        discountActive,
        setDiscountActive,
        debouncedDiscountActive,
        selectedGenresState,
        selectedGenresDispatch,
      }}
    >
      {children}
    </SearchCustomizationContext.Provider>
  );
}
