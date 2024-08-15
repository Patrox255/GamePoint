import { useContext } from "react";

import Header from "../UI/headers/Header";
import { OrderSummaryContentContext } from "../../store/orderPage/OrderSummaryContentContext";
import Error from "../UI/Error";
import FilledContactInformationInputFieldsRepresentation from "./FilledContactInformationInputFieldsRepresentation";
import { OrderSummarySectionWrapper } from "./OrderSummary";

export default function DetailedContactInformation() {
  const { contactInformationToRender } = useContext(OrderSummaryContentContext);

  if (!contactInformationToRender)
    return (
      <Error
        message="Failed to retrieve your selected contact details entry data! Please try again later."
        smallVersion
      />
    );

  return (
    <OrderSummarySectionWrapper identificator="order-contact-information-details">
      <Header>Your detailed order contact information</Header>
      <FilledContactInformationInputFieldsRepresentation />
    </OrderSummarySectionWrapper>
  );
}
