import { createContext, ReactNode } from "react";

import { IOrder } from "../../../../models/order.model";

type orderItemOnClickFn = (order: IOrder) => void;

export const OrdersListContext = createContext<{
  orderItemOnClick?: orderItemOnClickFn;
  orderDetails?: IOrder[];
}>({});

export default function OrdersListContextProvider({
  orderItemOnClickStable,
  orderDetailsStable,
  children,
}: {
  orderItemOnClickStable?: orderItemOnClickFn;
  orderDetailsStable?: IOrder[];
  children: ReactNode;
}) {
  return (
    <OrdersListContext.Provider
      value={{
        orderItemOnClick: orderItemOnClickStable,
        orderDetails: orderDetailsStable,
      }}
    >
      {children}
    </OrdersListContext.Provider>
  );
}
