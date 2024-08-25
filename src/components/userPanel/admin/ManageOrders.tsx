import PagesManagerContextProvider from "../../../store/products/PagesManagerContext";
import ManageOrdersFindingOrderContextProvider from "../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
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
          <OrderFindingWrapper />
        </ManageOrdersFindingOrderContextProvider>
      </UserOrdersManagerOrdersDetailsContextProvider>
    </PagesManagerContextProvider>
  );
}
