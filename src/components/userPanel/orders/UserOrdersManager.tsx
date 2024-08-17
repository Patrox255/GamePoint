import { useParams } from "react-router-dom";

import OrdersList from "./OrdersList";
import OrderSummaryUserPanel from "./OrderSummaryUserPanel";
import UserOrdersManagerOrdersDetailsContextProvider from "../../../store/userPanel/UserOrdersManagerOrdersDetailsContext";

export interface IUserOrdersManagerParams {
  orderId?: string;
}

export default function UserOrdersManager() {
  const { orderId } = useParams() as IUserOrdersManagerParams;

  let content = <OrdersList />;
  if (orderId)
    content = (
      <OrderSummaryUserPanel
        key={`user-panel-order-summary${orderId ? "-" + orderId : ""}`}
      />
    );

  return (
    <UserOrdersManagerOrdersDetailsContextProvider>
      {content}
    </UserOrdersManagerOrdersDetailsContextProvider>
  );
}
