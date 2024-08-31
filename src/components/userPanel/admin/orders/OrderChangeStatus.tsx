import { useCallback, useContext, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router-dom";

import { OrderSummaryContentContext } from "../../../../store/orderPage/OrderSummaryContentContext";
import {
  IResponseFromFetchFn,
  IUpdateOrderByAdmin,
  queryClient,
  retrievePossibleOrderStatuses,
  updateOrderStatus,
} from "../../../../lib/fetch";
import LoadingFallback from "../../../UI/LoadingFallback";
import Error from "../../../UI/Error";
import FormWithErrorHandling, {
  FormActionBackendErrorResponse,
  FormActionBackendResponse,
  FormInputFields,
} from "../../../UI/FormWithErrorHandling";
import InputFieldElement from "../../../UI/InputFieldElement";
import Button from "../../../UI/Button";
import Header from "../../../UI/headers/Header";
import { IUserPanelLoaderData } from "../../../../pages/UserPanelPage";
import { IRetrieveOrderDataResponse } from "../../orders/OrderSummaryUserPanel";
import { UpdateOrderDetailsContext } from "../../../../store/userPanel/admin/orders/UpdateOrderDetailsContext";
import { ManageOrdersFindingOrderContext } from "../../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import useCreateGamesWithQuantityBasedOnQuantityModificationEntries from "../../../../hooks/adminPanelRelated/useCreateGamesWithQuantityBasedOnQuantityModificationEntries";
import filterOrOnlyIncludeCertainPropertiesFromObj from "../../../../helpers/filterOrOnlyIncludeCertainPropertiesFromObj";

const hasSelectedOrderBeenDeleted = (res: FormActionBackendResponse) =>
  res.data === "Deleted";

export default function OrderChangeStatus() {
  const { orderStatus, gamesWithQuantityOutOfOrderItemsStable } = useContext(
    OrderSummaryContentContext
  );
  const { userId } = useLoaderData() as IUserPanelLoaderData;
  const {
    selectedOrderFromList,
    setSelectedOrderFromList,
    selectedContactInformationEntryIdToChangeTheOrderOneTo,
    orderItemsQuantityModificationEntriesStable,
  } = useContext(UpdateOrderDetailsContext);
  const {
    stateInformation: { selectedUserFromList, setSelectedUserFromList },
  } = useContext(ManageOrdersFindingOrderContext);

  const {
    gamesWithQuantityBasedOnQuantityModificationEntries,
    hasAnyGameEntryBeenModified,
  } = useCreateGamesWithQuantityBasedOnQuantityModificationEntries(
    gamesWithQuantityOutOfOrderItemsStable,
    orderItemsQuantityModificationEntriesStable
  );

  const { data, error, isLoading } = useQuery<IResponseFromFetchFn<string[]>>({
    queryKey: ["order-statuses"],
    queryFn: ({ signal }) => retrievePossibleOrderStatuses(signal),
  });
  const possibleStatuses = useMemo(() => data?.data, [data]);
  const [selectedStatus, setSelectedStatus] = useState(orderStatus!);

  const orderDataQueryKey = useMemo(
    () => ["orderData", userId, selectedOrderFromList],
    [selectedOrderFromList, userId]
  );

  const {
    mutate,
    data: updateOrderData,
    error: updateOrderError,
    isPending: updateOrderIsPending,
  } = useMutation<
    FormActionBackendResponse,
    FormActionBackendErrorResponse,
    IUpdateOrderByAdmin
  >({
    mutationFn: updateOrderStatus,
    onMutate: (mutateData) => {
      const { newStatus, modifiedCartItems } = mutateData;
      if (!modifiedCartItems && !newStatus) return;
      const orderData =
        queryClient.getQueryData<IRetrieveOrderDataResponse>(
          orderDataQueryKey
        )!.data;
      queryClient.setQueryData(orderDataQueryKey, {
        data: {
          ...orderData,
          ...(newStatus && { status: newStatus }),
          ...(modifiedCartItems && {
            items: modifiedCartItems.map((modifiedCartItemsEntry) => ({
              gameId: modifiedCartItemsEntry,
              ...filterOrOnlyIncludeCertainPropertiesFromObj(
                modifiedCartItemsEntry,
                ["quantity", "finalPrice", "price", "discount"],
                true
              ),
            })),
          }),
        },
      });
      return orderData;
    },
    onError: (_, mutateData, orderDataBeforeOptimisticUpdate) => {
      if (mutateData.newStatus || mutateData.modifiedCartItems)
        queryClient.setQueryData(orderDataQueryKey, {
          data: orderDataBeforeOptimisticUpdate,
        });
    },
    onSuccess: (res) => {
      if (!hasSelectedOrderBeenDeleted(res)) return;
      setSelectedOrderFromList("");
      setSelectedUserFromList("");
    },
    onSettled: (res) => {
      if (res && hasSelectedOrderBeenDeleted(res)) return;
      queryClient.invalidateQueries({ queryKey: orderDataQueryKey });
    },
  });
  const successfullyUpdatedOrder =
    updateOrderData?.data && typeof updateOrderData.data === "string";

  const updateOrderStatusInputFields = useMemo<FormInputFields>(
    () => [
      {
        name: "orderStatusChange",
        defaultValue: orderStatus,
        type: "select",
        selectOptions: possibleStatuses,
        renderPlaceholderInTheLabel: true,
        placeholder: "Choose a new status for the order:",
        omitMovingTheInputFieldUponSelecting: true,
      },
    ],
    [orderStatus, possibleStatuses]
  );

  const changedOrderStatus = selectedStatus !== orderStatus;
  const startedChangingOrderContactDetails =
    selectedContactInformationEntryIdToChangeTheOrderOneTo !== undefined;
  const changedOrderContactDetails =
    selectedContactInformationEntryIdToChangeTheOrderOneTo !== "" &&
    startedChangingOrderContactDetails;
  const doneAnyChanges =
    changedOrderStatus ||
    changedOrderContactDetails ||
    hasAnyGameEntryBeenModified;

  const handleFormSubmit = useCallback(
    ({ orderStatusChange }: { orderStatusChange: string }) =>
      mutate({
        ...(changedOrderStatus && { newStatus: orderStatusChange }),
        orderId: selectedOrderFromList,
        ...(changedOrderContactDetails && {
          newUserContactInformationEntryId:
            selectedContactInformationEntryIdToChangeTheOrderOneTo,
        }),
        ...(hasAnyGameEntryBeenModified && {
          modifiedCartItems:
            gamesWithQuantityBasedOnQuantityModificationEntries,
        }),
        ordererLoginToDeterminePossibleContactInformationEntries:
          selectedUserFromList,
      }),
    [
      changedOrderContactDetails,
      changedOrderStatus,
      gamesWithQuantityBasedOnQuantityModificationEntries,
      hasAnyGameEntryBeenModified,
      mutate,
      selectedContactInformationEntryIdToChangeTheOrderOneTo,
      selectedOrderFromList,
      selectedUserFromList,
    ]
  );
  const handleStatusUpdateSuccessAction = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: ["orderData", userId, selectedOrderFromList],
      }),
    [selectedOrderFromList, userId]
  );

  const submitBtnContent = !doneAnyChanges
    ? "Start by specifying changes You would like to make"
    : selectedContactInformationEntryIdToChangeTheOrderOneTo === ""
    ? "Pick a new contact details entry for the order"
    : "Apply changes";

  const updateOrderValidationErrorsBesidesNewStatusRelated =
    updateOrderError &&
    Array.isArray(updateOrderError) &&
    updateOrderError.filter(
      (updateOrderValidationError) =>
        updateOrderValidationError.errInputName !== "orderStatusChange"
    );

  let content;
  if (isLoading)
    content = (
      <LoadingFallback customText="Loading possible order statuses..." />
    );
  if (error) content = <Error message={error.message} smallVersion />;
  if (possibleStatuses)
    content = (
      <FormWithErrorHandling
        onSubmit={handleFormSubmit}
        queryRelatedToActionState={{
          data: updateOrderData,
          error: updateOrderError,
          isPending: updateOrderIsPending,
        }}
        actionIfSuccess={handleStatusUpdateSuccessAction}
      >
        <InputFieldElement
          inputFieldObjFromProps={updateOrderStatusInputFields[0]}
          onChange={(newStatus: string) => setSelectedStatus(newStatus)}
        />
        <Button disabled={!doneAnyChanges}>{submitBtnContent}</Button>
        {successfullyUpdatedOrder && (
          <Header>Successfully applied the requested changes!</Header>
        )}
      </FormWithErrorHandling>
    );

  return (
    <section className="order-status-change w-full flex justify-center items-center flex-col">
      {content}
      {updateOrderValidationErrorsBesidesNewStatusRelated &&
        updateOrderValidationErrorsBesidesNewStatusRelated.map(
          (updateOrderValidationErrorBesidesNewStatusRelated) => (
            <Error
              message={
                updateOrderValidationErrorBesidesNewStatusRelated.message
              }
              smallVersion
            />
          )
        )}
    </section>
  );
}
