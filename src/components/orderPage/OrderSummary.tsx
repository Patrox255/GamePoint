import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";

import Button from "../UI/Button";
import DetailedContactInformation from "./DetailedContactInformation";
import OrderPageHeader from "./OrderPageHeader";
import OrderCartInformation from "./OrderCartInformation";
import useRetrieveCartDetails from "../../hooks/useRetrieveCartDetails";
import { cartStateArr } from "../../store/cartSlice";
import { OrderSummaryContentContext } from "../../store/orderPage/OrderSummaryContentContext";
import Error from "../UI/Error";
import LoadingFallback from "../UI/LoadingFallback";
import generateGamesWithQuantityOutOfCartDetailsEntries, {
  IGameWithQuantityBasedOnCartDetailsEntry,
} from "../../helpers/generateGamesWithQuantityOutOfCartDetailsEntries";
import Header from "../UI/headers/Header";

export const OrderSummarySectionWrapper = ({
  children,
  additionalClasses = "",
  identificator,
}: {
  children: ReactNode;
  additionalClasses?: string;
  identificator: string;
}) => (
  <section
    id={identificator}
    className={`text-center bg-darkerBg rounded-xl py-8 flex flex-col gap-4 px-4 ${additionalClasses}`}
  >
    {children}
  </section>
);

export const OrderSummaryCartInformationContext = createContext<{
  gamesWithQuantityStable:
    | IGameWithQuantityBasedOnCartDetailsEntry[]
    | undefined;
  cartDetailsError: Error | null;
  cartDetailsIsLoading: boolean;
  stateCartStable: cartStateArr | undefined;
}>({
  gamesWithQuantityStable: undefined,
  cartDetailsError: null,
  cartDetailsIsLoading: false,
  stateCartStable: undefined,
});

export default function OrderSummary({
  handleGoBack,
}: {
  handleGoBack: () => void;
}) {
  const {
    handlePlaceAnOrder,
    placeAnOrderData,
    placeAnOrderError,
    placeAnOrderIsPending,
    orderPlacedSuccessfully,
  } = useContext(OrderSummaryContentContext);

  const {
    cartDetailsData,
    cartDetailsError,
    cartDetailsIsLoading,
    stateCartStable,
  } = useRetrieveCartDetails(orderPlacedSuccessfully !== true);

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

  const placeAnOrderValidationErrors =
    placeAnOrderError &&
    Array.isArray(placeAnOrderError) &&
    placeAnOrderError.length > 0
      ? placeAnOrderError
      : null;
  const placeAnOrderErrorToRender =
    placeAnOrderError && !Array.isArray(placeAnOrderError)
      ? placeAnOrderError
      : placeAnOrderData?.data && (placeAnOrderData.data as Error).message
      ? (placeAnOrderData?.data as Error)
      : null;

  const placeAnOrderBtnDisabled =
    cartDetailsIsLoading || stateCartStable === undefined;
  const couldNotGetCartDetails =
    (!cartDetailsData || cartDetailsError) && !cartDetailsIsLoading
      ? true
      : false;

  const placeAnOrderClickCallback = useCallback(
    () =>
      gamesWithQuantityStable
        ? handlePlaceAnOrder(gamesWithQuantityStable)
        : null,
    [gamesWithQuantityStable, handlePlaceAnOrder]
  );

  const btnDisabledDueToOrderQueryState =
    orderPlacedSuccessfully || placeAnOrderIsPending;

  return (
    <>
      <OrderPageHeader>Order summary</OrderPageHeader>
      <section className="order-details-entries-wrapper flex flex-col gap-8">
        <DetailedContactInformation />
        <OrderSummaryCartInformationContext.Provider
          value={{
            gamesWithQuantityStable,
            cartDetailsError,
            cartDetailsIsLoading,
            stateCartStable,
          }}
        >
          <OrderCartInformation />
        </OrderSummaryCartInformationContext.Provider>
      </section>
      <section className="flex justify-center items-center px-4 py-8 gap-4">
        <Button
          onClick={handleGoBack}
          disabled={btnDisabledDueToOrderQueryState}
        >
          Go back
        </Button>
        <Button
          disabled={
            placeAnOrderBtnDisabled ||
            couldNotGetCartDetails ||
            btnDisabledDueToOrderQueryState
          }
          onClick={placeAnOrderClickCallback}
        >
          {placeAnOrderBtnDisabled
            ? "Getting order data..."
            : couldNotGetCartDetails
            ? "Failed to retrieve cart data"
            : orderPlacedSuccessfully
            ? "Order has been successfully placed!"
            : placeAnOrderIsPending
            ? "Processing..."
            : "Place the order"}
        </Button>
      </section>
      <section className="order-status-information w-full text-center">
        {placeAnOrderErrorToRender && (
          <Error message={placeAnOrderErrorToRender.message} smallVersion />
        )}
        {placeAnOrderValidationErrors &&
          placeAnOrderValidationErrors.map((placeAnOrderValidationError) => (
            <Error message={placeAnOrderValidationError.message} smallVersion />
          ))}
        {placeAnOrderIsPending && <LoadingFallback />}
        {orderPlacedSuccessfully && (
          <Header>
            Order placed successfully! You will be redirected to your orders
            panel in 5 seconds.
          </Header>
        )}
      </section>
    </>
  );
}
