import { Reducer, useCallback, useMemo, useReducer } from "react";
import { useMutation } from "@tanstack/react-query";

import FormWithErrorHandling, {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
} from "../UI/FormWithErrorHandling";
import { productManagement } from "../../lib/fetch";
import TabsComponent, { ITagsObjDefault } from "../structure/TabsComponent";
import Button from "../UI/Button";

interface INewOrExistingProductManagementStateEntryValue {
  adminChoseToEdit: boolean;
  newValue?: unknown;
}
const newOrExistingProductManagementStatePossiblePropertiesToEditAsInputs = [
  "title",
] as const;
type newOrExistingProductManagementStatePossiblePropertiesToEditAsInputs =
  (typeof newOrExistingProductManagementStatePossiblePropertiesToEditAsInputs)[number];
const newOrExistingProductManagementStatePossiblePropertiesToEdit = [
  ...newOrExistingProductManagementStatePossiblePropertiesToEditAsInputs,
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

export default function NewOrExistingProductManagementForm() {
  const [
    newOrExistingProductManagementState,
    newOrExistingProductManagementDispatch,
  ] = useReducer(
    newOrExistingProductManagementReducer,
    newOrExistingProductManagementInitialState
  );

  const productManagementQueryRes = useMutation<
    FormActionBackendResponse,
    FormActionBackendErrorResponse,
    INewOrExistingProductManagementStateToSend
  >({ mutationFn: productManagement });
  const { mutate: productManagementMutate } = productManagementQueryRes;
  const handleSubmitProductManagement = useCallback(
    (formDataObj: {
      [entryName in newOrExistingProductManagementStatePossiblePropertiesToEditAsInputs]: unknown;
    }) => productManagementMutate(formDataObj),
    [productManagementMutate]
  );
  //   const editExistingProduct = gameStable !== undefined;

  const possibleTabsToChooseFromInOrderToEditIndividualProperties: ITagsObjDefault<newOrExistingProductManagementStatePossiblePropertiesToEdit>[] =
    useMemo(
      () =>
        newOrExistingProductManagementStatePossiblePropertiesToEdit.map(
          (newOrExistingProductManagementStatePossiblePropertyToEdit) => ({
            ComponentToRender: (
              <Button
                onClick={() =>
                  newOrExistingProductManagementDispatch({
                    type: "CHANGE_CHOSE_TO_EDIT",
                    payload:
                      newOrExistingProductManagementStatePossiblePropertyToEdit,
                  })
                }
              >
                Add to editable
              </Button>
            ),
            tagName: newOrExistingProductManagementStatePossiblePropertyToEdit,
            header:
              newOrExistingProductManagementStatePossiblePropertyToEdit.replace(
                newOrExistingProductManagementStatePossiblePropertyToEdit[0],
                newOrExistingProductManagementStatePossiblePropertyToEdit[0].toUpperCase()
              ),
          })
        ) as ITagsObjDefault<newOrExistingProductManagementStatePossiblePropertiesToEdit>[],
      []
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
      <FormWithErrorHandling
        queryRelatedToActionState={productManagementQueryRes}
        onSubmit={handleSubmitProductManagement}
      ></FormWithErrorHandling>
    </>
  );
}
