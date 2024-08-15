import { model, Schema } from "mongoose";
import OrderItemSchema, { IOrderItem } from "./orderItem.model";
import {
  AdditionalContactInformationSchema,
  IAdditionalContactInformation,
} from "./additionalContactInformation.model";

const orderPossibleStatuses = [
  "waitingForPayment",
  "paid",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
] as const;

export interface IOrder {
  items: IOrderItem[];
  date?: Date;
  status?: (typeof orderPossibleStatuses)[number];
  orderContactInformation: IAdditionalContactInformation;
  guestEmail?: string;
  accessCode?: string; // this combined with the order id and customer e-mail is going to allow guest users
  // to access their orders based on the links which would be sent via e-mail message
}

const OrderSchema = new Schema<IOrder>({
  items: { type: [OrderItemSchema], required: true },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: orderPossibleStatuses,
    default: "waitingForPayment",
  },
  orderContactInformation: {
    type: AdditionalContactInformationSchema,
    required: true,
  },
  // storing raw contact information schema as here any reference for it wouldn't be beneficial because not like when it comes
  // to games every part of its content is going to be displayed when showing an order and user can change every part of it
  // so I need to store its whole snapshot
  guestEmail: { type: String },
  accessCode: { type: String },
});

const Order = model("Order", OrderSchema);
export default Order;
