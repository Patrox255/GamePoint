import { ReactNode, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import createUrlWithCurrentSearchParams from "../../../helpers/createUrlWithCurrentSearchParams";
import { UserOrdersManagerOrdersDetailsContext } from "../../../store/userPanel/UserOrdersManagerOrdersDetailsContext";

export const OrdersDetailsError = () => (
  <Error
    smallVersion
    message="Failed to retrieve your orders! Please try again later."
  />
);

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
  const navigate = useNavigate();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);

  const ordersAmount = useAppSelector(
    (state) => state.userAuthSlice.ordersAmount
  );

  const { ordersDetails, ordersDetailsError, ordersDetailsIsLoading } =
    useContext(UserOrdersManagerOrdersDetailsContext);

  let content;
  if (ordersDetailsError) content = <OrdersDetailsError />;
  if (ordersDetailsIsLoading)
    content = <LoadingFallback customText="Loading your orders..." />;
  if (ordersAmount === 0)
    content = (
      <Header>
        You haven't made any order in our shop yet! Feel free to buy your
        desired games at the best prices.
      </Header>
    );
  if (ordersDetails)
    content = (
      <ul className="user-orders-list flex w-full flex-col justify-center items-center">
        {ordersDetails.map((ordersDetailsItem) => {
          const orderTotalValue = ordersDetailsItem.items.reduce(
            (acc, orderItem) => acc + orderItem.quantity * orderItem.finalPrice,
            0
          );
          const orderDetailsItemCustomEntriesValuesObj: {
            [key in orderDetailsCustomEntries]: unknown;
          } = {
            totalValue: orderTotalValue,
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
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 1 }}
              key={ordersDetailsItem._id}
              onClick={() =>
                navigate(
                  createUrlWithCurrentSearchParams({
                    searchParams,
                    pathname: ordersDetailsItem._id,
                  }),
                  {
                    replace: true,
                  }
                )
              }
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
      </ul>
    );

  return content;
}
