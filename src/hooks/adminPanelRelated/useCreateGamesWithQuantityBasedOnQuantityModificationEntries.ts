import { useMemo, useRef } from "react";
import { IGameWithQuantityBasedOnCartDetailsEntry } from "../../helpers/generateGamesWithQuantityOutOfCartDetailsEntries";
import { OrderItemsQuantityModificationEntries } from "../../store/userPanel/admin/orders/UpdateOrderDetailsContext";

export default function useCreateGamesWithQuantityBasedOnQuantityModificationEntries<
  T extends IGameWithQuantityBasedOnCartDetailsEntry
>(
  gamesWithQuantityStable?: T[],
  orderItemsQuantityModificationEntriesStable?: OrderItemsQuantityModificationEntries
) {
  const hasAnyGameEntryBeenModified = useRef(false);
  const gamesWithQuantityBasedOnQuantityModificationEntries = useMemo(() => {
    if (
      !gamesWithQuantityStable ||
      !orderItemsQuantityModificationEntriesStable
    )
      return;
    hasAnyGameEntryBeenModified.current = false;
    const result = [...gamesWithQuantityStable].map((gameWithQuantity) => ({
      ...gameWithQuantity,
    }));
    orderItemsQuantityModificationEntriesStable?.forEach(
      (orderItemsQuantityModificationEntry) => {
        const relatedGameIndex = result.findIndex(
          (gameWithQuantity) =>
            gameWithQuantity._id === orderItemsQuantityModificationEntry.id
        );
        const relatedGame =
          relatedGameIndex === -1 ? undefined : result[relatedGameIndex];
        if (
          !relatedGame ||
          relatedGame.quantity ===
            orderItemsQuantityModificationEntry.newQuantity
        )
          return;
        hasAnyGameEntryBeenModified.current = true;
        if (orderItemsQuantityModificationEntry.newQuantity <= 0)
          return result.splice(relatedGameIndex, 1);
        relatedGame.quantity = orderItemsQuantityModificationEntry.newQuantity;
      }
    );
    return result as IGameWithQuantityBasedOnCartDetailsEntry[];
  }, [gamesWithQuantityStable, orderItemsQuantityModificationEntriesStable]);

  return {
    gamesWithQuantityBasedOnQuantityModificationEntries,
    hasAnyGameEntryBeenModified: hasAnyGameEntryBeenModified.current,
  };
}
