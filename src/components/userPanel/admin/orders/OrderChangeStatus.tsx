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

export default function OrderChangeStatus() {
  const { orderStatus } = useContext(OrderSummaryContentContext);
  const { userId } = useLoaderData() as IUserPanelLoaderData;
  const {
    selectedOrderFromList,
    selectedContactInformationEntryIdToChangeTheOrderOneTo,
  } = useContext(UpdateOrderDetailsContext);
  const {
    stateInformation: { selectedUserFromList },
  } = useContext(ManageOrdersFindingOrderContext);

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
      const orderData =
        queryClient.getQueryData<IRetrieveOrderDataResponse>(
          orderDataQueryKey
        )!.data;
      queryClient.setQueryData(orderDataQueryKey, {
        data: { ...orderData, status: mutateData.newStatus },
      });
      return orderData;
    },
    onError: (_, __, orderDataBeforeOptimisticUpdate) =>
      queryClient.setQueryData(orderDataQueryKey, {
        data: orderDataBeforeOptimisticUpdate,
      }),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: orderDataQueryKey }),
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

  const handleFormSubmit = useCallback(
    ({ orderStatusChange }: { orderStatusChange: string }) =>
      mutate({
        ...(changedOrderStatus && { newStatus: orderStatusChange }),
        orderId: selectedOrderFromList,
        ...(changedOrderContactDetails && {
          newUserContactInformationEntryId:
            selectedContactInformationEntryIdToChangeTheOrderOneTo,
        }),
        ordererLoginToDeterminePossibleContactInformationEntries:
          selectedUserFromList,
      }),
    [
      changedOrderContactDetails,
      changedOrderStatus,
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

  const submitBtnContent =
    !changedOrderStatus && !changedOrderContactDetails
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
        <Button disabled={!changedOrderStatus && !changedOrderContactDetails}>
          {submitBtnContent}
        </Button>
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
