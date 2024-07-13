import { Dispatch, useContext, useState } from "react";

import TagsComponent from "../../game/tags/TagsComponent";
import Input from "../../UI/Input";
import { useInput } from "../../../hooks/useInput";
import LoadingFallback from "../../UI/LoadingFallback";
import Error from "../../UI/Error";
import {
  ISearchCustomizationContext,
  SearchCustomizationContext,
} from "../../../store/products/SearchCustomizationContext";
import Button from "../../UI/Button";
import {
  ISelectedTags,
  ISelectedTagsReducer,
} from "../../../hooks/searchCustomizationRelated/useCreateUseReducerStateForCustomizationComponentWithInputAndTags";
import useQueryGetTagsAccordingToQuery from "../../../hooks/searchCustomizationRelated/useQueryGetTagsAccordingToQuery";
import useQueryGetTheMostPopularTags from "../../../hooks/searchCustomizationRelated/useQueryGetTheMostPopularTags";
import { useQueryGetTagsAvailableTagsNames } from "../../../hooks/searchCustomizationRelated/useQueryGetTagsTypes";

export default function CustomizationComponentWithInputAndTags({
  paramName,
  searchCustomizationCtxStateName,
  searchCustomizationCtxDispatchName,
  propertyNameToRetrieveTagFromDataObj,
  headerText,
  inputPlaceholder,
  customGameDocumentPropertyNameForTag,
}: {
  paramName: useQueryGetTagsAvailableTagsNames;
  searchCustomizationCtxStateName: keyof ISearchCustomizationContext;
  searchCustomizationCtxDispatchName: keyof ISearchCustomizationContext;
  propertyNameToRetrieveTagFromDataObj: string;
  headerText: string;
  inputPlaceholder: string;
  customGameDocumentPropertyNameForTag?: string;
}) {
  const {
    data: mostPopularTagsData,
    error: mostPopularTagsError,
    isLoading: mostPopularTagsIsLoading,
  } = useQueryGetTheMostPopularTags(
    paramName,
    customGameDocumentPropertyNameForTag
  );

  const [tagSearch, setTagSearch] = useState<string>("");
  const { handleInputChange, queryDebouncingState } = useInput({
    stateValue: tagSearch,
    setStateValue: setTagSearch,
    searchParamName: paramName,
    saveDebouncedStateInSearchParamsAndSessionStorage: false,
  });

  const {
    data: queryTagsData,
    isLoading: queryTagsIsLoading,
    error: queryTagsError,
  } = useQueryGetTagsAccordingToQuery(
    queryDebouncingState,
    paramName,
    customGameDocumentPropertyNameForTag
  );

  const typedCustomQuery = queryDebouncingState !== "";

  const ctx = useContext(SearchCustomizationContext);
  const selectedTagsState = ctx[
    searchCustomizationCtxStateName
  ] as ISelectedTags;
  const selectedTagsDispatch = ctx[
    searchCustomizationCtxDispatchName
  ] as Dispatch<ISelectedTagsReducer>;

  let content;
  if (
    (typedCustomQuery && mostPopularTagsIsLoading) ||
    (!typedCustomQuery && queryTagsIsLoading)
  )
    content = <LoadingFallback />;
  else if (typedCustomQuery && queryTagsError)
    content = <Error message={queryTagsError.message} />;
  else if (!typedCustomQuery && mostPopularTagsError)
    content = <Error message={mostPopularTagsError.message} />;
  else if (typedCustomQuery && queryTagsData && queryTagsData.data.length === 0)
    content = <p>No genres similar to the provided query have been found</p>;
  else if (
    (typedCustomQuery && queryTagsData) ||
    (!typedCustomQuery && mostPopularTagsData)
  )
    content = (
      <TagsComponent
        tags={
          typedCustomQuery
            ? queryTagsData!.data.map(
                (tag) =>
                  tag![
                    propertyNameToRetrieveTagFromDataObj as keyof typeof tag
                  ] as string
              )
            : mostPopularTagsData!.data.map(
                (tag) =>
                  tag![
                    propertyNameToRetrieveTagFromDataObj as keyof typeof tag
                  ] as string
              )
        }
      >
        {(tag) => (
          <Button
            onClick={() =>
              selectedTagsDispatch({
                type: selectedTagsState.stateArr.includes(tag)
                  ? "REMOVE_VALUE_FROM_ARR"
                  : "ADD_VALUE_TO_ARR",
                payload: {
                  value: tag,
                },
              })
            }
            disabled={
              selectedTagsState.stateArr.includes(tag) !==
              selectedTagsState.debouncedStateArr.includes(tag)
            }
            active={selectedTagsState.stateArr.includes(tag)}
            canClickWhileActive
          >
            {tag}
          </Button>
        )}
      </TagsComponent>
    );

  return (
    <article className="flex flex-col justify-center items-center gap-3 py-2 w-full">
      <h2 className="text-highlightRed">{headerText}</h2>
      <div className="flex flex-col justify-center items-center gap-3">
        <TagsComponent tags={selectedTagsState.stateArr}>
          {(tag) => (
            <Button
              onClick={() =>
                selectedTagsDispatch({
                  type: "REMOVE_VALUE_FROM_ARR",
                  payload: {
                    value: tag,
                  },
                })
              }
              disabled={
                selectedTagsState.stateArr.includes(tag) !==
                selectedTagsState.debouncedStateArr.includes(tag)
              }
            >
              {tag}
            </Button>
          )}
        </TagsComponent>
        <div className="w-full py-3">
          <Input
            placeholder={inputPlaceholder}
            value={tagSearch}
            onChange={handleInputChange}
            width="min-w-1/2"
          />
        </div>
        {content}
      </div>
    </article>
  );
}
