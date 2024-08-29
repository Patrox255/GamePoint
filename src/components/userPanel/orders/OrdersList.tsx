import { ReactNode, useContext, useMemo } from "react";
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
import {
  IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin,
  ManageOrdersFindingOrderContext,
} from "../../../store/userPanel/admin/orders/ManageOrdersFindingOrderContext";
import { IUser } from "../../../models/user.model";
import { OrdersListAdditionalOrderDetailsEntriesContext } from "../../../store/userPanel/admin/orders/OrdersListAdditionalOrderDetailsEntriesContext";
import { UpdateOrderDetailsContext } from "../../../store/userPanel/admin/orders/UpdateOrderDetailsContext";

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

type orderDetailsCustomEntries = "totalValue";
type orderDetailsEntriesWithAccessToOrderEntry = "";
type orderDetailsEntryContentFn<T> = (value: T) => ReactNode;
type IOrderDetailsEntryKeyValueObj<T = unknown> = {
  contentClassName: string;
  contentFn: orderDetailsEntryContentFn<T>;
  passTheWholeOrderEntryToTheContentFn?: boolean;
};

export type IOrderDetailsNormalEntries = {
  [orderKey in keyof IOrder]?: IOrderDetailsEntryKeyValueObj<IOrder[orderKey]>;
};
export type IOrderDetailsCustomEntries<T extends string> = {
  [key in T]?: IOrderDetailsEntryKeyValueObj;
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

const orderDetailsCustomEntries: IOrderDetailsCustomEntries<orderDetailsCustomEntries> =
  {
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

const orderDetailsEntriesWithAccessToOrderEntry: IOrderDetailsEntriesWithAccessToOrderEntry<orderDetailsEntriesWithAccessToOrderEntry> =
  {};

const modifyOrderDetailsEntriesWithAccessToOrderEntryToIndicateProperly = <
  T extends string
>(
  entries: IOrderDetailsEntriesWithAccessToOrderEntry<T>
) =>
  Object.fromEntries(
    Object.entries(entries).map((entry) => [
      entry[0],
      {
        ...(entry[1] as IOrderDetailsEntriesWithAccessToOrderEntryValue),
        passTheWholeOrderEntryToTheContentFn: true,
      },
    ])
  );

const createOrderDetailsEntriesObjBasedOnCtxEntries = <
  T extends string,
  Y extends string
>(
  customEntries?: IOrderDetailsCustomEntries<T>,
  entriesBasedOnOrderDocumentKeys?: IOrderDetailsNormalEntries,
  entriesWithAccessToOrderEntry?: IOrderDetailsEntriesWithAccessToOrderEntry<Y>
) => {
  let resultEntries: IOrderDetailsNormalEntries &
    IOrderDetailsCustomEntries<T> &
    IOrderDetailsEntriesWithAccessToOrderEntry<Y> = {};
  [
    customEntries,
    entriesBasedOnOrderDocumentKeys,
    entriesWithAccessToOrderEntry,
  ].forEach((entriesObj) => {
    if (!entriesObj) return;
    const entriesArr = [...Object.entries(entriesObj)];
    if (entriesArr.length < 1) return;
    const entriesObjToMerge =
      entriesObj === entriesWithAccessToOrderEntry
        ? modifyOrderDetailsEntriesWithAccessToOrderEntryToIndicateProperly(
            entriesWithAccessToOrderEntry
          )
        : entriesObj;
    resultEntries = { ...resultEntries, ...entriesObjToMerge };
  });
  return resultEntries;
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
    customEntries,
    entriesBasedOnOrderDocumentKeys,
    entriesWithAccessToOrderEntry,
  } = useContext(OrdersListAdditionalOrderDetailsEntriesContext);

  const orderDetailsEntriesArr = useMemo(
    () =>
      [
        ...Object.entries({
          ...orderDetailsEntries,
          ...orderDetailsCustomEntries,
          ...modifyOrderDetailsEntriesWithAccessToOrderEntryToIndicateProperly(
            orderDetailsEntriesWithAccessToOrderEntry
          ),
          ...createOrderDetailsEntriesObjBasedOnCtxEntries(
            customEntries,
            entriesBasedOnOrderDocumentKeys,
            entriesWithAccessToOrderEntry
          ),
        }),
      ] as [string, IOrderDetailsEntryKeyValueObj][],
    [
      customEntries,
      entriesBasedOnOrderDocumentKeys,
      entriesWithAccessToOrderEntry,
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

            return (
              <motion.li
                className="w-full justify-center items-center flex flex-wrap bg-bodyBg px-4 py-8 rounded-xl gap-2 text-xs sm:text-base cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
                key={ordersDetailsItem._id}
                onClick={() =>
                  !serveAsAdminPanelOrdersListCtx
                    ? orderEntryOnClickFromUserOrdersCtx(ordersDetailsItem._id)
                    : orderEntryOnClickFromAdminOrderManagerCtx(
                        ordersDetailsItem as IReceivedOrdersDocumentWhenRetrievingThemAsAnAdmin
                      )
                }
              >
                {orderDetailsEntriesArr.map((orderDetailsEntry) => {
                  const orderDetailsItemDesiredValueKey = orderDetailsEntry[0];
                  return (
                    <section
                      className={`order-${orderDetailsEntry[1].contentClassName} flex items-center justify-center text-wrap flex-wrap max-w-full`}
                      key={`${ordersDetailsItem._id}-${orderDetailsEntry[1].contentClassName}`}
                    >
                      {orderDetailsEntry[1].contentFn(
                        !orderDetailsEntry[1]
                          .passTheWholeOrderEntryToTheContentFn
                          ? orderDetailsItemDesiredValueKey in ordersDetailsItem
                            ? ordersDetailsItem[
                                orderDetailsItemDesiredValueKey as keyof IOrder
                              ]
                            : orderDetailsItemCustomEntriesValuesObj[
                                orderDetailsItemDesiredValueKey as orderDetailsCustomEntries
                              ]
                          : ordersDetailsItem
                      )}
                    </section>
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
