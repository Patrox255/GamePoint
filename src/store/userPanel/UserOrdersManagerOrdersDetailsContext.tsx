/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimationProps } from "framer-motion";

import { IOrder } from "../../models/order.model";
import {
  IRetrieveOrdersDetailsBackendResponse,
  retrieveUserOrdersDetails,
} from "../../lib/fetch";
import { useAppSelector } from "../../hooks/reduxStore";
import { PagesManagerContext } from "../products/PagesManagerContext";

export const userOrdersComponentsMotionProperties: AnimationProps = {
  initial: {
    opacity: 0,
  },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const UserOrdersManagerOrdersDetailsContext = createContext<{
  ordersDetails: false | IOrder[];
  ordersDetailsError: Error | null;
  ordersDetailsIsLoading: boolean;
}>({
  ordersDetails: false,
  ordersDetailsError: null,
  ordersDetailsIsLoading: false,
});

export default function UserOrdersManagerOrdersDetailsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const ordersAmount = useAppSelector(
    (state) => state.userAuthSlice.ordersAmount
  );
  const login = useAppSelector((state) => state.userAuthSlice.login);

  const { pageNr } = useContext(PagesManagerContext);

  const {
    data: ordersDetailsData,
    error: ordersDetailsError,
    isLoading: ordersDetailsIsLoading,
  } = useQuery({
    queryFn: ({ signal }) => retrieveUserOrdersDetails(signal, pageNr),
    queryKey: ["orders", login, pageNr],
    enabled: ordersAmount > 0,
  });

  const ordersDetails = useMemo(
    () =>
      typeof ordersDetailsData?.data === "object" &&
      (ordersDetailsData.data as IRetrieveOrdersDetailsBackendResponse).orders,
    [ordersDetailsData]
  );

  console.log(ordersDetails ? ordersDetails.length : undefined);

  return (
    <UserOrdersManagerOrdersDetailsContext.Provider
      value={{ ordersDetails, ordersDetailsError, ordersDetailsIsLoading }}
    >
      {children}
    </UserOrdersManagerOrdersDetailsContext.Provider>
  );
}
