import { createContext } from "react";
import { IActionMutateArgsContact } from "../../pages/RegisterPage";
import { IAdditionalContactInformationFromGuestOrder } from "../../components/orderPage/OrderPageContent";
import { IAdditionalContactInformation } from "../../models/additionalContactInformation.model";

export const OrderSummaryContentContext = createContext<{
  contactInformationToRender:
    | IActionMutateArgsContact
    | IAdditionalContactInformationFromGuestOrder
    | IAdditionalContactInformation
    | undefined;
  serveAsPlacingOrderSummary?: boolean;
  cartTotalPriceNotFromCartDetails?: number;
}>({
  contactInformationToRender: undefined,
  serveAsPlacingOrderSummary: false,
  cartTotalPriceNotFromCartDetails: undefined,
});
