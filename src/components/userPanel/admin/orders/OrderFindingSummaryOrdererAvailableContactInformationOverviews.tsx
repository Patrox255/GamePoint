import { useContext } from "react";

import { UpdateOrderDetailsContext } from "../../../../store/userPanel/admin/orders/UpdateOrderDetailsContext";
import { ManageOrdersFindingOrderContext } from "../../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import useRetrieveContactInformation from "../../../../hooks/accountRelated/useRetrieveContactInformation";
import LoadingFallback from "../../../UI/LoadingFallback";
import Error from "../../../UI/Error";
import UserContactInformationOverviews from "../../UserContactInformationOverviews";
import Button from "../../../UI/Button";
import Header from "../../../UI/headers/Header";
import { OrderSummarySectionWrapper } from "../../../orderPage/OrderSummary";

export default function OrderFindingSummaryOrdererAvailableContactInformationOverviews() {
  const {
    selectedContactInformationEntryIdToChangeTheOrderOneTo,
    setSelectedContactInformationEntryIdToChangeTheOrderOneTo,
  } = useContext(UpdateOrderDetailsContext);

  const {
    stateInformation: { selectedUserFromList },
  } = useContext(ManageOrdersFindingOrderContext);
  const { contactInformationArr, error, isLoading } =
    useRetrieveContactInformation(selectedUserFromList);

  let content;
  if (isLoading)
    content = (
      <LoadingFallback customText="Loading orderer's available contact details entries..." />
    );
  if (error) content = <Error message={error.message} />;
  if (contactInformationArr)
    content = (
      <OrderSummarySectionWrapper identificator="order-contact-information-admin-modification-wrapper">
        <UserContactInformationOverviews
          contactInformationArrFromProps={contactInformationArr}
          externalContactInformationIdState={
            selectedContactInformationEntryIdToChangeTheOrderOneTo!
          }
          externalContactInformationIdSet={
            setSelectedContactInformationEntryIdToChangeTheOrderOneTo as React.Dispatch<
              React.SetStateAction<string>
            >
          }
          omitShowingControlButtons
        />
        <Header>
          For adding a new order details entry to set please visit the Manage
          users section!
        </Header>
        <Button
          onClick={() =>
            setSelectedContactInformationEntryIdToChangeTheOrderOneTo(undefined)
          }
        >
          Revert changing order details
        </Button>
      </OrderSummarySectionWrapper>
    );

  return content;
}
