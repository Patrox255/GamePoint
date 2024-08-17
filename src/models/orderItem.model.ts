import { IGame, IProductPriceInformation } from "./game.model";

export interface IOrderItem extends IProductPriceInformation {
  gameId: IGame;
  quantity: number;
}
