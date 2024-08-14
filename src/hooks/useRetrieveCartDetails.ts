import { useQuery } from "@tanstack/react-query";

import { getCartDetails } from "../lib/fetch";
import { useAppSelector } from "./reduxStore";
import useCompareComplexForUseMemo from "./useCompareComplexForUseMemo";

export default function useRetrieveCartDetails() {
  const cart = useCompareComplexForUseMemo(
    useAppSelector((state) => state.cartSlice.cart)
  );
  const cartForQueryToAvoidErrors = cart || []; // Had to add it as even though the query getting cart details is disabled when
  // query is falsy it still executes the lines within queryFn and queryKey properties of useQuery obj
  const canLookForCartDetails = cart !== undefined && cart.length > 0;
  const {
    data: cartDetailsData,
    error: cartDetailsError,
    isLoading: cartDetailsIsLoading,
  } = useQuery({
    queryFn: ({ signal }) => getCartDetails(signal, cartForQueryToAvoidErrors),
    queryKey: [
      "cart-details",
      cartForQueryToAvoidErrors.map((cartEntry) => cartEntry.id),
    ],
    enabled: canLookForCartDetails,
    refetchInterval: 30000, // monitoring prices
  });
  return {
    cartDetailsData,
    cartDetailsError,
    cartDetailsIsLoading,
    stateCartStable: cart,
  };
}
