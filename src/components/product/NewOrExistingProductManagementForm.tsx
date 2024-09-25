import {
  Reducer,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useMutation } from "@tanstack/react-query";

import { IExtendedGamePreviewGameArg } from "../products/ExtendedGamePreview";
import FormWithErrorHandling, {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
  IFormInputField,
  IValidationErr,
  ValidationErrorsArr,
} from "../UI/FormWithErrorHandling";
import { productManagement, queryClient } from "../../lib/fetch";
import TabsComponent, {
  ITagsObjDefault,
  TabsComponentContext,
} from "../structure/TabsComponent";
import Button from "../UI/Button";
import InputFieldElement, {
  InputFieldSingleRow,
} from "../UI/InputFieldElement";
import {
  changeObjectKeysPrefix,
  changeStrPrefix,
} from "../../helpers/changeStrPrefix";
import {
  existingProductManagementInputFieldsNames,
  existingProductManagementInputFieldsObjs,
  IInputFieldsObjsGenerator,
  newProductManagementInputFieldsObjs,
} from "../../lib/inputFieldsObjs";
import useCompareComplexForUseMemo from "../../hooks/useCompareComplexForUseMemo";
import filterOrOnlyIncludeCertainPropertiesFromObj from "../../helpers/filterOrOnlyIncludeCertainPropertiesFromObj";
import XSign from "../UI/XSign";
import Header from "../UI/headers/Header";
import { useInput } from "../../hooks/useInput";
import { FreeToPlayTag, priceFormat } from "../game/PriceTag";
import calcShopPrice from "../../helpers/calcShopPrice";
import usePrepareSearchCustomizationTagsState, {
  IInitialTagsState,
} from "../../hooks/searchCustomizationRelated/usePrepareSearchCustomizationTagsState";
import { CustomSearchParamsAndSessionStorageEntriesNamesContext } from "../../store/stateManagement/CustomSearchParamsAndSessionStorageEntriesNamesContext";
import MainCustomizationComponentsWithInputsAndTags, {
  componentsWithInputsAndTagsConfigurationContextInformationDefault,
  MainCustomizationComponentsWithInputsAndTagsConfigurationContextProvider,
} from "../products/SearchCustomization/MainCustomizationComponentsWithInputsAndTags";
import { useQueryGetTagsAvailableTagsNames } from "../../hooks/searchCustomizationRelated/useQueryGetTagsTypes";
import { IMaxAmountOfSelectedTagsObj } from "../../store/products/SearchCustomizationContext";
import { cloneDeep } from "lodash";
import { inputValue } from "../UI/Input";
import DatePickerInputFieldElement, {
  dateRegex,
} from "../UI/DatePickerInputFieldElement";
import createDateNoTakingTimezoneIntoAccount from "../../helpers/createDateNoTakingTimezoneIntoAccount";
import ArtworksManagement, {
  ArtworksManagementContextProvider,
  useGenerateBasicArtworksManagementState,
} from "./ArtworksManagement";
import { CustomizationComponentWithInputAndTagsConfigurationContextProvider } from "../products/SearchCustomization/CustomizationComponentWithInputAndTags";
import Error from "../UI/Error";
import { ManageProductsContext } from "../../store/userPanel/admin/products/ManageProductsContext";
import { IGame } from "../../models/game.model";

const newOrExistingProductManagementMaxAmountOfSelectedTabs: IMaxAmountOfSelectedTagsObj =
  {
    maxDevelopers: 1,
    maxPublishers: 1,
  };

interface INewOrExistingProductManagementStateEntryValue {
  adminChoseToEdit: boolean;
  newValue?: unknown;
}
const newOrExistingProductManagementStatePossiblePropertiesToEditAsInputFields =
  ["title", "storyLine", "summary", "releaseDate"] as const;
type newOrExistingProductManagementStatePossiblePropertiesToEditAsInputFields =
  (typeof newOrExistingProductManagementStatePossiblePropertiesToEditAsInputFields)[number];
const necessaryGameTagsWhenAddingANewGame = ["genres", "platforms"] as const;
const productManagementStateTagsProperties = [
  ...necessaryGameTagsWhenAddingANewGame,
  "developers",
  "publishers",
] as const;
const receivedGameTagsProperties = [
  ...necessaryGameTagsWhenAddingANewGame,
  "publisher",
  "developer",
] as const;
type receivedGameTagsProperties = (typeof receivedGameTagsProperties)[number];
type productManagementStateTagsProperties =
  (typeof productManagementStateTagsProperties)[number];
const newOrExistingProductManagementStatePossiblePropertiesToEdit = [
  "priceManagement",
  "artworks",
  ...productManagementStateTagsProperties,
  ...newOrExistingProductManagementStatePossiblePropertiesToEditAsInputFields,
] as const;
type newOrExistingProductManagementStatePossiblePropertiesToEdit =
  (typeof newOrExistingProductManagementStatePossiblePropertiesToEdit)[number];
type INewOrExistingProductManagementState = {
  [entryName in newOrExistingProductManagementStatePossiblePropertiesToEdit]: INewOrExistingProductManagementStateEntryValue;
};
export type INewOrExistingProductManagementStateToSend = {
  [entryName in newOrExistingProductManagementStatePossiblePropertiesToEdit]?: unknown;
} & { productId?: string };
type IProductManagementPriceManagementPropertyValue = {
  discount: number;
  price: number;
};
type ICustomInitialProductManagementPossiblePropertiesValues = {
  [key in newOrExistingProductManagementStatePossiblePropertiesToEdit]?: unknown;
};
const customInitialProductManagementPossiblePropertiesValues: ICustomInitialProductManagementPossiblePropertiesValues =
  {
    priceManagement: { discount: 0, price: 0 },
    ...Object.fromEntries(
      productManagementStateTagsProperties.map(
        (productManagementStateTagsProperty) => [
          productManagementStateTagsProperty,
          [],
        ]
      )
    ),
  };
const newOrExistingProductManagementReducer: Reducer<
  INewOrExistingProductManagementState,
  | {
      type: "CHANGE_CHOSE_TO_EDIT";
      payload: newOrExistingProductManagementStatePossiblePropertiesToEdit;
    }
  | {
      type: "CHANGE_NEW_VALUE";
      payload: {
        propertyName: newOrExistingProductManagementStatePossiblePropertiesToEdit;
        newValue: unknown;
      };
    }
> = (state, action) => {
  const { type, payload } = action;
  if (type === "CHANGE_CHOSE_TO_EDIT")
    return {
      ...state,
      [payload]: {
        ...state[payload],
        adminChoseToEdit: !state[payload].adminChoseToEdit,
      },
    };
  if (type === "CHANGE_NEW_VALUE") {
    const { newValue, propertyName } = payload;
    return { ...state, [propertyName]: { ...state[propertyName], newValue } };
  }
  return state;
};
const newOrExistingProductManagementInitialStateGenerator = (
  sentCustomInitialProductManagementPossiblePropertiesValues?: ICustomInitialProductManagementPossiblePropertiesValues
) =>
  newOrExistingProductManagementStatePossiblePropertiesToEdit.reduce(
    (acc, newOrExistingProductManagementStatePossiblePropertyToEdit) => ({
      ...acc,
      [newOrExistingProductManagementStatePossiblePropertyToEdit]: {
        adminChoseToEdit: false,
        newValue:
          sentCustomInitialProductManagementPossiblePropertiesValues &&
          newOrExistingProductManagementStatePossiblePropertyToEdit in
            sentCustomInitialProductManagementPossiblePropertiesValues
            ? sentCustomInitialProductManagementPossiblePropertiesValues[
                newOrExistingProductManagementStatePossiblePropertyToEdit
              ]
            : newOrExistingProductManagementStatePossiblePropertyToEdit in
              customInitialProductManagementPossiblePropertiesValues
            ? customInitialProductManagementPossiblePropertiesValues[
                newOrExistingProductManagementStatePossiblePropertyToEdit
              ]
            : undefined,
      },
    }),
    {}
  ) as INewOrExistingProductManagementState;

const newProductManagementInitialStateGenerator = () =>
  Object.fromEntries(
    Object.entries(newOrExistingProductManagementInitialStateGenerator()).map(
      (newOrExistingProductManagementInitialStateGeneratorEntry) => [
        newOrExistingProductManagementInitialStateGeneratorEntry[0],
        {
          ...newOrExistingProductManagementInitialStateGeneratorEntry[1],
          adminChoseToEdit: true,
        },
      ]
    )
  ) as INewOrExistingProductManagementState;

const changeProductManagementInputFieldsObjsSoThatTheySuitStateNames = <
  T extends string,
  Y extends IInputFieldsObjsGenerator<T>
>(
  inputFieldsObjs: Y,
  curPrefix: string
) =>
  changeObjectKeysPrefix(
    inputFieldsObjs,
    curPrefix + "Product",
    "",
    true,
    (productManagementInputFieldsObjsEntryValue, newKeyName) => ({
      ...productManagementInputFieldsObjsEntryValue,
      name: newKeyName,
      omitMovingTheInputFieldUponSelecting: true,
    })
  ) as IInputFieldsObjsGenerator<
    changeStrPrefix<
      existingProductManagementInputFieldsNames,
      "existingProduct",
      "",
      true
    >
  >;
const existingProductManagementInputFieldsObjsTransformed =
  changeProductManagementInputFieldsObjsSoThatTheySuitStateNames(
    existingProductManagementInputFieldsObjs,
    "existing"
  );
const newProductManagementInputFieldsObjsTransformed =
  changeProductManagementInputFieldsObjsSoThatTheySuitStateNames(
    newProductManagementInputFieldsObjs,
    "new"
  );
const applyDefaultValuesToInputFieldsObjsBasedOnObjWithRelatedInputFieldsNamesAsProperties =
  function <
    inputFieldsNames extends string,
    T extends { [defaultInputFieldValue in inputFieldsNames]?: unknown }
  >(inputFields: IInputFieldsObjsGenerator<inputFieldsNames>, obj?: T) {
    if (!obj) return inputFields;
    const inputFieldsCopy = cloneDeep(inputFields);
    Object.entries(obj).forEach(([key, value]) => {
      if (key in inputFieldsCopy)
        inputFieldsCopy[key as keyof typeof inputFieldsCopy].defaultValue =
          value as inputValue;
    });
    return inputFieldsCopy;
  };

const customPossibleProductManagementTabsToChooseFromHeadersMap: {
  [key in newOrExistingProductManagementStatePossiblePropertiesToEdit]?: string;
} = {
  storyLine: "Story Line",
  priceManagement: "Price Management",
  releaseDate: "Release Date",
};

const inputFieldsNamesFromPriceManagement = ["price", "discount"] as const;
type inputFieldsNamesFromPriceManagement =
  (typeof inputFieldsNamesFromPriceManagement)[number];

const curDate = createDateNoTakingTimezoneIntoAccount({});

const defaultNewGameValidationErrors: ValidationErrorsArr = [];

export default function NewOrExistingProductManagementForm({
  gameStable,
}: {
  gameStable?: IExtendedGamePreviewGameArg;
}) {
  const newOrExistingProductManagementInitialStateGenerated = useMemo(
    () =>
      gameStable
        ? newOrExistingProductManagementInitialStateGenerator({
            priceManagement: {
              discount: gameStable.discount,
              price: gameStable.price,
            },
          })
        : newProductManagementInitialStateGenerator(),
    [gameStable]
  );
  const [
    newOrExistingProductManagementState,
    newOrExistingProductManagementDispatch,
  ] = useReducer(
    newOrExistingProductManagementReducer,
    newOrExistingProductManagementInitialStateGenerated
  );
  const newOrExistingProductManagementStateStable = useCompareComplexForUseMemo(
    newOrExistingProductManagementState
  );

  const priceManagementObjValue = newOrExistingProductManagementStateStable
    .priceManagement.newValue as IProductManagementPriceManagementPropertyValue;
  const { price: inputPrice, discount: inputDiscount } =
    priceManagementObjValue;
  let { discount: setDiscount, price: setPrice } =
    newOrExistingProductManagementStateStable.priceManagement
      .newValue as IProductManagementPriceManagementPropertyValue;
  setDiscount ||= 0;
  setPrice ||= 0;
  const { handleInputChange: productPriceHandleInputChange } = useInput({
    stateValue: inputPrice,
    setStateValue: (newDiscount: number) =>
      newOrExistingProductManagementDispatch({
        type: "CHANGE_NEW_VALUE",
        payload: {
          propertyName: "priceManagement",
          newValue: {
            ...priceManagementObjValue,
            price: newDiscount,
          },
        },
      }),
    searchParamName: "admin-product-management-price",
    saveDebouncedStateInSearchParams: false,
    saveDebouncedStateInSessionStorage: false,
  });
  const { handleInputChange: productDiscountHandleInputChange } = useInput({
    stateValue: inputDiscount,
    setStateValue: (newDiscount: number) =>
      newOrExistingProductManagementDispatch({
        type: "CHANGE_NEW_VALUE",
        payload: {
          propertyName: "priceManagement",
          newValue: {
            ...priceManagementObjValue,
            discount: newDiscount,
          },
        },
      }),
    searchParamName: "admin-product-management-discount",
    saveDebouncedStateInSearchParams: false,
    saveDebouncedStateInSessionStorage: false,
  });

  const { setSelectedProductIdAndDebouncedOne } = useContext(
    ManageProductsContext
  );

  const {
    setNormalAndDebouncingTabsState:
      setNormalAndDebouncingManageProductsTagState,
  } = useContext(TabsComponentContext);
  const productManagementQueryRes = useMutation<
    FormActionBackendResponse<IGame>,
    FormActionBackendErrorResponse,
    INewOrExistingProductManagementStateToSend
  >({
    mutationFn: productManagement,
    onSuccess: async (queryRes) => {
      if (!(queryRes.data as { message?: string })?.message) {
        const createdOrEditedProductInformation = queryRes.data as IGame;
        await queryClient.invalidateQueries({
          queryKey: ["games", createdOrEditedProductInformation._id],
        });
        if (!gameStable)
          setSelectedProductIdAndDebouncedOne(
            createdOrEditedProductInformation._id
          );
        setNormalAndDebouncingManageProductsTagState("overview");
      }
    },
  });
  const { mutate: productManagementMutate } = productManagementQueryRes;
  const editExistingProduct = gameStable !== undefined;

  const handleChangeProductManagementStatePropertyActiveStatus = useCallback(
    (
      propertyName: newOrExistingProductManagementStatePossiblePropertiesToEdit
    ) =>
      newOrExistingProductManagementDispatch({
        type: "CHANGE_CHOSE_TO_EDIT",
        payload: propertyName,
      }),
    []
  );
  const possibleTabsToChooseFromInOrderToEditIndividualProperties: ITagsObjDefault<newOrExistingProductManagementStatePossiblePropertiesToEdit>[] =
    useMemo(
      () =>
        newOrExistingProductManagementStatePossiblePropertiesToEdit.map(
          (newOrExistingProductManagementStatePossiblePropertyToEdit) => ({
            ComponentToRender: (
              <Button
                onClick={handleChangeProductManagementStatePropertyActiveStatus.bind(
                  null,
                  newOrExistingProductManagementStatePossiblePropertyToEdit
                )}
              >
                Add to editable properties
              </Button>
            ),
            tagName: newOrExistingProductManagementStatePossiblePropertyToEdit,
            header:
              newOrExistingProductManagementStatePossiblePropertyToEdit in
              customPossibleProductManagementTabsToChooseFromHeadersMap
                ? customPossibleProductManagementTabsToChooseFromHeadersMap[
                    newOrExistingProductManagementStatePossiblePropertyToEdit
                  ]
                : newOrExistingProductManagementStatePossiblePropertyToEdit.replace(
                    newOrExistingProductManagementStatePossiblePropertyToEdit[0],
                    newOrExistingProductManagementStatePossiblePropertyToEdit[0].toUpperCase()
                  ),
          })
        ) as ITagsObjDefault<newOrExistingProductManagementStatePossiblePropertiesToEdit>[],
      [handleChangeProductManagementStatePropertyActiveStatus]
    );

  const inputFieldsObjsInUse = useMemo(
    () =>
      applyDefaultValuesToInputFieldsObjsBasedOnObjWithRelatedInputFieldsNamesAsProperties(
        gameStable
          ? existingProductManagementInputFieldsObjsTransformed
          : newProductManagementInputFieldsObjsTransformed,
        gameStable
          ? filterOrOnlyIncludeCertainPropertiesFromObj(gameStable, [
              "price",
              "discount",
            ])
          : undefined
      ),
    [gameStable]
  );
  inputFieldsObjsInUse.discount;
  const availableProductManagementInputFields = useMemo(() => {
    const curActivatedProductManagementProperties = Object.entries(
      newOrExistingProductManagementStateStable
    )
      .filter(
        (newOrExistingProductManagementStateEntry) =>
          newOrExistingProductManagementStateEntry[1].adminChoseToEdit
      )
      .map(
        (newOrExistingProductManagementStateEntry) =>
          newOrExistingProductManagementStateEntry[0]
      );
    return filterOrOnlyIncludeCertainPropertiesFromObj(
      inputFieldsObjsInUse,
      curActivatedProductManagementProperties,
      true
    ) as
      | typeof existingProductManagementInputFieldsObjsTransformed
      | typeof newProductManagementInputFieldsObjsTransformed;
  }, [inputFieldsObjsInUse, newOrExistingProductManagementStateStable]);

  const ProductManagementPropertyXSign = useCallback(
    ({
      productManagementPropertyName,
    }: {
      productManagementPropertyName: newOrExistingProductManagementStatePossiblePropertiesToEdit;
    }) =>
      gameStable ? (
        <XSign
          disabled={productManagementQueryRes.isPending}
          onClick={handleChangeProductManagementStatePropertyActiveStatus.bind(
            null,
            productManagementPropertyName
          )}
        />
      ) : undefined,
    [
      handleChangeProductManagementStatePropertyActiveStatus,
      productManagementQueryRes.isPending,
      gameStable,
    ]
  );

  const finalPrice = calcShopPrice(setPrice, setDiscount);
  const finalPriceFormatted = priceFormat.format(finalPrice);

  const {
    searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization,
  } = useContext(CustomSearchParamsAndSessionStorageEntriesNamesContext);
  const initialProductTagsState = useMemo(
    () =>
      gameStable
        ? receivedGameTagsProperties.reduce<IInitialTagsState>(
            (acc, gameTagProperty) => {
              if (gameTagProperty in gameStable && gameStable[gameTagProperty])
                acc![
                  gameTagProperty === "publisher"
                    ? "publishers"
                    : gameTagProperty === "developer"
                    ? "developers"
                    : gameTagProperty
                ] = Array.isArray(gameStable[gameTagProperty])
                  ? gameStable[gameTagProperty].map(
                      (gameTagObj) => (gameTagObj as { name: string }).name
                    )
                  : [(gameStable[gameTagProperty] as { name: string }).name];
              return acc;
            },
            {}
          )
        : undefined,
    [gameStable]
  );
  const {
    selectedDevelopersDispatch,
    selectedDevelopersState,
    selectedGenresDispatch,
    selectedGenresState,
    selectedPlatformsDispatch,
    selectedPlatformsState,
    selectedPublishersDispatch,
    selectedPublishersState,
  } = usePrepareSearchCustomizationTagsState(
    searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization,
    newOrExistingProductManagementMaxAmountOfSelectedTabs,
    true,
    initialProductTagsState
  );

  const choseToEditArtworks =
    newOrExistingProductManagementStateStable.artworks.adminChoseToEdit;
  const selectedGameArtworksStable = useMemo(
    () => gameStable?.artworks,
    [gameStable]
  );
  const artworksManagementState = useGenerateBasicArtworksManagementState(
    selectedGameArtworksStable
  );
  const [newGameFieldsValidationErrors, setNewGameFieldsValidationErrors] =
    useState<ValidationErrorsArr>(defaultNewGameValidationErrors);

  const handleSubmitProductManagement = useCallback(
    (formDataObj: {
      [entryName in
        | newOrExistingProductManagementStatePossiblePropertiesToEditAsInputFields
        | inputFieldsNamesFromPriceManagement]: unknown;
    }) => {
      const mutate = () =>
        productManagementMutate({
          ...filterOrOnlyIncludeCertainPropertiesFromObj(
            formDataObj,
            inputFieldsNamesFromPriceManagement as unknown as string[]
          ),
          priceManagement: {
            price: setPrice,
            discount: setDiscount,
            finalPrice,
          },
          developers: selectedDevelopersState.debouncedStateArr,
          genres: selectedGenresState.debouncedStateArr,
          platforms: selectedPlatformsState.debouncedStateArr,
          publishers: selectedPublishersState.debouncedStateArr,
          productId: gameStable?._id,
          ...(choseToEditArtworks && {
            artworks: artworksManagementState.currentArtworksStable,
          }),
        });
      if (gameStable) return mutate();
      let encounteredValidationErrors = false;
      setNewGameFieldsValidationErrors(() => {
        const newGameFieldsValidationErrorsToSet: ValidationErrorsArr = [];
        const tagsValidationErrorGenerator = (
          singleTagName: useQueryGetTagsAvailableTagsNames
        ): IValidationErr => ({
          message: `You have to select at least one ${singleTagName} for the game you would like to add!`,
          errInputName: singleTagName,
        });
        if (selectedGenresState.debouncedStateArr.length === 0)
          newGameFieldsValidationErrorsToSet.push(
            tagsValidationErrorGenerator("genres")
          );
        if (selectedPlatformsState.debouncedStateArr.length === 0)
          newGameFieldsValidationErrorsToSet.push(
            tagsValidationErrorGenerator("platforms")
          );
        if (!dateRegex.test(formDataObj.releaseDate as string))
          newGameFieldsValidationErrorsToSet.push({
            errInputName: "releaseDate",
            message: "Invalid release date provided!",
          });

        if (newGameFieldsValidationErrorsToSet.length === 0)
          return defaultNewGameValidationErrors;
        encounteredValidationErrors = true;
        return newGameFieldsValidationErrorsToSet;
      });
      if (!encounteredValidationErrors) return mutate();
    },
    [
      gameStable,
      productManagementMutate,
      setPrice,
      setDiscount,
      finalPrice,
      selectedDevelopersState.debouncedStateArr,
      selectedGenresState.debouncedStateArr,
      selectedPlatformsState.debouncedStateArr,
      selectedPublishersState.debouncedStateArr,
      choseToEditArtworks,
      artworksManagementState.currentArtworksStable,
    ]
  );

  const tagTypesToShowStable = useMemo(
    () =>
      Object.entries(newOrExistingProductManagementStateStable)
        .filter(
          (newOrExistingProductManagementStateStableEntry) =>
            productManagementStateTagsProperties.includes(
              newOrExistingProductManagementStateStableEntry[0] as productManagementStateTagsProperties
            ) &&
            newOrExistingProductManagementStateStableEntry[1].adminChoseToEdit
        )
        .map(
          (newOrExistingProductManagementStateStableEntry) =>
            newOrExistingProductManagementStateStableEntry[0]
        ),
    [newOrExistingProductManagementStateStable]
  );
  const tagsComponentsXSign = useCallback(
    (tagName: useQueryGetTagsAvailableTagsNames) => (
      <ProductManagementPropertyXSign productManagementPropertyName={tagName} />
    ),
    [ProductManagementPropertyXSign]
  );

  const newGameInvalidReleaseDateError = newGameFieldsValidationErrors.find(
    (newGameFieldsValidationError) =>
      newGameFieldsValidationError.errInputName === "releaseDate"
  )?.message;
  const newGameFieldsValidationErrorsStable = useCompareComplexForUseMemo(
    newGameFieldsValidationErrors
  );

  return (
    <>
      <TabsComponent
        useAlternativeLookAsASlider
        defaultTabsStateValue={
          "title" as newOrExistingProductManagementStatePossiblePropertiesToEdit
        }
        possibleTabsStable={
          possibleTabsToChooseFromInOrderToEditIndividualProperties
        }
        generateAvailableTabsFromAllFnStable={(allTabs) =>
          allTabs.filter(
            (tab) =>
              !newOrExistingProductManagementState[tab.tagName].adminChoseToEdit
          )
        }
      />
      <section id="product-tags-management" className="flex flex-col gap-6">
        <MainCustomizationComponentsWithInputsAndTagsConfigurationContextProvider
          selectedDevelopersState={selectedDevelopersState}
          selectedDevelopersDispatch={selectedDevelopersDispatch}
          selectedGenresDispatch={selectedGenresDispatch}
          selectedGenresState={selectedGenresState}
          selectedPlatformsDispatch={selectedPlatformsDispatch}
          selectedPlatformsState={selectedPlatformsState}
          selectedPublishersState={selectedPublishersState}
          selectedPublishersDispatch={selectedPublishersDispatch}
          allowToAddNonExistentTags
          {...componentsWithInputsAndTagsConfigurationContextInformationDefault}
        >
          <CustomizationComponentWithInputAndTagsConfigurationContextProvider
            requiredTagsArr={
              gameStable
                ? []
                : (necessaryGameTagsWhenAddingANewGame as unknown as useQueryGetTagsAvailableTagsNames[])
            }
            tagsValidationErrors={newGameFieldsValidationErrorsStable}
          >
            <MainCustomizationComponentsWithInputsAndTags
              tagTypesToShowStable={
                tagTypesToShowStable as useQueryGetTagsAvailableTagsNames[]
              }
              additionalContentAtTheBeginningOfEachComponent={
                tagsComponentsXSign
              }
            />
          </CustomizationComponentWithInputAndTagsConfigurationContextProvider>
        </MainCustomizationComponentsWithInputsAndTagsConfigurationContextProvider>
      </section>
      <FormWithErrorHandling
        queryRelatedToActionState={productManagementQueryRes}
        onSubmit={handleSubmitProductManagement}
        customFlexGap="gap-6"
      >
        {Object.values(availableProductManagementInputFields).map(
          (availableProductManagementFieldObj: IFormInputField) =>
            availableProductManagementFieldObj.type !== "date" ? (
              <InputFieldElement
                inputFieldObjFromProps={availableProductManagementFieldObj}
                key={availableProductManagementFieldObj.name}
                contentAboveInput={
                  <ProductManagementPropertyXSign
                    productManagementPropertyName={
                      availableProductManagementFieldObj.name as newOrExistingProductManagementStatePossiblePropertiesToEdit
                    }
                  />
                }
              />
            ) : (
              <section
                id="product-release-date-management"
                className="w-full flex flex-col gap-4"
                key={availableProductManagementFieldObj.name}
              >
                <ProductManagementPropertyXSign productManagementPropertyName="releaseDate" />
                <DatePickerInputFieldElement
                  inputFieldObjFromProps={availableProductManagementFieldObj}
                  key={availableProductManagementFieldObj.name}
                  latestPossibleDate={createDateNoTakingTimezoneIntoAccount({
                    year: curDate.getFullYear() + 10,
                    month: curDate.getMonth(),
                    day: curDate.getDate(),
                  })}
                />
                {newGameInvalidReleaseDateError && (
                  <Error
                    smallVersion
                    message={newGameInvalidReleaseDateError}
                  />
                )}
              </section>
            )
        )}
        {newOrExistingProductManagementStateStable.priceManagement
          .adminChoseToEdit && (
          <section
            id="product-price-management"
            className="flex flex-col gap-4 justify-center items-center"
          >
            <section
              id="product-price-management-header"
              className="flex gap-4"
            >
              <Header>Price Management</Header>
              <ProductManagementPropertyXSign productManagementPropertyName="priceManagement" />
            </section>
            <InputFieldSingleRow>
              <InputFieldElement
                inputFieldObjFromProps={inputFieldsObjsInUse.price}
                customAlignSelfTailwindClass="self-stretch"
                onChange={productPriceHandleInputChange}
                value={inputPrice}
              />
              <InputFieldElement
                inputFieldObjFromProps={inputFieldsObjsInUse.discount}
                onChange={productDiscountHandleInputChange}
                value={inputDiscount}
              />
            </InputFieldSingleRow>
            <span className="flex justify-center items-center gap-4">
              Final price:{" "}
              {finalPrice === 0 ? (
                <FreeToPlayTag />
              ) : (
                <Header usePaddingBottom={false}>{finalPriceFormatted}</Header>
              )}
            </span>
          </section>
        )}
        {choseToEditArtworks && (
          <ArtworksManagementContextProvider {...artworksManagementState}>
            <ProductManagementPropertyXSign productManagementPropertyName="artworks" />
            <ArtworksManagement />
          </ArtworksManagementContextProvider>
        )}
        <Button
          disabled={
            productManagementQueryRes.isPending ||
            !Object.entries(newOrExistingProductManagementStateStable).some(
              (productManagementStateEntry) =>
                productManagementStateEntry[1].adminChoseToEdit
            )
          }
        >
          {productManagementQueryRes.isPending
            ? editExistingProduct
              ? "Editing..."
              : "Adding..."
            : editExistingProduct
            ? "Edit the selected product"
            : "Add the described product"}
        </Button>
      </FormWithErrorHandling>
    </>
  );
}
