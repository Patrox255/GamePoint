import mongoose, { Schema, UpdateQuery } from "mongoose";

export interface ICartItem {
  id: mongoose.Types.ObjectId;
  quantity: number;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      unique: true,
    },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

export interface IUser {
  login: string;
  password: string;
  email: string;
  isAdmin?: boolean;
  emailVerified?: boolean;
  additionalContactInformation?: mongoose.Types.ObjectId[];
  activeAdditionalContactInformation?: mongoose.Types.ObjectId;
  cart?: ICartItem[];
}

const UserSchema = new Schema<IUser>({
  login: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  additionalContactInformation: [
    {
      type: Schema.Types.ObjectId,
      ref: "AdditionalContactInformation",
      default: [],
    },
  ],
  activeAdditionalContactInformation: {
    type: Schema.Types.ObjectId,
    ref: "AdditionalContactInformation",
  },
  cart: [
    {
      type: CartItemSchema,
      default: [],
    },
  ],
});

UserSchema.pre("updateOne", function (next) {
  const updateData = this.getUpdate() as UpdateQuery<IUser>;
  const cart = updateData?.cart;
  if (!cart) return next();
  const gameIds = (cart as ICartItem[]).map((cartEntry) =>
    cartEntry.id.toString()
  );
  if (new Set(gameIds).size !== gameIds!.length)
    return next(new Error("Some of the games in the cart array are repeated!"));
  next();
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
