import { useContext } from "react";
// import { ManageOrdersFindingOrderContext } from "../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import { OrderSummarySectionWrapper } from "./OrderSummary";
import { OrderSummaryContentContext } from "../../store/orderPage/OrderSummaryContentContext";
import { HighlightedOrderDetailsEntry } from "../userPanel/orders/OrdersList";

export default function OrderGeneralInformation() {
  //   const {
  //     stateInformation: { selectedOrderFromList },
  //   } = useContext(ManageOrdersFindingOrderContext);
  //   const serveAsAdminOrderSummary = selectedOrderFromList !== "";

  const { orderStatus } = useContext(OrderSummaryContentContext);

  return (
    <OrderSummarySectionWrapper identificator="order-general-information-and-possible-controls">
      <section className="order-status flex w-full justify-center items-center">
        Order status:&nbsp;
        <HighlightedOrderDetailsEntry>
          {orderStatus}
        </HighlightedOrderDetailsEntry>
      </section>
    </OrderSummarySectionWrapper>
  );
}
