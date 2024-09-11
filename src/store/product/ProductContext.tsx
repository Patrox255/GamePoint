import { createContext, ReactNode, useContext } from "react";
import { ManageProductsContext } from "../userPanel/admin/products/ManageProductsContext";

interface IProductContextData {
  productSlug?: string;
  productId?: string;
}
export const ProductContext = createContext<IProductContextData>({});

export default function ProductContextProvider(
  productContextData: IProductContextData & { children?: ReactNode }
) {
  const { selectedProductId } = useContext(ManageProductsContext);

  return (
    <ProductContext.Provider
      value={{
        ...productContextData,
        ...(selectedProductId && { productId: selectedProductId }),
      }}
    >
      {productContextData.children}
    </ProductContext.Provider>
  );
}
