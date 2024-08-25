import { useContext } from "react";

import { ManageOrdersFindingOrderContext } from "../../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import OrderFindingSummary from "./OrderFindingSummary";
import OrderFindingMainTab from "./OrderFindingMainTab";

export default function OrderFindingWrapper() {
  const {
    stateInformation: { selectedOrderFromList },
  } = useContext(ManageOrdersFindingOrderContext);

  return selectedOrderFromList ? (
    <OrderFindingSummary />
  ) : (
    <OrderFindingMainTab />
  );
}
