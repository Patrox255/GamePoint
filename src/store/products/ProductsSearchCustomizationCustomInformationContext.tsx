import { createContext, ReactNode } from "react";
import { IGame } from "../../models/game.model";

interface IProductsSearchCustomizationCustomInformationContext {
  createCustomSearchTermState?: boolean;
  customSearchTermStateInCaseOfUsingExternalOne?: string;
  setCustomSearchTermStateInCaseOfUsingExternalOne?: (
    newSearchTerm: string
  ) => void;
  productEntryOnClickStableFn?: (game: IGame) => void;
}
export const ProductsSearchCustomizationCustomInformationContext =
  createContext<IProductsSearchCustomizationCustomInformationContext>({
    createCustomSearchTermState: undefined,
    customSearchTermStateInCaseOfUsingExternalOne: undefined,
    setCustomSearchTermStateInCaseOfUsingExternalOne: undefined,
    productEntryOnClickStableFn: undefined,
  });

export default function ProductsSearchCustomizationCustomInformationContextProvider({
  createCustomSearchTermState,
  customSearchTermStateInCaseOfUsingExternalOne,
  setCustomSearchTermStateInCaseOfUsingExternalOne,
  productEntryOnClickStableFn,
  children,
}: IProductsSearchCustomizationCustomInformationContext & {
  children?: ReactNode;
}) {
  return (
    <ProductsSearchCustomizationCustomInformationContext.Provider
      value={{
        createCustomSearchTermState,
        customSearchTermStateInCaseOfUsingExternalOne,
        setCustomSearchTermStateInCaseOfUsingExternalOne,
        productEntryOnClickStableFn,
      }}
    >
      {children}
    </ProductsSearchCustomizationCustomInformationContext.Provider>
  );
}
