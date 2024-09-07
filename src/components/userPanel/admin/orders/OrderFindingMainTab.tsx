import { useContext, useMemo } from "react";

import {
  manageOrdersFindingInputsPlaceholdersFromEntriesNames,
  ManageOrdersFindingOrderContext,
} from "../../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import { ValidationErrorsArr } from "../../../UI/FormWithErrorHandling";
import Error from "../../../UI/Error";
import OrdersFindingCredentialsAndUsersFindingInputFieldElement from "../OrdersFindingCredentialsAndUsersFindingInputFieldElement";
import AdminOrdersListWrapper from "./AdminOrdersListWrapper";

export default function OrderFindingMainTab() {
  const {
    ordersFindingCredentials,
    retrieveUsersQueryData,
    stateInformation: { selectedUserFromList, setSelectedUserFromList },
    retrieveOrdersQueryData,
  } = useContext(ManageOrdersFindingOrderContext);
  const {
    data: retrieveUsersArr,
    isLoading: retrieveUsersIsLoading,
    differentError: retrieveUsersDifferentError,
    validationErrors: retrieveUsersValidationErrors,
  } = retrieveUsersQueryData;

  const { validationErrors: retrieveOrdersValidationErrors } =
    retrieveOrdersQueryData;

  const inputsValidationErrors = useMemo(() => {
    const arr: ValidationErrorsArr = [];
    if (retrieveUsersValidationErrors)
      arr.push(...retrieveUsersValidationErrors);
    if (retrieveOrdersValidationErrors)
      retrieveOrdersValidationErrors.forEach(
        (retrieveOrdersValidationError) =>
          !arr.some(
            (validationError) =>
              validationError.errInputName ===
              retrieveOrdersValidationError.errInputName
          ) && arr.push(retrieveOrdersValidationError)
      );
    return arr;
  }, [retrieveOrdersValidationErrors, retrieveUsersValidationErrors]);

  return (
    <>
      <section className="order-finding-control-section-wrapper flex flex-col gap-4">
        <section className="order-finding-control-section flex gap-4">
          {ordersFindingCredentials.map((ordersFindingCredentialsEntry) => {
            const { name } = ordersFindingCredentialsEntry;
            const placeholder =
              manageOrdersFindingInputsPlaceholdersFromEntriesNames[name];
            return (
              <OrdersFindingCredentialsAndUsersFindingInputFieldElement
                {...{
                  ...ordersFindingCredentialsEntry,
                  placeholder,
                  retrieveUsersArr,
                  retrieveUsersIsLoading,
                  selectedUserFromList,
                  setSelectedUserFromList,
                  inputsValidationErrors,
                }}
                key={name}
              />
            );
          })}
        </section>
        <section className="order-finding-control-section-errors">
          {retrieveUsersDifferentError && (
            <Error message={retrieveUsersDifferentError.message} smallVersion />
          )}
        </section>
      </section>
      <section className="order-finding-available-orders-wrapper">
        <AdminOrdersListWrapper
          showRetrieveOrdersValidationErrors={false}
          showAdditionalLoginAndEmailOrderEntries={true}
        />
      </section>
    </>
  );
}
