import { Schema, Types } from "mongoose";
import { IProductPriceInformation } from "./game.model";

export interface IOrderItem extends IProductPriceInformation {
  gameId: Types.ObjectId;
  finalPrice: number;
  quantity: number;
}

const OrderItemSchema = new Schema<IOrderItem>({
  gameId: { Type: Schema.Types.ObjectId, ref: "Game", required: true },
  quantity: { Type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  finalPrice: { type: Number, required: true },
});

export default OrderItemSchema;
