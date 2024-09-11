/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
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
import { ProductsSearchCustomizationCustomInformationContext } from "./ProductsSearchCustomizationCustomInformationContext";
import { useQueryGetTagsAvailableTagsNames } from "../../hooks/searchCustomizationRelated/useQueryGetTagsTypes";

type IOrderCustomization = IOrderCustomizationStateObjWithDebouncedFields<
  (typeof searchCustomizationOrderFieldsNames)[number]
>;

const searchCustomizationOrderFieldsNames = [
  "popularity",
  "title",
  "price",
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
  searchTerm: string;
}

export type usedSearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization =

    | "query"
    | "min"
    | "max"
    | "searchCustomizationOrder"
    | "discount"
    | "genres"
    | "platforms"
    | "developers"
    | "publishers";
export type usedSearchParamsAndSessionStorageIdsOfDeeperStatesForProductsSearchCustomization =
  "products-search-tags" | "priceRange";
export type ISearchParamsAndSessionStorageEntryValueWithSetTagType = {
  searchParam: string;
  tagType: useQueryGetTagsAvailableTagsNames;
};
export type ISearchParamsAndSessionStorageEntriesNames<
  searchParamsAndSessionStorageEntriesNames extends string,
  searchParamsAndSessionStorageIdsOfDeeperStates extends
    | string
    | undefined = undefined
> = {
  [key in searchParamsAndSessionStorageEntriesNames]?:
    | string
    | ISearchParamsAndSessionStorageEntryValueWithSetTagType;
} & {
  defaultSearchParamsAndSessionStorageEntriesNamesPrefix?: string;
  defaultSearchParamsAndSessionStorageEntriesNamesSuffix?: string;
} & (searchParamsAndSessionStorageIdsOfDeeperStates extends undefined
    ? object
    : {
        [searchParamsAndSessionStorageIdsOfDeeperStatesKey in searchParamsAndSessionStorageIdsOfDeeperStates as string]?: string;
      });
export type ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization =
  ISearchParamsAndSessionStorageEntriesNames<
    usedSearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization,
    usedSearchParamsAndSessionStorageIdsOfDeeperStatesForProductsSearchCustomization
  >;
export const retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj =
  <T extends Y, Y extends string>(
    entryName: Y,
    searchParamsAndSessionStorageEntriesNames?: ISearchParamsAndSessionStorageEntriesNames<T>,
    returnTagType: boolean = false
  ) => {
    if (!searchParamsAndSessionStorageEntriesNames) return entryName;
    const searchParamsAndSessionStorageEntriesNamesValue =
      searchParamsAndSessionStorageEntriesNames[entryName as T];
    if (returnTagType)
      return (
        (
          searchParamsAndSessionStorageEntriesNamesValue as ISearchParamsAndSessionStorageEntryValueWithSetTagType
        )?.tagType ?? entryName
      );
    if (searchParamsAndSessionStorageEntriesNamesValue !== undefined)
      return (
        (
          searchParamsAndSessionStorageEntriesNamesValue as ISearchParamsAndSessionStorageEntryValueWithSetTagType
        ).searchParam ??
        (searchParamsAndSessionStorageEntriesNamesValue as string)
      );
    return `${
      searchParamsAndSessionStorageEntriesNames.defaultSearchParamsAndSessionStorageEntriesNamesPrefix
        ? searchParamsAndSessionStorageEntriesNames.defaultSearchParamsAndSessionStorageEntriesNamesPrefix
        : ""
    }${entryName}${
      searchParamsAndSessionStorageEntriesNames.defaultSearchParamsAndSessionStorageEntriesNamesSuffix
        ? searchParamsAndSessionStorageEntriesNames.defaultSearchParamsAndSessionStorageEntriesNamesSuffix
        : ""
    }`;
  };

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
    searchTerm: "",
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

  const {
    createCustomSearchTermState,
    customSearchTermStateInCaseOfUsingExternalOne,
    setCustomSearchTermStateInCaseOfUsingExternalOne,
    customSearchParamsAndSessionStorageEntriesNames,
  } = useContext(ProductsSearchCustomizationCustomInformationContext);
  const defaultSearchTermToUse = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );
  let searchTerm: string =
    customSearchTermStateInCaseOfUsingExternalOne !== undefined
      ? customSearchTermStateInCaseOfUsingExternalOne
      : defaultSearchTermToUse;
  console.log(
    retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
      "query",
      customSearchParamsAndSessionStorageEntriesNames
    )
  );

  const querySearchParamAndSessionStorageEntryName =
    retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
      "query",
      customSearchParamsAndSessionStorageEntriesNames
    );
  const searchTermInCaseOfCreatingCustomOneHereDefaultValue =
    querySearchParamAndSessionStorageEntryName !== "query"
      ? (generateInitialStateFromSearchParamsOrSessionStorage(
          "",
          searchParams,
          querySearchParamAndSessionStorageEntryName
        ) as string)
      : "";
  const {
    handleInputChange,
    queryDebouncingState: searchTermDebouncingState,
    inputValueInCaseOfCreatingStateHere:
      searchTermInCaseOfCreatingCustomOneHere,
  } = useInput({
    ...(!createCustomSearchTermState && {
      stateValue: searchTerm,
    }),
    ...(!createCustomSearchTermState
      ? !setCustomSearchTermStateInCaseOfUsingExternalOne &&
        customSearchTermStateInCaseOfUsingExternalOne === undefined
        ? {
            setStateAction: actions.setSearchTerm,
          }
        : { setStateValue: setCustomSearchTermStateInCaseOfUsingExternalOne }
      : {}),
    searchParamName: querySearchParamAndSessionStorageEntryName,
    defaultStateValueInCaseOfCreatingStateHere:
      searchTermInCaseOfCreatingCustomOneHereDefaultValue,
  });
  if (createCustomSearchTermState)
    searchTerm = searchTermInCaseOfCreatingCustomOneHere!;

  const priceMinRangeSearchParamAndSessionStorageEntryName =
    retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
      "min",
      customSearchParamsAndSessionStorageEntriesNames
    );
  const priceMaxRangeSearchParamAndSessionStorageEntryName =
    retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
      "max",
      customSearchParamsAndSessionStorageEntriesNames
    );
  const [min, setMin] = useState<number>(
    generateInitialStateFromSearchParamsOrSessionStorage(
      NaN,
      searchParams,
      priceMinRangeSearchParamAndSessionStorageEntryName
    )
  );
  const [max, setMax] = useState<number>(
    generateInitialStateFromSearchParamsOrSessionStorage(
      NaN,
      searchParams,
      priceMaxRangeSearchParamAndSessionStorageEntryName
    )
  );
  const {
    handleInputChange: handleMinChange,
    queryDebouncingState: minQueryDebouncingState,
  } = useInput({
    stateValue: min,
    setStateValue: setMin,
    searchParamName: priceMinRangeSearchParamAndSessionStorageEntryName,
    sameTimeOccurrenceChanceId:
      retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
        "priceRange",
        customSearchParamsAndSessionStorageEntriesNames
      ),
  });
  const {
    handleInputChange: handleMaxChange,
    queryDebouncingState: maxQueryDebouncingState,
  } = useInput({
    stateValue: max,
    setStateValue: setMax,
    searchParamName: priceMaxRangeSearchParamAndSessionStorageEntryName,
    sameTimeOccurrenceChanceId:
      retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
        "priceRange",
        customSearchParamsAndSessionStorageEntriesNames
      ),
  });

  const { orderCustomizationDispatch, orderCustomizationStateStable } =
    useHandleElementsOrderCustomizationState({
      orderCustomizationFieldsNamesStable: searchCustomizationOrderFieldsNames,
      orderCustomizationSearchParamAndSessionStorageEntryName:
        retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
          "searchCustomizationOrder",
          customSearchParamsAndSessionStorageEntriesNames
        ),
    });

  const {
    state: discountActive,
    setStateWithSearchParams: setDiscountActive,
    debouncingState: debouncedDiscountActive,
  } = useStateWithSearchParams({
    initialStateStable: 0,
    searchParamName:
      retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
        "discount",
        customSearchParamsAndSessionStorageEntriesNames
      ),
    pathName: location.pathname,
  });

  const searchCustomizationComponentWithInputAndTagsHookDefaultArguments = {
    location,
    navigate,
    searchParams,
    idOfDeeperStateThatIsSentAndDispatchCanChangeIt:
      retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
        "products-search-tags",
        customSearchParamsAndSessionStorageEntriesNames
      ),
  };

  const {
    selectedTagsState: selectedGenresState,
    selectedTagsDispatch: selectedGenresDispatch,
  } = useCreateUseReducerStateForCustomizationComponentWithInputAndTags({
    ...searchCustomizationComponentWithInputAndTagsHookDefaultArguments,
    searchParamName:
      retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
        "genres",
        customSearchParamsAndSessionStorageEntriesNames
      ),
  });

  const {
    selectedTagsState: selectedPlatformsState,
    selectedTagsDispatch: selectedPlatformsDispatch,
  } = useCreateUseReducerStateForCustomizationComponentWithInputAndTags({
    ...searchCustomizationComponentWithInputAndTagsHookDefaultArguments,
    searchParamName:
      retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
        "platforms",
        customSearchParamsAndSessionStorageEntriesNames
      ),
  });

  const {
    selectedTagsState: selectedDevelopersState,
    selectedTagsDispatch: selectedDevelopersDispatch,
  } = useCreateUseReducerStateForCustomizationComponentWithInputAndTags({
    ...searchCustomizationComponentWithInputAndTagsHookDefaultArguments,
    searchParamName:
      retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
        "developers",
        customSearchParamsAndSessionStorageEntriesNames
      ),
  });

  const {
    selectedTagsState: selectedPublishersState,
    selectedTagsDispatch: selectedPublishersDispatch,
  } = useCreateUseReducerStateForCustomizationComponentWithInputAndTags({
    ...searchCustomizationComponentWithInputAndTagsHookDefaultArguments,
    searchParamName:
      retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
        "publishers",
        customSearchParamsAndSessionStorageEntriesNames
      ),
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
        searchTerm,
      }}
    >
      {children}
    </SearchCustomizationContext.Provider>
  );
}
