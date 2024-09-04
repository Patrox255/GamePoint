import { useContext, useMemo } from "react";

import {
  manageOrdersFindingInputsPlaceholdersFromEntriesNames,
  ManageOrdersFindingOrderContext,
} from "../../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import { ValidationErrorsArr } from "../../../UI/FormWithErrorHandling";
import LoadingFallback from "../../../UI/LoadingFallback";
import Error from "../../../UI/Error";
import OrdersList, {
  GroupedOrderDetailsEntry,
  HighlightedOrderDetailsEntry,
  IOrderDetailsEntriesWithAccessToOrderEntry,
} from "../../orders/OrdersList";
import Header from "../../../UI/headers/Header";
import OrdersListAdditionalOrderDetailsEntriesContextProvider from "../../../../store/userPanel/admin/orders/OrdersListAdditionalOrderDetailsEntriesContext";
import { IUser } from "../../../../models/user.model";
import OrdersFindingCredentialsAndUsersFindingInputFieldElement from "../OrdersFindingCredentialsAndUsersFindingInputFieldElement";

export const ListItemLoginAndEmailEntriesContentFnResultComponent = ({
  login,
  email,
}: {
  login: string;
  email: string;
}) => (
  <GroupedOrderDetailsEntry>
    <GroupedOrderDetailsEntry.GroupElement>
      Login:&nbsp;
      <HighlightedOrderDetailsEntry>{login}</HighlightedOrderDetailsEntry>
    </GroupedOrderDetailsEntry.GroupElement>
    <GroupedOrderDetailsEntry.GroupElement>
      E-mail:&nbsp;
      <HighlightedOrderDetailsEntry>{email}</HighlightedOrderDetailsEntry>
    </GroupedOrderDetailsEntry.GroupElement>
  </GroupedOrderDetailsEntry>
);

const entriesWithAccessToOrderEntry: IOrderDetailsEntriesWithAccessToOrderEntry<"loginAndEmail"> =
  {
    loginAndEmail: {
      contentClassName: "orderer-information",
      contentFn: (orderWithUserInfo) => {
        const userOrderInformation = orderWithUserInfo.userId as
          | IUser
          | undefined;
        return userOrderInformation ? (
          <ListItemLoginAndEmailEntriesContentFnResultComponent
            login={userOrderInformation.login}
            email={userOrderInformation.email}
          />
        ) : (
          "Placed without an account"
        );
      },
    },
  };

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

  const {
    data: retrieveOrdersArr,
    differentError: retrieveOrdersError,
    validationErrors: retrieveOrdersValidationErrors,
    isLoading: retrieveOrdersIsLoading,
  } = retrieveOrdersQueryData;

  let availableOrdersContent;

  if (retrieveOrdersIsLoading)
    availableOrdersContent = (
      <LoadingFallback customText="Loading orders to choose from..." />
    );
  if (retrieveOrdersArr && retrieveOrdersArr.length > 0)
    availableOrdersContent = (
      <OrdersListAdditionalOrderDetailsEntriesContextProvider
        entriesWithAccessToOrderEntryStable={entriesWithAccessToOrderEntry}
      >
        <OrdersList />
      </OrdersListAdditionalOrderDetailsEntriesContextProvider>
    );
  if (retrieveOrdersArr && retrieveOrdersArr.length === 0)
    availableOrdersContent = (
      <Header>
        Failed to find any order which suites provided properties!
      </Header>
    );
  if (retrieveOrdersError)
    availableOrdersContent = (
      <Error smallVersion message={retrieveOrdersError.message} />
    );

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
        {availableOrdersContent}
      </section>
    </>
  );
}
