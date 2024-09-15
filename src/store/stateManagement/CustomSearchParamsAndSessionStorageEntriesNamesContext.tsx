import { createContext, ReactNode } from "react";
import { ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization } from "../products/SearchCustomizationContext";

export type ICustomSearchParamsAndSessionStorageEntriesNamesContextBody = {
  searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization?: ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization;
};
export const CustomSearchParamsAndSessionStorageEntriesNamesContext =
  createContext<ICustomSearchParamsAndSessionStorageEntriesNamesContextBody>(
    {}
  );

export default function CustomSearchParamsAndSessionStorageEntriesNamesContextProvider({
  children,
  searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization,
}: ICustomSearchParamsAndSessionStorageEntriesNamesContextBody & {
  children?: ReactNode;
}) {
  return (
    <CustomSearchParamsAndSessionStorageEntriesNamesContext.Provider
      value={{
        searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization,
      }}
    >
      {children}
    </CustomSearchParamsAndSessionStorageEntriesNamesContext.Provider>
  );
}
