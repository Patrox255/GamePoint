import { useContext } from "react";

import OrderFindingSummary from "./OrderFindingSummary";
import OrderFindingMainTab from "./OrderFindingMainTab";
import { UpdateOrderDetailsContext } from "../../../../store/userPanel/admin/orders/UpdateOrderDetailsContext";

export default function OrderFindingWrapper() {
  const { selectedOrderFromList } = useContext(UpdateOrderDetailsContext);

  return selectedOrderFromList ? (
    <OrderFindingSummary />
  ) : (
    <OrderFindingMainTab />
  );
}
