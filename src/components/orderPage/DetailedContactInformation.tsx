import { ReactNode, useContext } from "react";

import Header from "../UI/headers/Header";
import { OrderSummaryContentContext } from "../../store/orderPage/OrderSummaryContentContext";
import Error from "../UI/Error";
import FilledContactInformationInputFieldsRepresentation from "./FilledContactInformationInputFieldsRepresentation";
import { OrderSummarySectionWrapper } from "./OrderSummary";
import { UpdateOrderDetailsContext } from "../../store/userPanel/admin/orders/UpdateOrderDetailsContext";

export const DetailedContactInformationDefaultContent = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const { selectedOrderFromList } = useContext(UpdateOrderDetailsContext);
  const serveAsUpdateOrderInformationComponent = selectedOrderFromList !== "";

  return (
    <OrderSummarySectionWrapper identificator="order-contact-information-details">
      <Header>{`${
        !serveAsUpdateOrderInformationComponent ? "Your" : "Orderer's"
      } detailed order contact information`}</Header>
      <FilledContactInformationInputFieldsRepresentation />
      {children}
    </OrderSummarySectionWrapper>
  );
};

export default function DetailedContactInformation() {
  const { contactInformationToRender } = useContext(OrderSummaryContentContext);

  if (!contactInformationToRender)
    return (
      <Error
        message="Failed to retrieve your selected contact details entry data! Please try again later."
        smallVersion
      />
    );

  return <DetailedContactInformationDefaultContent />;
}
