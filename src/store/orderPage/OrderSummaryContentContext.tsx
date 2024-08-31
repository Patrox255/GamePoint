import { createContext } from "react";
import { IActionMutateArgsContact } from "../../pages/RegisterPage";
import { IAdditionalContactInformationFromGuestOrder } from "../../components/orderPage/OrderPageContent";
import { IAdditionalContactInformation } from "../../models/additionalContactInformation.model";
import { IGameWithQuantityBasedOnCartDetailsEntry } from "../../helpers/generateGamesWithQuantityOutOfCartDetailsEntries";

export const OrderSummaryContentContext = createContext<{
  contactInformationToRender:
    | IActionMutateArgsContact
    | IAdditionalContactInformationFromGuestOrder
    | IAdditionalContactInformation
    | undefined;
  serveAsPlacingOrderSummary?: boolean;
  cartTotalPriceNotFromCartDetails?: number;
  orderStatus?: string;
  gamesWithQuantityOutOfOrderItemsStable?: IGameWithQuantityBasedOnCartDetailsEntry[];
}>({
  contactInformationToRender: undefined,
  serveAsPlacingOrderSummary: false,
  cartTotalPriceNotFromCartDetails: undefined,
  orderStatus: "",
  gamesWithQuantityOutOfOrderItemsStable: undefined,
});
