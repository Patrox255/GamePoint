import { useContext } from "react";

import GamesResults from "../main/nav/GamesResults";
import Error from "../UI/Error";
import LoadingFallback from "../UI/LoadingFallback";
import {
  OrderSummaryCartInformationContext,
  OrderSummarySectionWrapper,
} from "./OrderSummary";
import { OrderSummaryContentContext } from "../../store/orderPage/OrderSummaryContentContext";
import Header from "../UI/headers/Header";
import { priceFormat } from "../game/PriceTag";
import properties from "../../styles/properties";

export default function OrderCartInformation() {
  const {
    gamesWithQuantityStable,
    cartDetailsError,
    cartDetailsIsLoading,
    stateCartStable,
    cartTotalPrice: cartTotalPriceFromCartInformationCtx,
  } = useContext(OrderSummaryCartInformationContext);
  const { serveAsPlacingOrderSummary, cartTotalPriceNotFromCartDetails } =
    useContext(OrderSummaryContentContext);
  const cartTotalPrice =
    cartTotalPriceFromCartInformationCtx ?? cartTotalPriceNotFromCartDetails;

  let content;
  if ((!stateCartStable || cartDetailsIsLoading) && !serveAsPlacingOrderSummary)
    content = (
      <LoadingFallback customText="Loading your order products details..." />
    );
  if (cartDetailsError) content = <Error message={cartDetailsError.message} />;
  if (gamesWithQuantityStable)
    content = (
      <>
        <GamesResults
          games={gamesWithQuantityStable}
          headerLinkInsteadOfWholeGameContainer
          moveHighlight={false}
          showQuantityAndFinalPrice
        />
        <Header
          usePaddingBottom={false}
          additionalTailwindClasses="pt-8"
          colorTailwindClass={properties.defaultFont}
        >
          Total price:{" "}
          <span className="text-highlightRed">
            {priceFormat.format(cartTotalPrice!)}
          </span>
        </Header>
      </>
    );
  return (
    <OrderSummarySectionWrapper identificator="order-products-details">
      {content}
    </OrderSummarySectionWrapper>
  );
}
