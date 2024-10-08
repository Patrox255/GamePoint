import {
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useContext, useMemo } from "react";
import { motion } from "framer-motion";

import { IUserOrdersManagerParams } from "./UserOrdersManager";
import { IUserPanelLoaderData } from "../../../pages/UserPanelPage";
import { FormActionBackendErrorResponse } from "../../UI/FormWithErrorHandling";
import LoadingFallback from "../../UI/LoadingFallback";
import Error from "../../UI/Error";
import TimedOutActionWithProgressBar from "../../UI/TimedOutActionWithProgressBar";
import { userOrdersComponentsMotionProperties } from "../../../store/userPanel/UserOrdersManagerOrdersDetailsContext";
import { OrderSummaryContentContext } from "../../../store/orderPage/OrderSummaryContentContext";
import OrderSummary from "../../orderPage/OrderSummary";
import transformOrderItemsToGamesWithQuantity from "../../../helpers/transformOrderItemsToGamesWithQuantity";
import { retrieveOrderData } from "../../../lib/fetch";
import { IOrder } from "../../../models/order.model";
import { UpdateOrderDetailsContext } from "../../../store/userPanel/admin/orders/UpdateOrderDetailsContext";
import filterOrOnlyIncludeCertainPropertiesFromObj from "../../../helpers/filterOrOnlyIncludeCertainPropertiesFromObj";

export type IRetrieveOrderDataResponse = { data: IOrder };

export default function OrderSummaryUserPanel() {
  const { userId } = useLoaderData() as IUserPanelLoaderData;
  const { orderId: orderIdFromParam } = useParams() as IUserOrdersManagerParams;
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const {
    selectedOrderFromList: orderIdFromAdminOrderFinding,
    handleGoBackFromOrderSummary: handleGoBackFromAdminOrderSummary,
  } = useContext(UpdateOrderDetailsContext);

  const orderId = orderIdFromAdminOrderFinding || orderIdFromParam;

  const {
    error: requestedOrderError,
    isLoading: requestedOrderIsLoading,
    data: requestedOrderData,
  } = useQuery<IRetrieveOrderDataResponse, FormActionBackendErrorResponse>({
    queryKey: ["orderData", userId, orderId],
    queryFn: ({ signal }) => retrieveOrderData(orderId!, signal),
  });
  const error = requestedOrderError
    ? Array.isArray(requestedOrderError)
      ? requestedOrderError[0]
      : requestedOrderError
    : null;

  const handleRedirectBack = useCallback(() => {
    const parentPath = pathname.split("/").slice(0, -1).join("/") + search; // had to manually remove the last part of the current pathname
    // as apparently when current route consists only of params then redirection to the one route above doesn't quite work well
    navigate(parentPath, { replace: true });
  }, [navigate, pathname, search]);

  const handleGoBack = handleGoBackFromAdminOrderSummary
    ? handleGoBackFromAdminOrderSummary
    : handleRedirectBack;

  const selectedOrder = useMemo(
    () => (requestedOrderData?.data ? requestedOrderData.data : undefined),
    [requestedOrderData]
  );
  const gamesWithQuantityOutOfOrderItemsStable = useMemo(
    () =>
      requestedOrderData?.data?.items
        ? transformOrderItemsToGamesWithQuantity(requestedOrderData.data.items)
        : undefined,
    [requestedOrderData]
  );

  let content;
  if (requestedOrderIsLoading)
    content = <LoadingFallback customText="Retrieving order data..." />;
  else if (error)
    content = (
      <article className="w-full flex flex-col gap-8">
        <Error
          message="Identificator of the selected order seems to be incorrect! Redirecting back to the orders list in 5 seconds..."
          smallVersion
        ></Error>
        <TimedOutActionWithProgressBar
          action={handleGoBack}
          timeBeforeFiringAnAction={5000}
          negativeResult
          darkerBg
        />
      </article>
    );
  else if (!selectedOrder)
    content = (
      <Error
        message="Failed to retrieve your selected order data! Please try again later."
        smallVersion
      />
    );
  else if (selectedOrder)
    content = (
      <OrderSummaryContentContext.Provider
        value={{
          contactInformationToRender: selectedOrder.orderContactInformation,
          cartTotalPriceNotFromCartDetails: selectedOrder.totalValue,
          orderStatus: selectedOrder.status,
          gamesWithQuantityOutOfOrderItemsStable,
        }}
      >
        <OrderSummary handleGoBack={handleGoBack} />
      </OrderSummaryContentContext.Provider>
    );

  return (
    <motion.article
      {...filterOrOnlyIncludeCertainPropertiesFromObj(
        userOrdersComponentsMotionProperties,
        ["exit"]
      )}
    >
      {content}
    </motion.article>
  );
}
