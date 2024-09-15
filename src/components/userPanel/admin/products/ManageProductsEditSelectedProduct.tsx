import { useContext } from "react";

import { ManageProductsContext } from "../../../../store/userPanel/admin/products/ManageProductsContext";
import useQueryGetGameData from "../../../../hooks/queryRelated/useQueryGetGameData";
import Error from "../../../UI/Error";
import LoadingFallback from "../../../UI/LoadingFallback";
import NewOrExistingProductManagementForm from "../../../product/NewOrExistingProductManagementForm";

export default function ManageProductsEditSelectedProduct() {
  const { selectedProductId } = useContext(ManageProductsContext);
  const { gameDataError, gameDataIsLoading, gameStable } = useQueryGetGameData({
    productId: selectedProductId,
  });

  let content;
  if (gameDataError)
    content = <Error smallVersion message={gameDataError.message} />;
  if (gameDataIsLoading)
    content = (
      <LoadingFallback customText="Retrieving current data of the selected product... " />
    );
  if (gameStable)
    content = <NewOrExistingProductManagementForm gameStable={gameStable} />;
  return content;
}
