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

import { useInput } from "../../hooks/useInput";
import { useAppSelector } from "../../hooks/reduxStore";
import { actions } from "../mainSearchBarSlice";
import generateInitialStateFromSearchParamsOrSessionStorage from "../../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import useChangeSearchParamsWhenUseReducerChanges from "../../hooks/useChangeSearchParamsWhenUseReducerChanges";
import { useStateWithSearchParams } from "../../hooks/useStateWithSearchParams";
import useCreateUseReducerStateForCustomizationComponentWithInputAndTags, {
  ISelectedTags,
  ISelectedTagsReducer,
} from "../../hooks/searchCustomizationRelated/useCreateUseReducerStateForCustomizationComponentWithInputAndTags";

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

export interface ISearchCustomizationContext {
  minPrice: number;
  maxPrice: number;
  handleMinChange: (newMinPrice: number) => void;
  handleMaxChange: (newMaxPrice: number) => void;
  handleSearchTermChange: (newInputValue: string) => void;
  searchTermDebouncingState: string;
  minQueryDebouncingState: number;
  maxQueryDebouncingState: number;
  orderCustomizationState: IOrderCustomization;
  orderCustomizationDispatch: React.Dispatch<IOrderCustomizationReducer>;
  discountActive: number;
  debouncedDiscountActive: number;
  setDiscountActive: (newDiscount: number) => void;
  selectedGenresState: ISelectedTags;
  selectedGenresDispatch: React.Dispatch<ISelectedTagsReducer>;
  selectedPlatformsState: ISelectedTags;
  selectedPlatformsDispatch: React.Dispatch<ISelectedTagsReducer>;
  selectedDevelopersState: ISelectedTags;
  selectedDevelopersDispatch: React.Dispatch<ISelectedTagsReducer>;
  selectedPublishersState: ISelectedTags;
  selectedPublishersDispatch: React.Dispatch<ISelectedTagsReducer>;
}

export const SearchCustomizationContext =
  createContext<ISearchCustomizationContext>({
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
    selectedGenresState: {} as ISelectedTags,
    selectedGenresDispatch: () => {},
    selectedPlatformsState: {} as ISelectedTags,
    selectedPlatformsDispatch: () => {},
    selectedDevelopersState: {} as ISelectedTags,
    selectedDevelopersDispatch: () => {},
    selectedPublishersState: {} as ISelectedTags,
    selectedPublishersDispatch: () => {},
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
    sameTimeOccurrenceChanceId: "priceRange",
  });
  const {
    handleInputChange: handleMaxChange,
    queryDebouncingState: maxQueryDebouncingState,
  } = useInput({
    stateValue: max,
    setStateValue: setMax,
    searchParamName: "max",
    sameTimeOccurrenceChanceId: "priceRange",
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

  const searchCustomizationComponentWithInputAndTagsHookDefaultArguments = {
    location,
    navigate,
    searchParams,
    idOfDeeperStateThatIsSentAndDispatchCanChangeIt: "products-search-tags",
  };

  const {
    selectedTagsState: selectedGenresState,
    selectedTagsDispatch: selectedGenresDispatch,
  } = useCreateUseReducerStateForCustomizationComponentWithInputAndTags({
    ...searchCustomizationComponentWithInputAndTagsHookDefaultArguments,
    searchParamName: "genres",
  });

  const {
    selectedTagsState: selectedPlatformsState,
    selectedTagsDispatch: selectedPlatformsDispatch,
  } = useCreateUseReducerStateForCustomizationComponentWithInputAndTags({
    ...searchCustomizationComponentWithInputAndTagsHookDefaultArguments,
    searchParamName: "platforms",
  });

  const {
    selectedTagsState: selectedDevelopersState,
    selectedTagsDispatch: selectedDevelopersDispatch,
  } = useCreateUseReducerStateForCustomizationComponentWithInputAndTags({
    ...searchCustomizationComponentWithInputAndTagsHookDefaultArguments,
    searchParamName: "developers",
  });

  const {
    selectedTagsState: selectedPublishersState,
    selectedTagsDispatch: selectedPublishersDispatch,
  } = useCreateUseReducerStateForCustomizationComponentWithInputAndTags({
    ...searchCustomizationComponentWithInputAndTagsHookDefaultArguments,
    searchParamName: "publishers",
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
        selectedPlatformsState,
        selectedPlatformsDispatch,
        selectedDevelopersState,
        selectedDevelopersDispatch,
        selectedPublishersState,
        selectedPublishersDispatch,
      }}
    >
      {children}
    </SearchCustomizationContext.Provider>
  );
}
