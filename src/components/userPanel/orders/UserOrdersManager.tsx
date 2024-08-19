import { useParams } from "react-router-dom";

import OrdersList from "./OrdersList";
import OrderSummaryUserPanel from "./OrderSummaryUserPanel";
import UserOrdersManagerOrdersDetailsContextProvider from "../../../store/userPanel/UserOrdersManagerOrdersDetailsContext";
import { AnimatePresence } from "framer-motion";
import PagesManagerContextProvider from "../../../store/products/PagesManagerContext";

export interface IUserOrdersManagerParams {
  orderId?: string;
}

export default function UserOrdersManager() {
  const { orderId } = useParams() as IUserOrdersManagerParams;

  let content = (
    <PagesManagerContextProvider>
      <UserOrdersManagerOrdersDetailsContextProvider>
        <OrdersList />
      </UserOrdersManagerOrdersDetailsContextProvider>
    </PagesManagerContextProvider>
  );
  if (orderId)
    content = (
      <OrderSummaryUserPanel
        key={`user-panel-order-summary${orderId ? "-" + orderId : ""}`}
      />
    );

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}
