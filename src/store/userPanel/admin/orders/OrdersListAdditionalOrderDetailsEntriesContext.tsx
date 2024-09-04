import { createContext, ReactNode } from "react";
import {
  IOrderDetailsEntriesWithAccessToOrderEntry,
  IOrderDetailsNormalEntries,
} from "../../../../components/userPanel/orders/OrdersList";

type orderWithAccessToOrderEntryKeysFromCtx = "loginAndEmail";

type IOrdersListAdditionalOrderDetailsEntriesContextBody = {
  entriesBasedOnOrderDocumentKeysStable?: IOrderDetailsNormalEntries;
  entriesWithAccessToOrderEntryStable?: IOrderDetailsEntriesWithAccessToOrderEntry<orderWithAccessToOrderEntryKeysFromCtx>;
};

export const OrdersListAdditionalOrderDetailsEntriesContext =
  createContext<IOrdersListAdditionalOrderDetailsEntriesContextBody>({});

export default function OrdersListAdditionalOrderDetailsEntriesContextProvider(
  props: {
    children: ReactNode;
  } & IOrdersListAdditionalOrderDetailsEntriesContextBody
) {
  const { children, ...ctxBody } = props;
  return (
    <OrdersListAdditionalOrderDetailsEntriesContext.Provider value={ctxBody}>
      {children}
    </OrdersListAdditionalOrderDetailsEntriesContext.Provider>
  );
}
