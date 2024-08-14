import { model, Schema } from "mongoose";
import OrderItemSchema, { IOrderItem } from "./orderItem.model";

export interface IOrder {
  items: IOrderItem[];
  date?: Date;
  status: "";
}

const OrderSchema = new Schema<IOrder>({
  items: { type: [OrderItemSchema] },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: [
      "waitingForPayment",
      "paid",
      "processing",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
      "refunded",
    ],
  },
});

const Order = model("Order", OrderSchema);
export default Order;
