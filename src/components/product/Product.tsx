import { useContext } from "react";

import { IGame } from "../../models/game.model";
import ExtendedGamePreview from "../products/ExtendedGamePreview";
import Error from "../UI/Error";
import { ProductContext } from "../../store/product/ProductContext";
import useQueryGetGameData from "../../hooks/queryRelated/useQueryGetGameData";

export default function Product() {
  const { productId, productSlug } = useContext(ProductContext);

  const { gameDataError, gameStable } = useQueryGetGameData({
    productId,
    productSlug,
  });

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
