import { useCallback, useContext } from "react";

import ProductsSearchCustomizationCustomInformationContextProvider from "../../../../store/products/ProductsSearchCustomizationCustomInformationContext";
import ExtendedProductsList from "../../../products/ExtendedProductsList";
import { ManageProductsContext } from "../../../../store/userPanel/admin/products/ManageProductsContext";
import { TabsComponentContext } from "../../../structure/TabsComponent";
import { IGame } from "../../../../models/game.model";
import { ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization } from "../../../../store/products/SearchCustomizationContext";

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
    <ProductsSearchCustomizationCustomInformationContextProvider
      createCustomSearchTermState={true}
      customSearchParamsAndSessionStorageEntriesNames={
        manageProductsCustomSearchParamsAndSessionStorageEntriesNames
      }
      productEntryOnClickStableFn={handleProductEntryClick}
    >
      <ExtendedProductsList />
    </ProductsSearchCustomizationCustomInformationContextProvider>
  );
}
