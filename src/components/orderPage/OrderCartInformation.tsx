import { useContext } from "react";

import GamesResults from "../main/nav/GamesResults";
import Error from "../UI/Error";
import LoadingFallback from "../UI/LoadingFallback";
import {
  OrderSummaryCartInformationContext,
  OrderSummarySectionWrapper,
} from "./OrderSummary";
import { OrderSummaryContentContext } from "../../store/orderPage/OrderSummaryContentContext";

export default function OrderCartInformation() {
  const {
    gamesWithQuantityStable,
    cartDetailsError,
    cartDetailsIsLoading,
    stateCartStable,
  } = useContext(OrderSummaryCartInformationContext);
  const { serveAsPlacingOrderSummary } = useContext(OrderSummaryContentContext);

  let content;
  if ((!stateCartStable || cartDetailsIsLoading) && !serveAsPlacingOrderSummary)
    content = (
      <LoadingFallback customText="Loading your order products details..." />
    );
  if (cartDetailsError) content = <Error message={cartDetailsError.message} />;
  if (gamesWithQuantityStable)
    content = (
      <GamesResults
        games={gamesWithQuantityStable}
        headerLinkInsteadOfWholeGameContainer
        moveHighlight={false}
        showQuantityAndFinalPrice
      />
    );
  return (
    <OrderSummarySectionWrapper identificator="order-products-details">
      {content}
    </OrderSummarySectionWrapper>
  );
}
