import { createContext, ReactNode } from "react";
import {
  IOrderDetailsCustomEntries,
  IOrderDetailsEntriesWithAccessToOrderEntry,
  IOrderDetailsNormalEntries,
} from "../../../../components/userPanel/orders/OrdersList";

type orderCustomEntriesKeysFromCtx = "";
type orderWithAccessToOrderEntryKeysFromCtx = "loginAndEmail";

type IOrdersListAdditionalOrderDetailsEntriesContextBody = {
  entriesBasedOnOrderDocumentKeys?: IOrderDetailsNormalEntries;
  customEntries?: IOrderDetailsCustomEntries<orderCustomEntriesKeysFromCtx>;
  entriesWithAccessToOrderEntry?: IOrderDetailsEntriesWithAccessToOrderEntry<orderWithAccessToOrderEntryKeysFromCtx>;
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
