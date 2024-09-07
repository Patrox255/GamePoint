/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
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
import { createDebouncedKeys } from "../../components/UI/OrderCustomization";
import useCreateOrderCustomizationSortPropertiesToSend from "../../hooks/orderCustomizationRelated/useCreateOrderCustomizationSortPropertiesToSend";
import { useLocation, useNavigate } from "react-router-dom";
import createUrlWithCurrentSearchParams from "../../helpers/createUrlWithCurrentSearchParams";
import { ManageUsersContext } from "./admin/users/ManageUsersContext";

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
  serveAsAdminPanelOrdersListCtx: boolean;
  insideManageUsersComponent: boolean;
  ordersSortPropertiesToSend: IOrdersSortOnlyDebouncedProperties | undefined;
  orderEntryOnClick: (orderId: string) => void;
}>({
  ordersDetails: false,
  ordersDetailsError: null,
  ordersDetailsIsLoading: false,
  ordersSortPropertiesStable: undefined,
  ordersSortDispatch: () => {},
  serveAsAdminPanelOrdersListCtx: false,
  insideManageUsersComponent: false,
  ordersSortPropertiesToSend: undefined,
  orderEntryOnClick: () => {},
});

export default function UserOrdersManagerOrdersDetailsContextProvider({
  children,
  orderDetailsQueryEnabled = true,
  sortCustomizationSearchParamsAndSessionStorageEntryName = "ordersSortingProperties",
}: {
  children: ReactNode;
  orderDetailsQueryEnabled?: boolean;
  sortCustomizationSearchParamsAndSessionStorageEntryName?: string;
}) {
  const ordersAmount = useAppSelector(
    (state) => state.userAuthSlice.ordersAmount
  );
  const login = useAppSelector((state) => state.userAuthSlice.login);
  const { orderCustomizationDispatch, orderCustomizationStateStable } =
    useHandleElementsOrderCustomizationState({
      orderCustomizationFieldsNamesStable: ordersSortPropertiesFieldsNames,
      orderCustomizationSearchParamAndSessionStorageEntryName:
        sortCustomizationSearchParamsAndSessionStorageEntryName,
      orderCustomizationDefaultStateFieldsValuesStable: {
        date: { defaultValue: "-1" },
      },
      omitChangingSearchParams: true,
    });

  const serveAsAdminPanelOrdersListCtx =
    sortCustomizationSearchParamsAndSessionStorageEntryName ===
    "sortAdminRetrievedOrdersProperties";
  const { selectedUserFromList: selectedUserFromListFromUserManagementCtx } =
    useContext(ManageUsersContext);
  const insideManageUsersComponent =
    selectedUserFromListFromUserManagementCtx !== undefined;

  const { pageNr } = useContext(PagesManagerContext);
  const ordersSortPropertiesToSend =
    useCreateOrderCustomizationSortPropertiesToSend(
      orderCustomizationStateStable
    ) as IOrdersSortOnlyDebouncedProperties;

  const {
    data: ordersDetailsData,
    error: ordersDetailsError,
    isLoading: ordersDetailsIsLoading,
  } = useQuery({
    queryFn: ({ signal }) =>
      retrieveUserOrdersDetails(signal, pageNr, ordersSortPropertiesToSend),
    queryKey: ["orders", login, ordersSortPropertiesToSend, pageNr],
    enabled: ordersAmount > 0 && orderDetailsQueryEnabled,
  });

  const ordersDetails = useMemo(
    () =>
      typeof ordersDetailsData?.data === "object" &&
      (ordersDetailsData.data as IRetrieveOrdersDetailsBackendResponse).orders,
    [ordersDetailsData]
  );

  const navigate = useNavigate();
  const { search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const orderEntryOnClick = useCallback(
    (orderId: string) =>
      navigate(
        createUrlWithCurrentSearchParams({
          searchParams,
          pathname: orderId,
        }),
        {
          replace: true,
        }
      ),
    [navigate, searchParams]
  );

  return (
    <UserOrdersManagerOrdersDetailsContext.Provider
      value={{
        ordersDetails,
        ordersDetailsError,
        ordersDetailsIsLoading,
        ordersSortDispatch: orderCustomizationDispatch,
        ordersSortPropertiesStable: orderCustomizationStateStable,
        serveAsAdminPanelOrdersListCtx,
        insideManageUsersComponent,
        ordersSortPropertiesToSend,
        orderEntryOnClick,
      }}
    >
      {children}
    </UserOrdersManagerOrdersDetailsContext.Provider>
  );
}
