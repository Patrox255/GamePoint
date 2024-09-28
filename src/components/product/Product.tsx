import { useContext, useMemo } from "react";

import { IGame } from "../../models/game.model";
import ExtendedGamePreview from "../products/ExtendedGamePreview";
import Error from "../UI/Error";
import { ProductContext } from "../../store/product/ProductContext";
import useQueryGetGameData from "../../hooks/queryRelated/useQueryGetGameData";
import useQueryManageNotificationsBasedOnResponse, {
  IUseQueryManageNotificationsBasedOnResponseArg,
} from "../../hooks/notificationSystemRelated/useQueryManageNotificationsBasedOnResponse";
import { loadingRequestedProductMessage } from "../../pages/ProductPage";

export default function Product() {
  const { productId, productSlug } = useContext(ProductContext);

  const { gameDataError, gameStable } = useQueryGetGameData({
    productId,
    productSlug,
  });

  const manageNotificationsHookArg =
    useMemo<IUseQueryManageNotificationsBasedOnResponseArg>(
      () => ({
        queryData: gameStable,
        queryError: gameDataError,
        relatedApplicationFunctionalityIdentifier:
          "fetchingProductBasedOnProvidedData",
        loadingMessage: loadingRequestedProductMessage,
        successMessage: "Successfully loaded the requested product data!",
      }),
      [gameDataError, gameStable]
    );
  useQueryManageNotificationsBasedOnResponse(manageNotificationsHookArg);

  let content;
  if (!productId && !productSlug)
    return (
      <Error
        message="You have to provide Product component either with appropriate product slug or product identificator via context related to it!"
        smallVersion
      />
    );
  if (gameDataError) content = <Error message={gameDataError.message} />;
  if (gameStable) {
    content = (
      <ExtendedGamePreview
        game={gameStable}
        key={`product-${(gameStable as IGame).slug}`}
      />
    );
  }

  return content;
}
