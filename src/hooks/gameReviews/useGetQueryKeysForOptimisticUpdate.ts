import { useContext, useMemo } from "react";
import { PagesManagerContext } from "../../store/products/PagesManagerContext";
import { useParams } from "react-router-dom";
import { AddReviewContextCreatingGameDataQueryKeyBasedOnSlugContext } from "../../store/product/AddReviewContext";

export default function useGetQueryKeysForOptimisticUpdate(gameId?: string) {
  const { pageNr } = useContext(PagesManagerContext);
  const { productSlug: productSlug } = useParams();
  const creatingGameDataQueryKeyBasedOnSlug = useContext(
    AddReviewContextCreatingGameDataQueryKeyBasedOnSlugContext
  );
  const gameDataKey = useMemo(
    () => ["games", creatingGameDataQueryKeyBasedOnSlug ? productSlug : gameId],
    [creatingGameDataQueryKeyBasedOnSlug, gameId, productSlug]
  );
  const reviewsKey = useMemo(
    () => [
      "games",
      creatingGameDataQueryKeyBasedOnSlug ? productSlug : gameId,
      "reviews",
      pageNr,
    ],
    [creatingGameDataQueryKeyBasedOnSlug, gameId, pageNr, productSlug]
  );

  return { gameDataKey, reviewsKey };
}
