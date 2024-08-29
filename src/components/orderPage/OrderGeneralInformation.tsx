import { useContext } from "react";

import { OrderSummarySectionWrapper } from "./OrderSummary";
import { OrderSummaryContentContext } from "../../store/orderPage/OrderSummaryContentContext";
import { HighlightedOrderDetailsEntry } from "../userPanel/orders/OrdersList";
import OrderChangeStatus from "../userPanel/admin/orders/OrderChangeStatus";
import { UpdateOrderDetailsContext } from "../../store/userPanel/admin/orders/UpdateOrderDetailsContext";

export default function OrderGeneralInformation() {
  const { selectedOrderFromList } = useContext(UpdateOrderDetailsContext);
  const serveAsAdminOrderSummary = selectedOrderFromList !== "";

  const { orderStatus } = useContext(OrderSummaryContentContext);

  return (
    <OrderSummarySectionWrapper identificator="order-general-information-and-possible-controls">
      <section className="order-status flex w-full justify-center items-center">
        Order status:&nbsp;
        <HighlightedOrderDetailsEntry>
          {orderStatus}
        </HighlightedOrderDetailsEntry>
      </section>
      {serveAsAdminOrderSummary && <OrderChangeStatus />}
    </OrderSummarySectionWrapper>
  );
}
