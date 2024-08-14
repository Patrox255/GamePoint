import { createContext } from "react";
import { IActionMutateArgsContact } from "../../pages/RegisterPage";

export const OrderSummaryContentContext = createContext<{
  contactInformationToRender: IActionMutateArgsContact | undefined;
}>({ contactInformationToRender: undefined });
