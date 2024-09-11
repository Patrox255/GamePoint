import { createContext, ReactNode } from "react";
import { ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization } from "./SearchCustomizationContext";
import { IGame } from "../../models/game.model";

interface IProductsSearchCustomizationCustomInformationContext {
  createCustomSearchTermState?: boolean;
  customSearchTermStateInCaseOfUsingExternalOne?: string;
  setCustomSearchTermStateInCaseOfUsingExternalOne?: (
    newSearchTerm: string
  ) => void;
  customSearchParamsAndSessionStorageEntriesNames?: ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization;
  productEntryOnClickStableFn?: (game: IGame) => void;
}
export const ProductsSearchCustomizationCustomInformationContext =
  createContext<IProductsSearchCustomizationCustomInformationContext>({
    createCustomSearchTermState: undefined,
    customSearchTermStateInCaseOfUsingExternalOne: undefined,
    setCustomSearchTermStateInCaseOfUsingExternalOne: undefined,
    customSearchParamsAndSessionStorageEntriesNames: undefined,
    productEntryOnClickStableFn: undefined,
  });

export default function ProductsSearchCustomizationCustomInformationContextProvider({
  createCustomSearchTermState,
  customSearchTermStateInCaseOfUsingExternalOne,
  setCustomSearchTermStateInCaseOfUsingExternalOne,
  customSearchParamsAndSessionStorageEntriesNames,
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
        customSearchParamsAndSessionStorageEntriesNames,
        productEntryOnClickStableFn,
      }}
    >
      {children}
    </ProductsSearchCustomizationCustomInformationContext.Provider>
  );
}
