import { IOrderItem } from "../models/orderItem.model";

export default function transformOrderItemsToGamesWithQuantity(
  orderItems: IOrderItem[]
) {
  return orderItems.map((orderItem) => ({
    ...orderItem.gameId,
    ...orderItem,
    _id: orderItem.gameId._id,
  }));
}
