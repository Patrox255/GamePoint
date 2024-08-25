import { ReactNode, useCallback, useContext, useMemo } from "react";
import { motion } from "framer-motion";

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
import {
  userOrdersComponentsMotionProperties,
  UserOrdersManagerOrdersDetailsContext,
} from "../../../store/userPanel/UserOrdersManagerOrdersDetailsContext";
import PagesElement from "../../UI/PagesElement";
import { MAX_ORDERS_PER_PAGE } from "../../../lib/config";
import OrderCustomization from "../../UI/OrderCustomization";
import { ManageOrdersFindingOrderContext } from "../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";

export const OrdersDetailsError = ({
  message = "Failed to retrieve your orders! Please try again later.",
}: {
  message?: string;
}) => <Error smallVersion message={message} />;

const HighlightedOrderDetailsEntry = ({
  children,
}: {
  children: ReactNode;
}) => (
  <span className="text-highlightRed font-bold text-sm max-w-full text-wrap flex justify-center sm:text-lg">
    {children}
  </span>
);

type orderDetailsCustomEntries = "totalValue";
type IOrderDetailsEntryKeyValueObj<T = unknown> = {
  contentClassName: string;
  contentFn: (value: T) => ReactNode;
};
const orderDetailsEntries: {
  [orderKey in keyof IOrder]?: IOrderDetailsEntryKeyValueObj<IOrder[orderKey]>;
} = {
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

const orderDetailsCustomEntries: {
  [key in orderDetailsCustomEntries]: IOrderDetailsEntryKeyValueObj;
} = {
  totalValue: {
    contentFn: (totalValue) => (
      <>
        Total value:&nbsp;
        <HighlightedOrderDetailsEntry>
          {totalValue ? priceFormat.format(totalValue as number) : "Free"}
        </HighlightedOrderDetailsEntry>
      </>
    ),
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
      orderEntryOnClick: orderEntryOnClickFromAdminOrderManagerCtx,
    },
  } = useContext(ManageOrdersFindingOrderContext);

  const ordersAmountOfLoggedUser = useAppSelector(
    (state) => state.userAuthSlice.ordersAmount
  );
  const ordersAmount = serveAsAdminPanelOrdersListCtx
    ? ordersDetailsFromAdminOrderManagerCtx
      ? ordersDetailsFromAdminOrderManagerCtx.length
      : 0
    : ordersAmountOfLoggedUser;

  const orderEntryOnClick = useCallback(
    (orderId: string) =>
      (serveAsAdminPanelOrdersListCtx
        ? orderEntryOnClickFromAdminOrderManagerCtx
        : orderEntryOnClickFromUserOrdersCtx
      ).bind(null, orderId),
    [
      orderEntryOnClickFromAdminOrderManagerCtx,
      orderEntryOnClickFromUserOrdersCtx,
      serveAsAdminPanelOrdersListCtx,
    ]
  );

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

  let content;
  if (ordersDetailsError) content = <OrdersDetailsError />;
  if (ordersDetailsIsLoading)
    content = <LoadingFallback customText="Loading your orders..." />;
  if (ordersAmount === 0 && !serveAsAdminPanelOrdersListCtx)
    content = (
      <Header>
        You haven't made any order in our shop yet! Feel free to buy your
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
        <motion.ul
          className="user-orders-list flex w-full flex-col justify-center items-center gap-4"
          {...userOrdersComponentsMotionProperties}
        >
          {ordersDetails.map((ordersDetailsItem) => {
            const orderDetailsItemCustomEntriesValuesObj: {
              [key in orderDetailsCustomEntries]: unknown;
            } = {
              totalValue: ordersDetailsItem.totalValue,
            };

            const orderDetailsEntriesArr = [
              ...Object.entries({
                ...orderDetailsEntries,
                ...orderDetailsCustomEntries,
              }),
            ] as [
              (
                | keyof typeof orderDetailsEntries
                | keyof typeof orderDetailsCustomEntries
              ),
              IOrderDetailsEntryKeyValueObj
            ][];

            return (
              <motion.li
                className="w-full justify-center items-center flex flex-wrap bg-bodyBg px-4 py-8 rounded-xl gap-2 text-xs sm:text-base cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
                key={ordersDetailsItem._id}
                onClick={() => orderEntryOnClick(ordersDetailsItem._id)}
              >
                {orderDetailsEntriesArr.map((orderDetailsEntry) => {
                  const orderDetailsItemDesiredValueKey = orderDetailsEntry[0];
                  return (
                    <p
                      className={`order-${orderDetailsEntry[1].contentClassName} flex items-center justify-center text-wrap flex-wrap max-w-full`}
                      key={`${ordersDetailsItem._id}-${orderDetailsEntry[1].contentClassName}`}
                    >
                      {orderDetailsEntry[1].contentFn(
                        orderDetailsItemDesiredValueKey in ordersDetailsItem
                          ? ordersDetailsItem[
                              orderDetailsItemDesiredValueKey as keyof IOrder
                            ]
                          : orderDetailsItemCustomEntriesValuesObj[
                              orderDetailsItemDesiredValueKey as orderDetailsCustomEntries
                            ]
                      )}
                    </p>
                  );
                })}
              </motion.li>
            );
          })}
        </motion.ul>
      </>
    );

  return (
    <>
      {content}
      {ordersAmount !== 0 && (
        <article className="orders-pages-wrapper pt-4">
          <PagesElement
            amountOfElementsPerPage={MAX_ORDERS_PER_PAGE}
            totalAmountOfElementsToDisplayOnPages={ordersAmount}
          />
        </article>
      )}
    </>
  );
}
