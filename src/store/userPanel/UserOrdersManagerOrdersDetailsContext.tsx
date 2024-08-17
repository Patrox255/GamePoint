import { createContext, ReactNode, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { IOrder } from "../../models/order.model";
import {
  IRetrieveOrdersDetailsBackendResponse,
  retrieveUserOrdersDetails,
} from "../../lib/fetch";
import { useAppSelector } from "../../hooks/reduxStore";

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

  const {
    data: ordersDetailsData,
    error: ordersDetailsError,
    isLoading: ordersDetailsIsLoading,
  } = useQuery({
    queryFn: ({ signal }) => retrieveUserOrdersDetails(signal),
    queryKey: ["orders"],
    enabled: ordersAmount > 0,
  });

  const ordersDetails = useMemo(
    () =>
      typeof ordersDetailsData?.data === "object" &&
      (ordersDetailsData.data as IRetrieveOrdersDetailsBackendResponse).orders,
    [ordersDetailsData]
  );

  return (
    <UserOrdersManagerOrdersDetailsContext.Provider
      value={{ ordersDetails, ordersDetailsError, ordersDetailsIsLoading }}
    >
      {children}
    </UserOrdersManagerOrdersDetailsContext.Provider>
  );
}
