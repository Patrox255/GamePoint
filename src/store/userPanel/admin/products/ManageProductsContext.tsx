import { createContext, ReactNode } from "react";
import { useStateWithSearchParams } from "../../../../hooks/useStateWithSearchParams";

export const ManageProductsContext = createContext<{
  selectedProductId: string;
  setSelectedProductId: (newProductId: string) => void;
  setSelectedProductIdAndDebouncedOne: (newProductId: string) => void;
  restrictManageProductsSectionsNavigation: boolean;
}>({
  selectedProductId: "",
  setSelectedProductId: () => {},
  setSelectedProductIdAndDebouncedOne: () => {},
  restrictManageProductsSectionsNavigation: false,
});

export default function ManageProductsContextProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const {
    state: selectedProductId,
    setStateWithSearchParams: setSelectedProductId,
    setNormalAndDebouncingState: setSelectedProductIdAndDebouncedOne,
    debouncingState: selectedProductIdDebounced,
  } = useStateWithSearchParams({
    initialStateStable: "",
    searchParamName: "adminManageProductsSelectedProduct",
    storeEvenInitialValue: false,
  });
  const restrictManageProductsSectionsNavigation =
    selectedProductId !== selectedProductIdDebounced;
  return (
    <ManageProductsContext.Provider
      value={{
        selectedProductId,
        setSelectedProductId,
        setSelectedProductIdAndDebouncedOne,
        restrictManageProductsSectionsNavigation,
      }}
    >
      {children}
    </ManageProductsContext.Provider>
  );
}
