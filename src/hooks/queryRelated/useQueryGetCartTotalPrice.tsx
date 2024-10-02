import { useQuery } from "@tanstack/react-query";

import {
  IResponseFromFetchFn,
  retrieveCartDetailsTotalPrice,
} from "../../lib/fetch";
import { FormActionBackendErrorResponse } from "../../components/UI/FormWithErrorHandling";
import { cartStateArr } from "../../store/cartSlice";
import generateCartTotalPriceQueryKey from "../../helpers/generateCartTotalPriceQueryKey";
import { useAppSelector } from "../reduxStore";
import { useMemo, useRef } from "react";
import useQueryManageNotificationsBasedOnResponse, {
  IUseQueryManageNotificationsBasedOnResponseArg,
} from "../notificationSystemRelated/useQueryManageNotificationsBasedOnResponse";

export default function useQueryGetCartTotalPrice(
  cart: cartStateArr,
  showNotificationsRelatedToCartTotalPriceQuery: boolean = true
) {
  const queryKey = generateCartTotalPriceQueryKey(cart);
  const totalPriceOptimisticUpdatingInProgress = useAppSelector(
    (state) => state.cartSlice.optimisticUpdatingInProgressObj.totalPrice
  );
  const prevKey = useRef<(cartStateArr | string)[]>();

  const {
    data: cartTotalPriceData,
    error: cartTotalPriceError,
    isLoading: cartTotalPriceIsLoading,
  } = useQuery<IResponseFromFetchFn<number>, FormActionBackendErrorResponse>({
    queryFn: ({ signal }) => retrieveCartDetailsTotalPrice(cart || [], signal),
    enabled:
      cart !== undefined &&
      queryKey !== undefined &&
      !totalPriceOptimisticUpdatingInProgress,
    queryKey,
  });
  const useQueryManageNotificationsBasedOnResponseArg = useMemo<
    IUseQueryManageNotificationsBasedOnResponseArg<"headerNotification">
  >(
    () => ({
      queryData: cartTotalPriceData?.data,
      queryError: cartTotalPriceError,
      queryIsLoading: cartTotalPriceIsLoading,
      relatedApplicationFunctionalityIdentifier: "cartTotalPrice",
      loadingMessage: "Validating your cart total price on the server...",
      successMessage: "Successfully validated your cart total price!",
      contentComponentIdForNormalErrorNotification: "headerNotification",
      contentComponentPropsGeneratorForNormalErrorNotification: () => ({
        header: "Failed to validate cart total price!",
        text: "Keep in mind that currently displayed price may be different than the real one until you manage to reestablish the connection with the server.",
      }),
      errorMessageNotificationDuration: 15,
      enabled: showNotificationsRelatedToCartTotalPriceQuery,
    }),
    [
      cartTotalPriceData?.data,
      cartTotalPriceError,
      cartTotalPriceIsLoading,
      showNotificationsRelatedToCartTotalPriceQuery,
    ]
  );
  useQueryManageNotificationsBasedOnResponse(
    useQueryManageNotificationsBasedOnResponseArg
  );
  prevKey.current = queryKey;
  return { cartTotalPriceData, cartTotalPriceError, cartTotalPriceIsLoading };
}
