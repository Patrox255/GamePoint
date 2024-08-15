import { Schema, Types } from "mongoose";
import { IProductPriceInformation } from "./game.model";

export interface IOrderItem extends IProductPriceInformation {
  gameId: Types.ObjectId;
  finalPrice: number;
  quantity: number;
}
// storing a reference to the individual game to access its universal information and at the same time store its prices
// at the moment of placing an order so that they remain the same upon changing in the inidividual game

const OrderItemSchema = new Schema<IOrderItem>({
  gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  finalPrice: { type: Number, required: true },
});

export default OrderItemSchema;
