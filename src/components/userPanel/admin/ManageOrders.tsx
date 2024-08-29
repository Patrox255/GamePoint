import PagesManagerContextProvider from "../../../store/products/PagesManagerContext";
import ManageOrdersFindingOrderContextProvider from "../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import UpdateOrderDetailsContextProvider from "../../../store/userPanel/admin/orders/UpdateOrderDetailsContext";
import UserOrdersManagerOrdersDetailsContextProvider from "../../../store/userPanel/UserOrdersManagerOrdersDetailsContext";
import OrderFindingWrapper from "./orders/OrderFindingWrapper";

export default function ManageOrders() {
  return (
    <PagesManagerContextProvider>
      <UserOrdersManagerOrdersDetailsContextProvider
        orderDetailsQueryEnabled={false}
        sortCustomizationSearchParamsAndSessionStorageEntryName="sortAdminRetrievedOrdersProperties"
      >
        <ManageOrdersFindingOrderContextProvider>
          <UpdateOrderDetailsContextProvider>
            <OrderFindingWrapper />
          </UpdateOrderDetailsContextProvider>
        </ManageOrdersFindingOrderContextProvider>
      </UserOrdersManagerOrdersDetailsContextProvider>
    </PagesManagerContextProvider>
  );
}
