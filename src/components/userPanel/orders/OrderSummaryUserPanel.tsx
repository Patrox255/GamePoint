import {
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { IUserOrdersManagerParams } from "./UserOrdersManager";
import { useQuery } from "@tanstack/react-query";
import { IUserPanelLoaderData } from "../../../pages/UserPanelPage";
import { checkOrderId } from "../../../lib/fetch";
import { FormActionBackendErrorResponse } from "../../UI/FormWithErrorHandling";
import { useCallback, useContext, useMemo } from "react";
import LoadingFallback from "../../UI/LoadingFallback";
import Error from "../../UI/Error";
import TimedOutActionWithProgressBar from "../../UI/TimedOutActionWithProgressBar";
import { UserOrdersManagerOrdersDetailsContext } from "../../../store/userPanel/UserOrdersManagerOrdersDetailsContext";
import { OrdersDetailsError } from "./OrdersList";
import { OrderSummaryContentContext } from "../../../store/orderPage/OrderSummaryContentContext";
import OrderSummary from "../../orderPage/OrderSummary";
import transformOrderItemsToGamesWithQuantity from "../../../helpers/transformOrderItemsToGamesWithQuantity";

export default function OrderSummaryUserPanel() {
  const { userId } = useLoaderData() as IUserPanelLoaderData;
  const { orderId } = useParams() as IUserOrdersManagerParams;
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const { error: checkOrderIdError, isLoading: checkOrderIdIsLoading } =
    useQuery<{ data: string }, FormActionBackendErrorResponse>({
      queryKey: ["orderIdValidate", userId, orderId],
      queryFn: ({ signal }) => checkOrderId(orderId!, signal),
    });
  const error = checkOrderIdError
    ? Array.isArray(checkOrderIdError)
      ? checkOrderIdError[0]
      : checkOrderIdError
    : null;

  const handleRedirectBack = useCallback(() => {
    const parentPath = pathname.split("/").slice(0, -1).join("/") + search; // had to manually remove the last part of the current pathname
    // as apparently when current route consists only of params then redirection to the one route above doesn't quite work well
    navigate(parentPath, { replace: true });
  }, [navigate, pathname, search]);

  const { ordersDetails, ordersDetailsError, ordersDetailsIsLoading } =
    useContext(UserOrdersManagerOrdersDetailsContext);
  const selectedOrder = useMemo(
    () =>
      ordersDetails
        ? ordersDetails.find(
            (ordersDetailsEntry) => ordersDetailsEntry._id === orderId
          )
        : undefined,
    [orderId, ordersDetails]
  );

  let content;
  if (checkOrderIdIsLoading)
    content = <LoadingFallback customText="Retrieving order data..." />;
  else if (error)
    content = (
      <article className="w-full flex flex-col gap-8">
        <Error
          message="Identificator of the selected order seems to be incorrect! Redirecting back to the orders list in 5 seconds..."
          smallVersion
        ></Error>
        <TimedOutActionWithProgressBar
          action={handleRedirectBack}
          timeBeforeFiringAnAction={5000}
          negativeResult
          darkerBg
        />
      </article>
    );
  else if (ordersDetailsError) content = <OrdersDetailsError />;
  else if (ordersDetailsIsLoading)
    content = <LoadingFallback customText="Loading your order data..." />;
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
        }}
      >
        <OrderSummary
          handleGoBack={handleRedirectBack}
          gamesWithQuantityStableFromProps={transformOrderItemsToGamesWithQuantity(
            selectedOrder.items
          )}
        />
      </OrderSummaryContentContext.Provider>
    );

  return content;
}
