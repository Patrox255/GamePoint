import { createContext, ReactNode } from "react";

import useRetrieveCartDetails from "../../hooks/useRetrieveCartDetails";
import { IGameWithQuantityBasedOnCartDetailsEntry } from "../../helpers/generateGamesWithQuantityOutOfCartDetailsEntries";
import { IOrderResponseFromFetchFn } from "../../lib/fetch";
import {
  FormActionBackendErrorResponse,
  ValidationErrorsArr,
} from "../../components/UI/FormWithErrorHandling";
import { cartDetails } from "../cartSlice";

export interface INewOrderSummaryContextPartFromOrderPageContent {
  placeAnOrderData: IOrderResponseFromFetchFn | undefined;
  placeAnOrderError: FormActionBackendErrorResponse | null;
  placeAnOrderIsPending: boolean;
  orderPlacedSuccessfully: boolean;
  handlePlaceAnOrder: (
    orderedGamesDetails: IGameWithQuantityBasedOnCartDetailsEntry[]
  ) => void;
}

export const NewOrderSummaryContext = createContext<
  INewOrderSummaryContextPartFromOrderPageContent & {
    placeAnOrderValidationErrors: ValidationErrorsArr | null;
    placeAnOrderErrorToRender: Error | null;
    couldNotGetCartDetails: boolean;
    btnDisabledDueToOrderQueryState: boolean;
    cartDetailsData: { data: cartDetails } | undefined;
    cartDetailsIsLoading: boolean;
    cartDetailsError: Error | null;
  }
>({
  placeAnOrderData: undefined,
  placeAnOrderError: null,
  orderPlacedSuccessfully: false,
  placeAnOrderIsPending: false,
  handlePlaceAnOrder: () => {},
  placeAnOrderValidationErrors: null,
  placeAnOrderErrorToRender: null,
  couldNotGetCartDetails: false,
  btnDisabledDueToOrderQueryState: false,
  cartDetailsData: undefined,
  cartDetailsIsLoading: false,
  cartDetailsError: null,
});

export default function NewOrderSummaryContextProvider({
  handlePlaceAnOrder,
  orderPlacedSuccessfully,
  placeAnOrderData,
  placeAnOrderError,
  placeAnOrderIsPending,
  children,
}: INewOrderSummaryContextPartFromOrderPageContent & { children: ReactNode }) {
  const { cartDetailsData, cartDetailsError, cartDetailsIsLoading } =
    useRetrieveCartDetails(orderPlacedSuccessfully !== true);

  const placeAnOrderValidationErrors =
    placeAnOrderError &&
    Array.isArray(placeAnOrderError) &&
    placeAnOrderError.length > 0
      ? placeAnOrderError
      : null;
  const placeAnOrderErrorToRender =
    placeAnOrderError && !Array.isArray(placeAnOrderError)
      ? placeAnOrderError
      : placeAnOrderData?.data && (placeAnOrderData.data as Error).message
      ? (placeAnOrderData?.data as Error)
      : null;

  const couldNotGetCartDetails =
    (!cartDetailsData || cartDetailsError) && !cartDetailsIsLoading
      ? true
      : false;

  const btnDisabledDueToOrderQueryState =
    orderPlacedSuccessfully || placeAnOrderIsPending;

  return (
    <NewOrderSummaryContext.Provider
      value={{
        handlePlaceAnOrder,
        placeAnOrderData,
        orderPlacedSuccessfully,
        placeAnOrderError,
        placeAnOrderIsPending,
        placeAnOrderValidationErrors,
        placeAnOrderErrorToRender,
        couldNotGetCartDetails,
        btnDisabledDueToOrderQueryState,
        cartDetailsData,
        cartDetailsIsLoading,
        cartDetailsError,
      }}
    >
      {children}
    </NewOrderSummaryContext.Provider>
  );
}
