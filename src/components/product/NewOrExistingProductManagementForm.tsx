import { Reducer, useCallback, useMemo, useReducer } from "react";
import { useMutation } from "@tanstack/react-query";

import { IExtendedGamePreviewGameArg } from "../products/ExtendedGamePreview";
import FormWithErrorHandling, {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
  IFormInputField,
} from "../UI/FormWithErrorHandling";
import { productManagement } from "../../lib/fetch";
import TabsComponent, { ITagsObjDefault } from "../structure/TabsComponent";
import Button from "../UI/Button";
import InputFieldElement from "../UI/InputFieldElement";
import { changeObjectKeysPrefix } from "../../helpers/changeStrPrefix";
import {
  existingProductManagementInputFieldsObjs,
  IInputFieldsObjsGenerator,
  newProductManagementInputFieldsObjs,
} from "../../lib/inputFieldsObjs";
import useCompareComplexForUseMemo from "../../hooks/useCompareComplexForUseMemo";
import filterOrOnlyIncludeCertainPropertiesFromObj from "../../helpers/filterOrOnlyIncludeCertainPropertiesFromObj";
import XSign from "../UI/XSign";

interface INewOrExistingProductManagementStateEntryValue {
  adminChoseToEdit: boolean;
  newValue?: unknown;
}
const newOrExistingProductManagementStatePossiblePropertiesToEditAsInputFields =
  ["title", "storyLine", "summary"] as const;
type newOrExistingProductManagementStatePossiblePropertiesToEditAsInputFields =
  (typeof newOrExistingProductManagementStatePossiblePropertiesToEditAsInputFields)[number];
const newOrExistingProductManagementStatePossiblePropertiesToEdit = [
  ...newOrExistingProductManagementStatePossiblePropertiesToEditAsInputFields,
] as const;
type newOrExistingProductManagementStatePossiblePropertiesToEdit =
  (typeof newOrExistingProductManagementStatePossiblePropertiesToEdit)[number];
type INewOrExistingProductManagementState = {
  [entryName in newOrExistingProductManagementStatePossiblePropertiesToEdit]: INewOrExistingProductManagementStateEntryValue;
};
export type INewOrExistingProductManagementStateToSend = {
  [entryName in newOrExistingProductManagementStatePossiblePropertiesToEdit]?: unknown;
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
const newOrExistingProductManagementInitialState =
  newOrExistingProductManagementStatePossiblePropertiesToEdit.reduce(
    (acc, newOrExistingProductManagementStatePossiblePropertyToEdit) => ({
      ...acc,
      [newOrExistingProductManagementStatePossiblePropertyToEdit]: {
        adminChoseToEdit: false,
        newValue: undefined,
      },
    }),
    {}
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
  ) as Record<
    newOrExistingProductManagementStatePossiblePropertiesToEditAsInputFields,
    Y
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

const customPossibleProductManagementTabsToChooseFromHeadersMap: {
  [key in newOrExistingProductManagementStatePossiblePropertiesToEdit]?: string;
} = { storyLine: "Story line" };

export default function NewOrExistingProductManagementForm({
  gameStable,
}: {
  gameStable?: IExtendedGamePreviewGameArg;
}) {
  const [
    newOrExistingProductManagementState,
    newOrExistingProductManagementDispatch,
  ] = useReducer(
    newOrExistingProductManagementReducer,
    newOrExistingProductManagementInitialState
  );
  const newOrExistingProductManagementStateStable = useCompareComplexForUseMemo(
    newOrExistingProductManagementState
  );

  const productManagementQueryRes = useMutation<
    FormActionBackendResponse,
    FormActionBackendErrorResponse,
    INewOrExistingProductManagementStateToSend
  >({ mutationFn: productManagement });
  const { mutate: productManagementMutate } = productManagementQueryRes;
  const handleSubmitProductManagement = useCallback(
    (formDataObj: {
      [entryName in newOrExistingProductManagementStatePossiblePropertiesToEditAsInputFields]: unknown;
    }) => productManagementMutate(formDataObj),
    [productManagementMutate]
  );
  //   const editExistingProduct = gameStable !== undefined;

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

  const availableProductManagementFields = useMemo(() => {
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
    console.log(curActivatedProductManagementProperties);
    return filterOrOnlyIncludeCertainPropertiesFromObj(
      gameStable
        ? existingProductManagementInputFieldsObjsTransformed
        : newProductManagementInputFieldsObjsTransformed,
      curActivatedProductManagementProperties,
      true
    ) as
      | typeof existingProductManagementInputFieldsObjsTransformed
      | typeof newProductManagementInputFieldsObjsTransformed;
  }, [gameStable, newOrExistingProductManagementStateStable]);
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
      <FormWithErrorHandling
        queryRelatedToActionState={productManagementQueryRes}
        onSubmit={handleSubmitProductManagement}
      >
        {Object.values(availableProductManagementFields).map(
          (availableProductManagementFieldObj: IFormInputField) => (
            <InputFieldElement
              inputFieldObjFromProps={availableProductManagementFieldObj}
              key={availableProductManagementFieldObj.name}
            >
              <XSign
                disabled={productManagementQueryRes.isPending}
                onClick={handleChangeProductManagementStatePropertyActiveStatus.bind(
                  null,
                  availableProductManagementFieldObj.name as newOrExistingProductManagementStatePossiblePropertiesToEdit
                )}
              />
            </InputFieldElement>
          )
        )}
        {/* <InputFieldSingleRow /> */}
      </FormWithErrorHandling>
    </>
  );
}
