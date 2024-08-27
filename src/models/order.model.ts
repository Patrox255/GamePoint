import { IAdditionalContactInformation } from "./additionalContactInformation.model";
import { IMongooseDocument } from "./mongooseDocument.model";
import { IOrderItem } from "./orderItem.model";
import { IUser } from "./user.model";

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
export type orderPossibleStatus = (typeof orderPossibleStatuses)[number];

export const orderUserFriendlyStatusesMap = new Map<
  orderPossibleStatus,
  string
>([
  ...orderPossibleStatuses
    .slice(1)
    .map(
      (orderPossibleStatusesEntry) =>
        [
          orderPossibleStatusesEntry,
          orderPossibleStatusesEntry.replace(
            orderPossibleStatusesEntry[0],
            orderPossibleStatusesEntry[0].toUpperCase()
          ),
        ] as [orderPossibleStatus, string]
    ),
  [orderPossibleStatuses[0], "Waiting for payment"],
]);

export interface IOrder extends IMongooseDocument {
  items: IOrderItem[];
  date: Date;
  status: orderPossibleStatus;
  orderContactInformation: IAdditionalContactInformation;
  totalValue: number;
  userId?: string | IUser;
}
