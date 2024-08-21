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
import useHandleElementsOrderCustomizationState, {
  IOrderCustomizationReducer,
  IOrderCustomizationStateObj,
  IOrderCustomizationStateObjWithDebouncedFields,
} from "../../hooks/useHandleElementsOrderCustomizationState";
import {
  createDebouncedKeys,
  createOrderCustomizationObjWithOnlyOrWithoutDebouncedProperties,
} from "../../components/UI/OrderCustomization";

export type IOrdersSortProperties =
  IOrderCustomizationStateObjWithDebouncedFields<ordersSortPropertiesFieldsNames>;

const ordersSortPropertiesFieldsNames = ["date", "totalValue"] as const;
type ordersSortPropertiesFieldsNames =
  (typeof ordersSortPropertiesFieldsNames)[number];

export type IOrdersSortOnlyDebouncedProperties = IOrderCustomizationStateObj<
  createDebouncedKeys<ordersSortPropertiesFieldsNames>
>;

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
  ordersSortPropertiesStable: IOrdersSortProperties | undefined;
  ordersSortDispatch: React.Dispatch<IOrderCustomizationReducer>;
}>({
  ordersDetails: false,
  ordersDetailsError: null,
  ordersDetailsIsLoading: false,
  ordersSortPropertiesStable: undefined,
  ordersSortDispatch: () => {},
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
  const { orderCustomizationDispatch, orderCustomizationStateStable } =
    useHandleElementsOrderCustomizationState({
      orderCustomizationFieldsNamesStable: ordersSortPropertiesFieldsNames,
      orderCustomizationSearchParamAndSessionStorageEntryName:
        "ordersSortingProperties",
      orderCustomizationDefaultStateFieldsValuesStable: {
        date: { defaultValue: "-1" },
      },
      omitChangingSearchParams: true,
    });
  const ordersSortPropertiesToSend = useMemo(
    () =>
      createOrderCustomizationObjWithOnlyOrWithoutDebouncedProperties(
        orderCustomizationStateStable,
        false
      ),
    [orderCustomizationStateStable]
  );

  const { pageNr } = useContext(PagesManagerContext);

  const {
    data: ordersDetailsData,
    error: ordersDetailsError,
    isLoading: ordersDetailsIsLoading,
  } = useQuery({
    queryFn: ({ signal }) =>
      retrieveUserOrdersDetails(signal, pageNr, ordersSortPropertiesToSend),
    queryKey: ["orders", login, ordersSortPropertiesToSend, pageNr],
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
      value={{
        ordersDetails,
        ordersDetailsError,
        ordersDetailsIsLoading,
        ordersSortDispatch: orderCustomizationDispatch,
        ordersSortPropertiesStable: orderCustomizationStateStable,
      }}
    >
      {children}
    </UserOrdersManagerOrdersDetailsContext.Provider>
  );
}
