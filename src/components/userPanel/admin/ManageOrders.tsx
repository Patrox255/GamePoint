import ManageOrdersFindingOrderContextProvider from "../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import OrderFinding from "./orders/OrderFinding";

export default function ManageOrders() {
  return (
    <ManageOrdersFindingOrderContextProvider>
      <OrderFinding />
    </ManageOrdersFindingOrderContextProvider>
  );
}
