import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";

import {
  IMaxAmountOfSelectedTagsObj,
  ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization,
  retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj,
} from "../../store/products/SearchCustomizationContext";
import useCreateUseReducerStateForCustomizationComponentWithInputAndTags from "./useCreateUseReducerStateForCustomizationComponentWithInputAndTags";
import { useQueryGetTagsAvailableTagsNames } from "./useQueryGetTagsTypes";

export type IInitialTagsState =
  | {
      [key in useQueryGetTagsAvailableTagsNames]?: string[];
    }
  | undefined;
export default function usePrepareSearchCustomizationTagsState(
  customSearchParamsAndSessionStorageEntriesNames?: ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization,
  maxAmountOfSelectedTagsObj?: IMaxAmountOfSelectedTagsObj,
  omitChangingSearchParams?: boolean,
  initialTagsState?: IInitialTagsState
) {
  const location = useLocation();
  const { search } = location;
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const navigate = useNavigate();

  const searchCustomizationComponentWithInputAndTagsHookDefaultArguments = {
    location,
    navigate,
    searchParams,
    idOfDeeperStateThatIsSentAndDispatchCanChangeIt:
      retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
        "products-search-tags",
        customSearchParamsAndSessionStorageEntriesNames
      ),
    omitChangingSearchParams,
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
    maxAmountOfSelectedTags: maxAmountOfSelectedTagsObj?.maxGenres,
    initalTagsState: initialTagsState?.genres,
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
    maxAmountOfSelectedTags: maxAmountOfSelectedTagsObj?.maxPlatforms,
    initalTagsState: initialTagsState?.platforms,
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
    maxAmountOfSelectedTags: maxAmountOfSelectedTagsObj?.maxDevelopers,
    initalTagsState: initialTagsState?.developers,
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
    maxAmountOfSelectedTags: maxAmountOfSelectedTagsObj?.maxPublishers,
    initalTagsState: initialTagsState?.publishers,
  });

  return {
    selectedDevelopersDispatch,
    selectedDevelopersState,
    selectedGenresState,
    selectedGenresDispatch,
    selectedPlatformsState,
    selectedPlatformsDispatch,
    selectedPublishersState,
    selectedPublishersDispatch,
  };
}
