import { IAdditionalContactInformation } from "./additionalContactInformation.model";
import { IGame } from "./game.model";
import { IMongooseDocument } from "./mongooseDocument.model";
import { IOrder } from "./order.model";

interface ICartItemBase<id> {
  id: id;
  quantity: number;
}

export interface ICartItem extends ICartItemBase<string> {}

export interface ICartItemPopulated extends ICartItemBase<IGame> {}

type userActiveAddiitionalContactInformation = string | null;
interface IUserBase<additionalContactInformation, cart, orders>
  extends IMongooseDocument {
  login: string;
  password: string;
  email: string;
  isAdmin?: boolean;
  emailVerified?: boolean;
  activeAdditionalContactInformation?: userActiveAddiitionalContactInformation;
  additionalContactInformation?: additionalContactInformation;
  cart?: cart;
  orders?: orders;
}
export interface IUser extends IUserBase<string[], ICartItem[], string[]> {}

export interface IUserPopulated
  extends IUserBase<
    IAdditionalContactInformation[],
    ICartItemPopulated[],
    IOrder[]
  > {}
