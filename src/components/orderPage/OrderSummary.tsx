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
import { cartStateArr } from "../../store/cartSlice";
import Error from "../UI/Error";
import LoadingFallback from "../UI/LoadingFallback";
import generateGamesWithQuantityOutOfCartDetailsEntries, {
  IGameWithQuantityBasedOnCartDetailsEntry,
} from "../../helpers/generateGamesWithQuantityOutOfCartDetailsEntries";
import Header from "../UI/headers/Header";
import { NewOrderSummaryContext } from "../../store/orderPage/NewOrderSummaryContext";
import useCompareComplexForUseMemo from "../../hooks/useCompareComplexForUseMemo";
import { useAppSelector } from "../../hooks/reduxStore";
import { OrderSummaryContentContext } from "../../store/orderPage/OrderSummaryContentContext";
import OrderGeneralInformation from "./OrderGeneralInformation";
import { UpdateOrderDetailsContext } from "../../store/userPanel/admin/orders/UpdateOrderDetailsContext";
import OrderFindingSummaryDetailedContactInformation from "../userPanel/admin/orders/OrderFindingSummaryDetailedContactInformation";

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
  cartTotalPrice: number | undefined;
}>({
  gamesWithQuantityStable: undefined,
  cartDetailsError: null,
  cartDetailsIsLoading: false,
  stateCartStable: undefined,
  cartTotalPrice: undefined,
});

export default function OrderSummary({
  handleGoBack,
}: {
  handleGoBack: () => void;
}) {
  const {
    cartDetailsData,
    cartDetailsIsLoading,
    handlePlaceAnOrder,
    btnDisabledDueToOrderQueryState,
    couldNotGetCartDetails,
    orderPlacedSuccessfully,
    placeAnOrderErrorToRender,
    placeAnOrderIsPending,
    placeAnOrderValidationErrors,
    cartDetailsError,
  } = useContext(NewOrderSummaryContext);
  const { serveAsPlacingOrderSummary, gamesWithQuantityOutOfOrderItemsStable } =
    useContext(OrderSummaryContentContext);
  const { selectedOrderFromList } = useContext(UpdateOrderDetailsContext);
  const serveAsUpdateOrderInformationSummary = selectedOrderFromList !== "";
  const stateCartStable = useCompareComplexForUseMemo(
    useAppSelector((state) => state.cartSlice.cart)
  );

  const cartDetailsStable = useMemo(
    () => cartDetailsData?.data?.cart,
    [cartDetailsData]
  );
  const cartTotalPrice = cartDetailsData?.data?.cartTotalPrice;
  const gamesWithQuantityStable = useMemo(
    () =>
      !cartDetailsStable
        ? gamesWithQuantityOutOfOrderItemsStable
          ? gamesWithQuantityOutOfOrderItemsStable
          : undefined
        : generateGamesWithQuantityOutOfCartDetailsEntries(
            cartDetailsStable,
            stateCartStable!
          ),
    [cartDetailsStable, gamesWithQuantityOutOfOrderItemsStable, stateCartStable]
  );

  const placeAnOrderClickCallback = useCallback(
    () =>
      serveAsPlacingOrderSummary && gamesWithQuantityStable
        ? handlePlaceAnOrder(gamesWithQuantityStable)
        : null,
    [gamesWithQuantityStable, handlePlaceAnOrder, serveAsPlacingOrderSummary]
  );
  const placeAnOrderBtnDisabled =
    cartDetailsIsLoading || stateCartStable === undefined;

  let contactInformationToRender = <DetailedContactInformation />;
  if (serveAsUpdateOrderInformationSummary)
    contactInformationToRender = (
      <OrderFindingSummaryDetailedContactInformation />
    );

  return (
    <>
      <OrderPageHeader>Order summary</OrderPageHeader>
      <section className="order-details-entries-wrapper flex flex-col gap-8">
        {contactInformationToRender}
        <OrderSummaryCartInformationContext.Provider
          value={{
            gamesWithQuantityStable,
            cartDetailsError,
            cartDetailsIsLoading,
            stateCartStable,
            cartTotalPrice,
          }}
        >
          <OrderCartInformation />
        </OrderSummaryCartInformationContext.Provider>
        {!serveAsPlacingOrderSummary && <OrderGeneralInformation />}
      </section>
      <section className="flex justify-center items-center px-4 py-8 gap-4">
        <Button
          onClick={handleGoBack}
          disabled={btnDisabledDueToOrderQueryState}
        >
          Go back
        </Button>
        {serveAsPlacingOrderSummary && (
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
        )}
      </section>
      {serveAsPlacingOrderSummary && (
        <section className="order-status-information w-full text-center">
          {placeAnOrderErrorToRender && (
            <Error message={placeAnOrderErrorToRender.message} smallVersion />
          )}
          {placeAnOrderValidationErrors &&
            placeAnOrderValidationErrors.map((placeAnOrderValidationError) => (
              <Error
                message={placeAnOrderValidationError.message}
                smallVersion
              />
            ))}
          {placeAnOrderIsPending && <LoadingFallback />}
          {orderPlacedSuccessfully && (
            <Header>
              Order placed successfully! You will be redirected to your orders
              panel in 5 seconds.
            </Header>
          )}
        </section>
      )}
    </>
  );
}
