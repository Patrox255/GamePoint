import { useQuery } from "@tanstack/react-query";

import {
  IResponseFromFetchFn,
  retrieveCartDetailsTotalPrice,
} from "../../lib/fetch";
import { FormActionBackendErrorResponse } from "../../components/UI/FormWithErrorHandling";
import { cartStateArr } from "../../store/cartSlice";
import generateCartTotalPriceQueryKey from "../../helpers/generateCartTotalPriceQueryKey";

export default function useQueryGetCartTotalPrice(cart: cartStateArr) {
  const {
    data: cartTotalPriceData,
    error: cartTotalPriceError,
    isLoading: cartTotalPriceIsLoading,
  } = useQuery<IResponseFromFetchFn<number>, FormActionBackendErrorResponse>({
    queryFn: ({ signal }) => retrieveCartDetailsTotalPrice(cart || [], signal),
    enabled: cart !== undefined,
    queryKey: generateCartTotalPriceQueryKey(cart || []),
  });
  return { cartTotalPriceData, cartTotalPriceError, cartTotalPriceIsLoading };
}
