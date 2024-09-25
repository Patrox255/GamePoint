import { useContext } from "react";
import { AnimatePresence } from "framer-motion";

import TabsComponent, {
  ITagsObjDefault,
} from "../../../structure/TabsComponent";
import ProductContextProvider from "../../../../store/product/ProductContext";
import Product from "../../../product/Product";
import { ManageProductsContext } from "../../../../store/userPanel/admin/products/ManageProductsContext";
import ManageProductsProductsList from "./ManageProductsProductsList";
import ManageProductsEditSelectedProduct from "./ManageProductsEditSelectedProduct";
import CustomSearchParamsAndSessionStorageEntriesNamesContextProvider from "../../../../store/stateManagement/CustomSearchParamsAndSessionStorageEntriesNamesContext";
import { ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization } from "../../../../store/products/SearchCustomizationContext";
import ManageProductsAddANewProduct from "./ManageProductsAddANewProduct";
import { AddReviewContextCreatingGameDataQueryKeyBasedOnSlugContextProvider } from "../../../../store/product/AddReviewContext";

type manageProductsSections = "overview" | "new" | "edit" | "list";

const searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomizationInCaseOfExistingProductManagement: ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization =
  {
    defaultSearchParamsAndSessionStorageEntriesNamesSuffix:
      "AdminProductsManagementExisting",
  };
const searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomizationInCaseOfNewProductManagement: ISearchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization =
  {
    defaultSearchParamsAndSessionStorageEntriesNamesSuffix:
      "AdminProductsManagementNew",
  };

const manageProductsAllSections: ITagsObjDefault<manageProductsSections>[] = [
  {
    tagName: "list",
    ComponentToRender: <ManageProductsProductsList />,
    header: "Products List",
  },
  {
    ComponentToRender: (
      <AddReviewContextCreatingGameDataQueryKeyBasedOnSlugContextProvider
        creatingGameDataQueryKeyBasedOnSlug={false}
      >
        <ProductContextProvider>
          <Product />
        </ProductContextProvider>
      </AddReviewContextCreatingGameDataQueryKeyBasedOnSlugContextProvider>
    ),
    header: "Overview",
    tagName: "overview",
  },
  {
    tagName: "edit",
    header: "Edit Selected Product",
    ComponentToRender: (
      <CustomSearchParamsAndSessionStorageEntriesNamesContextProvider
        searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization={
          searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomizationInCaseOfExistingProductManagement
        }
      >
        <ManageProductsEditSelectedProduct />
      </CustomSearchParamsAndSessionStorageEntriesNamesContextProvider>
    ),
  },
  {
    tagName: "new",
    header: "Add a new product",
    ComponentToRender: (
      <CustomSearchParamsAndSessionStorageEntriesNamesContextProvider
        searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomization={
          searchParamsAndSessionStorageEntriesNamesForProductsSearchCustomizationInCaseOfNewProductManagement
        }
      >
        <ManageProductsAddANewProduct />
      </CustomSearchParamsAndSessionStorageEntriesNamesContextProvider>
    ),
  },
];

export default function ManageProducts() {
  const { selectedProductId, restrictManageProductsSectionsNavigation } =
    useContext(ManageProductsContext);

  return (
    <AnimatePresence mode="wait">
      <TabsComponent
        defaultTabsStateValue={"list" as manageProductsSections}
        possibleTabsStable={manageProductsAllSections}
        generateAvailableTabsFromAllFnStable={(allSections) =>
          selectedProductId
            ? allSections
            : allSections.filter((sectionObj) =>
                ["list"].includes(sectionObj.tagName)
              )
        }
        forceDisableNavigation={restrictManageProductsSectionsNavigation}
        useAlternativeLookAsASlider
      />
    </AnimatePresence>
  );
}
