import { createContext } from "react";
import { IActionMutateArgsContact } from "../../pages/RegisterPage";
import { IGameWithQuantityBasedOnCartDetailsEntry } from "../../helpers/generateGamesWithQuantityOutOfCartDetailsEntries";
import { FormActionBackendErrorResponse } from "../../components/UI/FormWithErrorHandling";
import { IAdditionalContactInformationFromGuestOrder } from "../../components/orderPage/OrderPageContent";
import { IOrderResponseFromFetchFn } from "../../lib/fetch";

export const OrderSummaryContentContext = createContext<{
  contactInformationToRender:
    | IActionMutateArgsContact
    | IAdditionalContactInformationFromGuestOrder
    | undefined;
  handlePlaceAnOrder: (
    orderedGamesDetails: IGameWithQuantityBasedOnCartDetailsEntry[]
  ) => void;
  placeAnOrderIsPending: boolean;
  placeAnOrderData: IOrderResponseFromFetchFn | undefined;
  placeAnOrderError: FormActionBackendErrorResponse | null;
  orderPlacedSuccessfully: boolean;
}>({
  contactInformationToRender: undefined,
  handlePlaceAnOrder: () => {},
  placeAnOrderIsPending: false,
  placeAnOrderData: undefined,
  placeAnOrderError: null,
  orderPlacedSuccessfully: false,
});
