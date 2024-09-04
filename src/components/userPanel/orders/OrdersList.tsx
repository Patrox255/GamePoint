/* eslint-disable react-refresh/only-export-components */
import { ReactNode, useContext, useMemo } from "react";

import { dateTimeFormat } from "../../../helpers/dateTimeFormat";
import {
  IOrder,
  orderUserFriendlyStatusesMap,
} from "../../../models/order.model";
import { priceFormat } from "../../game/PriceTag";
import { useAppSelector } from "../../../hooks/reduxStore";
import Error from "../../UI/Error";
import LoadingFallback from "../../UI/LoadingFallback";
import Header from "../../UI/headers/Header";
import { UserOrdersManagerOrdersDetailsContext } from "../../../store/userPanel/UserOrdersManagerOrdersDetailsContext";
import PagesElement from "../../UI/PagesElement";
import { MAX_ORDERS_PER_PAGE } from "../../../lib/config";
import OrderCustomization from "../../UI/OrderCustomization";
import {
  IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin,
  ManageOrdersFindingOrderContext,
} from "../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import { IUser } from "../../../models/user.model";
import { OrdersListAdditionalOrderDetailsEntriesContext } from "../../../store/userPanel/admin/orders/OrdersListAdditionalOrderDetailsEntriesContext";
import { UpdateOrderDetailsContext } from "../../../store/userPanel/admin/orders/UpdateOrderDetailsContext";
import ListItems from "../../structure/ListItems";
import useCreateAppropriateListItemEntriesConditionally from "../../../hooks/useCreateAppropriateListItemEntriesConditionally";

export const listItemMotionProperties = {
  initial: { opacity: 0 },
  animate: { opacity: 0.7 },
  whileHover: { opacity: 1 },
};

export const OrdersDetailsError = ({
  message = "Failed to retrieve your orders! Please try again later.",
}: {
  message?: string;
}) => <Error smallVersion message={message} />;

export const HighlightedOrderDetailsEntry = ({
  children,
}: {
  children: ReactNode;
}) => (
  <span className="text-highlightRed font-bold text-sm max-w-full text-wrap flex justify-center sm:text-lg">
    {children}
  </span>
);

export const GroupedOrderDetailsEntry = ({
  children,
}: {
  children: ReactNode;
}) => <p className="flex flex-wrap gap-2 justify-center">{children}</p>;

GroupedOrderDetailsEntry.GroupElement = ({
  children,
}: {
  children: ReactNode;
}) => <span className="flex justify-center items-center">{children}</span>;

type orderDetailsEntriesWithAccessToOrderEntry = "totalValue";
type orderDetailsEntryContentFn<T> = (value: T) => ReactNode;
type IOrderDetailsEntryKeyValueObj<T = unknown> = {
  contentClassName: string;
  contentFn: orderDetailsEntryContentFn<T>;
  passTheWholeOrderEntryToTheContentFn?: boolean;
};

export type IOrderDetailsNormalEntries = {
  [orderKey in keyof IOrder]?: IOrderDetailsEntryKeyValueObj<IOrder[orderKey]>;
};
type IOrderDetailsEntriesWithAccessToOrderEntryValue =
  IOrderDetailsEntryKeyValueObj<IOrder | (IOrder & { userId: IUser })>;
export type IOrderDetailsEntriesWithAccessToOrderEntry<T extends string> = {
  [key in T]?: IOrderDetailsEntriesWithAccessToOrderEntryValue;
};
const orderDetailsEntries: IOrderDetailsNormalEntries = {
  date: {
    contentClassName: "date",
    contentFn: (date) => (
      <>
        Time of order:&nbsp;
        <HighlightedOrderDetailsEntry>
          {dateTimeFormat.format(date)}
        </HighlightedOrderDetailsEntry>
      </>
    ),
  },
  _id: {
    contentClassName: "identificator",
    contentFn: (id) => (
      <>
        ID:&nbsp;
        <HighlightedOrderDetailsEntry>{id}</HighlightedOrderDetailsEntry>
      </>
    ),
  },
  status: {
    contentClassName: "status",
    contentFn: (status) => (
      <>
        Status:&nbsp;
        <HighlightedOrderDetailsEntry>
          {orderUserFriendlyStatusesMap.get(status)}
        </HighlightedOrderDetailsEntry>
      </>
    ),
  },
};

const orderDetailsEntriesWithAccessToOrderEntry: IOrderDetailsEntriesWithAccessToOrderEntry<orderDetailsEntriesWithAccessToOrderEntry> =
  {
    totalValue: {
      contentFn: (order) => {
        const totalValue = order.totalValue;
        return (
          <>
            Total value:&nbsp;
            <HighlightedOrderDetailsEntry>
              {totalValue ? priceFormat.format(totalValue as number) : "Free"}
            </HighlightedOrderDetailsEntry>
          </>
        );
      },
      contentClassName: "total-value",
    },
  };

export default function OrdersList() {
  const {
    ordersDetails: ordersDetailsFromUserOrdersCtx,
    ordersDetailsError: ordersDetailsErrorFromUserOrdersCtx,
    ordersDetailsIsLoading: ordersDetailsIsLoadingFromUserOrdersCtx,
    ordersSortDispatch,
    ordersSortPropertiesStable,
    serveAsAdminPanelOrdersListCtx,
    orderEntryOnClick: orderEntryOnClickFromUserOrdersCtx,
  } = useContext(UserOrdersManagerOrdersDetailsContext);

  const {
    retrieveOrdersQueryData: {
      data: ordersDetailsFromAdminOrderManagerCtx,
      differentError: ordersDetailsErrorFromAdminOrderManagerCtx,
      isLoading: ordersDetailsIsLoadingFromAdminOrderManagerCtx,
      retrieveOrdersAmount: retrieveOrdersAmountFromAdminOrderManagerCtx,
    },
  } = useContext(ManageOrdersFindingOrderContext);

  const { orderEntryOnClick: orderEntryOnClickFromAdminOrderManagerCtx } =
    useContext(UpdateOrderDetailsContext);

  const ordersAmountOfLoggedUser = useAppSelector(
    (state) => state.userAuthSlice.ordersAmount
  );
  const ordersAmount = serveAsAdminPanelOrdersListCtx
    ? retrieveOrdersAmountFromAdminOrderManagerCtx ?? 0
    : ordersAmountOfLoggedUser;

  const [ordersDetails, ordersDetailsIsLoading, ordersDetailsError] = useMemo(
    () =>
      serveAsAdminPanelOrdersListCtx
        ? [
            ordersDetailsFromAdminOrderManagerCtx,
            ordersDetailsIsLoadingFromAdminOrderManagerCtx,
            ordersDetailsErrorFromAdminOrderManagerCtx,
          ]
        : [
            ordersDetailsFromUserOrdersCtx,
            ordersDetailsIsLoadingFromUserOrdersCtx,
            ordersDetailsErrorFromUserOrdersCtx,
          ],
    [
      ordersDetailsErrorFromAdminOrderManagerCtx,
      ordersDetailsErrorFromUserOrdersCtx,
      ordersDetailsFromAdminOrderManagerCtx,
      ordersDetailsFromUserOrdersCtx,
      ordersDetailsIsLoadingFromAdminOrderManagerCtx,
      ordersDetailsIsLoadingFromUserOrdersCtx,
      serveAsAdminPanelOrdersListCtx,
    ]
  );

  const {
    entriesBasedOnOrderDocumentKeysStable,
    entriesWithAccessToOrderEntryStable,
  } = useContext(OrdersListAdditionalOrderDetailsEntriesContext);

  const orderDetailsNormalEntriesStableArr = useMemo(
    () => [entriesBasedOnOrderDocumentKeysStable, orderDetailsEntries],
    [entriesBasedOnOrderDocumentKeysStable]
  );
  const orderDetailsNormalEntries =
    useCreateAppropriateListItemEntriesConditionally(
      orderDetailsNormalEntriesStableArr
    );

  const orderDetailsEntriesWithAccessToOrderEntryObjStableArr = useMemo(
    () => [
      entriesWithAccessToOrderEntryStable,
      orderDetailsEntriesWithAccessToOrderEntry,
    ],
    [entriesWithAccessToOrderEntryStable]
  );
  const orderDetailsEntriesWithAccessToOrderEntryObj =
    useCreateAppropriateListItemEntriesConditionally(
      orderDetailsEntriesWithAccessToOrderEntryObjStableArr
    );

  let content;
  if (ordersDetailsError) content = <OrdersDetailsError />;
  if (ordersDetailsIsLoading)
    content = <LoadingFallback customText="Loading your orders..." />;
  if (ordersAmount === 0 && !serveAsAdminPanelOrdersListCtx)
    content = (
      <Header>
        You haven't placed any order in our shop yet! Feel free to buy your
        desired games at the best prices.
      </Header>
    );
  if (ordersDetails)
    content = (
      <>
        <OrderCustomization
          orderCustomizationObjStable={ordersSortPropertiesStable!}
          appropriateDisplayNamesEntriesStable={{
            date: "Time of placing an order",
            totalValue: "Total value",
          }}
          orderCustomizationDispatch={ordersSortDispatch}
        />
        <ListItems
          listItems={ordersDetails}
          overAllListItemsIdentificator="order"
          listItemKeyGeneratorFn={(ordersDetailsItem) => ordersDetailsItem._id}
          listItemOnClick={(ordersDetailsItem) =>
            !serveAsAdminPanelOrdersListCtx
              ? orderEntryOnClickFromUserOrdersCtx(ordersDetailsItem._id)
              : orderEntryOnClickFromAdminOrderManagerCtx(
                  ordersDetailsItem as IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin
                )
          }
          listItemEntriesBasedOnListItemPropertiesStable={
            orderDetailsNormalEntries
          }
          listItemEntriesBasedOnListItemObjItselfStable={
            orderDetailsEntriesWithAccessToOrderEntryObj
          }
        />
        <article className="orders-pages-wrapper pt-4">
          <PagesElement
            amountOfElementsPerPage={MAX_ORDERS_PER_PAGE}
            totalAmountOfElementsToDisplayOnPages={ordersAmount}
          />
        </article>
      </>
    );

  return content;
}
