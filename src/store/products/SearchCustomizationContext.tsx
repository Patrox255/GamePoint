import { createContext, ReactNode, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useInput } from "../../hooks/useInput";
import { useAppSelector } from "../../hooks/reduxStore";
import { actions } from "../mainSearchBarSlice";
import generateInitialStateFromSearchParamsOrSessionStorage from "../../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import { useStateWithSearchParams } from "../../hooks/useStateWithSearchParams";
import useCreateUseReducerStateForCustomizationComponentWithInputAndTags, {
  ISelectedTags,
  ISelectedTagsReducer,
} from "../../hooks/searchCustomizationRelated/useCreateUseReducerStateForCustomizationComponentWithInputAndTags";
import useHandleElementsOrderCustomizationState, {
  IOrderCustomizationReducer,
  IOrderCustomizationStateObjWithDebouncedFields,
} from "../../hooks/useHandleElementsOrderCustomizationState";

type IOrderCustomization = IOrderCustomizationStateObjWithDebouncedFields<
  (typeof searchCustomizationOrderFieldsNames)[number]
>;

const searchCustomizationOrderFieldsNames = [
  "popularity",
  "price",
  "title",
] as const;

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

  const { orderCustomizationDispatch, orderCustomizationStateStable } =
    useHandleElementsOrderCustomizationState({
      orderCustomizationFieldsNamesStable: searchCustomizationOrderFieldsNames,
      orderCustomizationSearchParamAndSessionStorageEntryName:
        "searchCustomizationOrder",
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
        orderCustomizationState: orderCustomizationStateStable,
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
