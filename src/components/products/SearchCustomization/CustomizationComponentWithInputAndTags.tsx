import {
  createContext,
  Dispatch,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

import TagsComponent from "../../game/tags/TagsComponent";
import Input from "../../UI/Input";
import { useInput } from "../../../hooks/useInput";
import LoadingFallback from "../../UI/LoadingFallback";
import Error from "../../UI/Error";
import {
  retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj,
  SearchCustomizationContext,
} from "../../../store/products/SearchCustomizationContext";
import Button from "../../UI/Button";
import {
  ISelectedTags,
  ISelectedTagsReducer,
} from "../../../hooks/searchCustomizationRelated/useCreateUseReducerStateForCustomizationComponentWithInputAndTags";
import useQueryGetTagsAccordingToQuery, {
  useGetTagsAccordingToQueryGenerateQueryKey,
} from "../../../hooks/searchCustomizationRelated/useQueryGetTagsAccordingToQuery";
import useQueryGetTheMostPopularTags from "../../../hooks/searchCustomizationRelated/useQueryGetTheMostPopularTags";
import { useQueryGetTagsAvailableTagsNames } from "../../../hooks/searchCustomizationRelated/useQueryGetTagsTypes";
import { CustomSearchParamsAndSessionStorageEntriesNamesContext } from "../../../store/stateManagement/CustomSearchParamsAndSessionStorageEntriesNamesContext";
import { MainCustomizationComponentsWithInputsAndTagsConfigurationContext } from "./MainCustomizationComponentsWithInputsAndTags";
import { useMutation } from "@tanstack/react-query";
import {
  addProductTag,
  IAddProductTagFnArg,
  queryClient,
} from "../../../lib/fetch";
import {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
  ValidationErrorsArr,
} from "../../UI/FormWithErrorHandling";
import useExtractStableDataOrErrorsFromMyBackendUseQueryResponse from "../../../hooks/queryRelated/useExtractStableDataOrErrorsFromMyBackendUseQueryResponse";
import Header from "../../UI/headers/Header";

type ICustomizationComponentWithInputAndTagsConfigurationContextBody = {
  requiredTagsArr?: useQueryGetTagsAvailableTagsNames[];
  tagsValidationErrors?: ValidationErrorsArr;
};
export const CustomizationComponentWithInputAndTagsConfigurationContext =
  createContext<ICustomizationComponentWithInputAndTagsConfigurationContextBody>(
    {}
  );

export const CustomizationComponentWithInputAndTagsConfigurationContextProvider =
  ({
    children,
    ...ctxBody
  }: ICustomizationComponentWithInputAndTagsConfigurationContextBody & {
    children: ReactNode;
  }) => (
    <CustomizationComponentWithInputAndTagsConfigurationContext.Provider
      value={ctxBody}
    >
      {children}
    </CustomizationComponentWithInputAndTagsConfigurationContext.Provider>
  );

export default function CustomizationComponentWithInputAndTags({
  tagType,
  propertyNameToRetrieveTagFromDataObj,
  headerText,
  inputPlaceholder,
  customGameDocumentPropertyNameForTag,
}: {
  tagType: useQueryGetTagsAvailableTagsNames;
  propertyNameToRetrieveTagFromDataObj: string;
  headerText: string;
  inputPlaceholder: string;
  customGameDocumentPropertyNameForTag?: string;
}) {
  const {
    searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization,
  } = useContext(CustomSearchParamsAndSessionStorageEntriesNamesContext);
  const customSearchParamsAndSessionStorageEntriesNames =
    searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization;

  const relatedSearchParamName =
    retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
      tagType,
      customSearchParamsAndSessionStorageEntriesNames
    );
  const relatedTagType =
    retrieveSearchParamAndSessionStorageEntryNameOrIdOfDeeperStateBasedOnAppropriateCustomizationObj(
      tagType,
      customSearchParamsAndSessionStorageEntriesNames,
      true
    ) as useQueryGetTagsAvailableTagsNames;
  const {
    data: mostPopularTagsData,
    error: mostPopularTagsError,
    isLoading: mostPopularTagsIsLoading,
  } = useQueryGetTheMostPopularTags(
    relatedTagType,
    customGameDocumentPropertyNameForTag
  );

  const [tagSearch, setTagSearch] = useState<string>("");
  const { handleInputChange, queryDebouncingState } = useInput({
    stateValue: tagSearch,
    setStateValue: setTagSearch,
    searchParamName: relatedSearchParamName,
    saveDebouncedStateInSearchParams: false,
    saveDebouncedStateInSessionStorage: false,
  });

  const {
    data: queryTagsData,
    isLoading: queryTagsIsLoading,
    error: queryTagsError,
  } = useQueryGetTagsAccordingToQuery(
    queryDebouncingState,
    relatedTagType,
    customGameDocumentPropertyNameForTag
  );

  const typedCustomQuery = queryDebouncingState !== "";
  let selectedTagsState: ISelectedTags;
  let selectedTagsDispatch: Dispatch<ISelectedTagsReducer>;

  const searchCustomizationContext = useContext(SearchCustomizationContext);
  const configurationForAllTagTypes = useContext(
    MainCustomizationComponentsWithInputsAndTagsConfigurationContext
  );
  const curTagConfiguration = configurationForAllTagTypes[tagType];
  const {
    searchCustomizationCtxDispatchName,
    searchCustomizationCtxStateName,
    mainCustomizationComponentsWithInputsAndTagsConfigurationCtxDispatchName,
    mainCustomizationComponentsWithInputsAndTagsConfigurationCtxStateName,
  } = curTagConfiguration;
  if (searchCustomizationCtxStateName && searchCustomizationCtxDispatchName) {
    selectedTagsState = searchCustomizationContext[
      searchCustomizationCtxStateName
    ] as ISelectedTags;
    selectedTagsDispatch = searchCustomizationContext[
      searchCustomizationCtxDispatchName
    ] as Dispatch<ISelectedTagsReducer>;
  }
  if (
    mainCustomizationComponentsWithInputsAndTagsConfigurationCtxDispatchName &&
    mainCustomizationComponentsWithInputsAndTagsConfigurationCtxStateName
  ) {
    selectedTagsState = configurationForAllTagTypes[
      mainCustomizationComponentsWithInputsAndTagsConfigurationCtxStateName
    ] as ISelectedTags;
    selectedTagsDispatch = configurationForAllTagTypes[
      mainCustomizationComponentsWithInputsAndTagsConfigurationCtxDispatchName
    ] as Dispatch<ISelectedTagsReducer>;
  }

  const { allowToAddNonExistentTags } = configurationForAllTagTypes;
  const [addProductTagShowSuccessMessage, setAddProductTagShowSuccessMessage] =
    useState(false);
  const queryTagsQueryKeyStable = useGetTagsAccordingToQueryGenerateQueryKey(
    queryDebouncingState,
    relatedTagType
  );
  const handleAddProductTagMutationOptimisticUpdateError = (
    ctx: unknown,
    queryArg: IAddProductTagFnArg
  ) => {
    queryClient.setQueryData(queryTagsQueryKeyStable, { data: ctx });
    selectedTagsDispatch({
      type: "REMOVE_VALUE_FROM_ARR",
      payload: { value: queryArg.tagName },
    });
  };
  const {
    mutate: addProductTagMutate,
    data: addProductTagQueryData,
    error: addProductTagQueryError,
    isPending: addProductTagIsPending,
  } = useMutation<
    FormActionBackendResponse,
    FormActionBackendErrorResponse,
    IAddProductTagFnArg
  >({
    mutationFn: addProductTag,
    onMutate: (queryArg) => {
      const curQueryTagsData = queryClient.getQueryData<{ data: unknown[] }>(
        queryTagsQueryKeyStable
      )?.data;
      queryClient.setQueryData(queryTagsQueryKeyStable, {
        data: [
          ...(curQueryTagsData ? curQueryTagsData : []),
          {
            name: queryArg.tagName,
          },
        ],
      });
      selectedTagsDispatch({
        type: "ADD_VALUE_TO_ARR",
        payload: { value: queryArg.tagName },
      });

      return curQueryTagsData;
    },
    onError: (_, queryArg, ctx) =>
      handleAddProductTagMutationOptimisticUpdateError(ctx, queryArg),
    onSuccess: (queryData, queryArg, ctx) =>
      typeof queryData.data === "object"
        ? handleAddProductTagMutationOptimisticUpdateError(ctx, queryArg)
        : setAddProductTagShowSuccessMessage(true),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryTagsQueryKeyStable }),
  });
  const {
    stableData: addProductTagData,
    stableOtherErrors: addProductTagOtherErrors,
    stableValidationErrors: addProductTagValidationErrors,
  } = useExtractStableDataOrErrorsFromMyBackendUseQueryResponse(
    addProductTagQueryData,
    addProductTagQueryError
  );

  const addProductTagSuccessMessage = addProductTagShowSuccessMessage &&
    addProductTagData && (
      <Header>{`${addProductTagData} has been added to the ${headerText.toLowerCase()} list!`}</Header>
    );
  const handleTagsInputChangeWithSuccessReset = useCallback(
    (newValue: string) => {
      addProductTagShowSuccessMessage &&
        setAddProductTagShowSuccessMessage(false);
      handleInputChange(newValue);
    },
    [addProductTagShowSuccessMessage, handleInputChange]
  );

  let content;
  if (
    (typedCustomQuery && queryTagsIsLoading) ||
    (!typedCustomQuery && mostPopularTagsIsLoading)
  )
    content = <LoadingFallback />;
  else if (typedCustomQuery && queryTagsError)
    content = <Error message={queryTagsError.message} />;
  else if (!typedCustomQuery && mostPopularTagsError)
    content = <Error message={mostPopularTagsError.message} />;
  else if (typedCustomQuery && queryTagsData && queryTagsData.data.length === 0)
    content = (
      <section className="flex flex-col gap-4">
        <p>No tags related to the provided query have been found!</p>
        {allowToAddNonExistentTags && (
          <>
            <Button
              disabled={
                addProductTagIsPending || addProductTagData !== undefined
              }
              onClick={
                addProductTagIsPending
                  ? undefined
                  : () =>
                      addProductTagMutate({
                        tagName: queryDebouncingState,
                        tagId: relatedTagType,
                      })
              }
            >
              {addProductTagIsPending
                ? "Adding..."
                : addProductTagData !== undefined
                ? "Added!"
                : `Add ${queryDebouncingState}`}
            </Button>
            {addProductTagIsPending && (
              <LoadingFallback customText="Adding specified tag..." />
            )}
            {(addProductTagOtherErrors || addProductTagValidationErrors) && (
              <Error
                smallVersion
                message={
                  (addProductTagOtherErrors
                    ? addProductTagOtherErrors
                    : (addProductTagValidationErrors as ValidationErrorsArr)[0]
                  ).message
                }
              />
            )}
          </>
        )}
      </section>
    );
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
            passedKey={`search-customization-tag-btn-${relatedSearchParamName}-${tag}${
              selectedTagsState.stateArr.includes(tag) ? "-active" : ""
            }`}
          >
            {tag}
          </Button>
        )}
      </TagsComponent>
    );

  const { requiredTagsArr, tagsValidationErrors } = useContext(
    CustomizationComponentWithInputAndTagsConfigurationContext
  );
  const curTagValidationError = tagsValidationErrors?.find(
    (tagValidationError) => tagValidationError.errInputName === tagType
  );

  return (
    <article className="flex flex-col justify-center items-center gap-3 py-2 w-full">
      <h2 className="text-highlightRed">{`${headerText}${
        requiredTagsArr && requiredTagsArr.includes(tagType) ? "*" : ""
      }`}</h2>
      <div className="flex flex-col justify-center items-center gap-3">
        <TagsComponent tags={selectedTagsState!.stateArr}>
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
            onChange={handleTagsInputChangeWithSuccessReset}
            width="min-w-1/2"
            disabled={addProductTagIsPending}
          />
        </div>
        {content}
        {addProductTagSuccessMessage}
      </div>
      {curTagValidationError && (
        <Error smallVersion message={curTagValidationError.message} />
      )}
    </article>
  );
}
