import { useMemo } from "react";
import useRetrieveCartDetails from "../../hooks/useRetrieveCartDetails";
import GamesResults from "../main/nav/GamesResults";
import Error from "../UI/Error";
import LoadingFallback from "../UI/LoadingFallback";
import { OrderSummarySectionWrapper } from "./OrderSummary";
import generateGamesWithQuantityOutOfCartDetailsEntries from "../../helpers/generateGamesWithQuantityOutOfCartDetailsEntries";

export default function OrderCartInformation() {
  const {
    cartDetailsData,
    cartDetailsError,
    cartDetailsIsLoading,
    stateCartStable,
  } = useRetrieveCartDetails();
  const cartDetailsStable = useMemo(
    () => cartDetailsData?.data,
    [cartDetailsData]
  );
  const gamesWithQuantityStable = useMemo(
    () =>
      !cartDetailsStable
        ? undefined
        : generateGamesWithQuantityOutOfCartDetailsEntries(
            cartDetailsStable,
            stateCartStable!
          ),
    [cartDetailsStable, stateCartStable]
  );

  let content;
  if (!stateCartStable || cartDetailsIsLoading)
    content = (
      <LoadingFallback customText="Loading your order products details..." />
    );
  if (cartDetailsError) content = <Error message={cartDetailsError.message} />;
  if (cartDetailsStable)
    content = (
      <GamesResults
        games={gamesWithQuantityStable!}
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
