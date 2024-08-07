import { useContext, useMemo } from "react";
import { PagesManagerContext } from "../../store/products/PagesManagerContext";
import { useParams } from "react-router-dom";

export default function useGetQueryKeysForOptimisticUpdate() {
  const { pageNr } = useContext(PagesManagerContext);
  const { productSlug } = useParams();
  const gameDataKey = useMemo(() => ["games", productSlug], [productSlug]);
  const reviewsKey = useMemo(
    () => ["games", productSlug, "reviews", pageNr],
    [pageNr, productSlug]
  );

  return { gameDataKey, reviewsKey };
}
