import { useCallback, useContext } from "react";

import ProductsSearchCustomizationCustomInformationContextProvider from "../../../../store/products/ProductsSearchCustomizationCustomInformationContext";
import ExtendedProductsList from "../../../products/ExtendedProductsList";
import { ManageProductsContext } from "../../../../store/userPanel/admin/products/ManageProductsContext";
import { TabsComponentContext } from "../../../structure/TabsComponent";
import { IGame } from "../../../../models/game.model";
import { ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization } from "../../../../store/products/SearchCustomizationContext";
import CustomSearchParamsAndSessionStorageEntriesNamesContextProvider from "../../../../store/stateManagement/CustomSearchParamsAndSessionStorageEntriesNamesContext";

const manageProductsCustomSearchParamsAndSessionStorageEntriesNames: ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization =
  {
    defaultSearchParamsAndSessionStorageEntriesNamesSuffix:
      "AdminManageProducts",
  };

export default function ManageProductsProductsList() {
  const { setSelectedProductId } = useContext(ManageProductsContext);
  const { setTabsState } = useContext(TabsComponentContext);

  const handleProductEntryClick = useCallback(
    (product: IGame) => {
      setSelectedProductId(product._id);
      setTabsState("overview");
    },
    [setSelectedProductId, setTabsState]
  );

  return (
    <CustomSearchParamsAndSessionStorageEntriesNamesContextProvider
      searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization={
        manageProductsCustomSearchParamsAndSessionStorageEntriesNames
      }
    >
      <ProductsSearchCustomizationCustomInformationContextProvider
        createCustomSearchTermState={true}
        productEntryOnClickStableFn={handleProductEntryClick}
      >
        <ExtendedProductsList />
      </ProductsSearchCustomizationCustomInformationContextProvider>
    </CustomSearchParamsAndSessionStorageEntriesNamesContextProvider>
  );
}
