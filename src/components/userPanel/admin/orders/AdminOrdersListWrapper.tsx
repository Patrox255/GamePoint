import { useContext } from "react";

import OrdersListAdditionalOrderDetailsEntriesContextProvider from "../../../../store/userPanel/admin/orders/OrdersListAdditionalOrderDetailsEntriesContext";
import Error from "../../../UI/Error";
import Header from "../../../UI/headers/Header";
import LoadingFallback from "../../../UI/LoadingFallback";
import OrdersList, {
  GroupedOrderDetailsEntry,
  HighlightedOrderDetailsEntry,
  IOrderDetailsEntriesWithAccessToOrderEntry,
} from "../../orders/OrdersList";
import { ManageOrdersFindingOrderContext } from "../../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import { IUser } from "../../../../models/user.model";

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

export default function AdminOrdersListWrapper({
  showAdditionalLoginAndEmailOrderEntries = false,
  showRetrieveOrdersValidationErrors = true,
}: {
  showAdditionalLoginAndEmailOrderEntries?: boolean;
  showRetrieveOrdersValidationErrors?: boolean;
}) {
  const {
    retrieveOrdersQueryData: {
      data: retrieveOrdersArr,
      differentError: retrieveOrdersError,
      validationErrors: retrieveOrdersValidationErrors,
      isLoading: retrieveOrdersIsLoading,
    },
  } = useContext(ManageOrdersFindingOrderContext);

  let content;
  if (retrieveOrdersIsLoading)
    content = <LoadingFallback customText="Loading orders to choose from..." />;
  if (retrieveOrdersArr && retrieveOrdersArr.length > 0)
    content = (
      <OrdersListAdditionalOrderDetailsEntriesContextProvider
        entriesWithAccessToOrderEntryStable={
          showAdditionalLoginAndEmailOrderEntries
            ? entriesWithAccessToOrderEntry
            : undefined
        }
      >
        <OrdersList />
      </OrdersListAdditionalOrderDetailsEntriesContextProvider>
    );
  if (retrieveOrdersArr && retrieveOrdersArr.length === 0)
    content = (
      <Header>
        Failed to find any order which suites provided properties!
      </Header>
    );
  if (retrieveOrdersError)
    content = <Error smallVersion message={retrieveOrdersError.message} />;
  if (retrieveOrdersValidationErrors && showRetrieveOrdersValidationErrors)
    content = retrieveOrdersValidationErrors.map(
      (retrieveOrdersValidationError) => (
        <Error smallVersion message={retrieveOrdersValidationError.message} />
      )
    );
  return content;
}
