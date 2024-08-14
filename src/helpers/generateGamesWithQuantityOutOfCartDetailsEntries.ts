import { IGame } from "../models/game.model";
import { cartStateArr, ICartDetailsEntry } from "../store/cartSlice";

export type IGameWithQuantityBasedOnCartDetailsEntry = IGame & {
  quantity: number;
};

const generateGamesWithQuantityOutOfCartDetailsEntries = function (
  cartDetails: ICartDetailsEntry[],
  cart: cartStateArr
): IGameWithQuantityBasedOnCartDetailsEntry[] {
  return cartDetails!.map((cartDetailsEntry) => ({
    ...cartDetailsEntry.relatedGame,
    quantity: cart!.find(
      (cartEntry) => cartEntry.id === cartDetailsEntry.relatedGame._id
    )!.quantity,
  }));
};

export default generateGamesWithQuantityOutOfCartDetailsEntries;
