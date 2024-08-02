import mongoose, { Schema } from "mongoose";

export interface IUser {
  login: string;
  password: string;
  email: string;
  isAdmin?: boolean;
  emailVerified?: boolean;
  additionalContactInformation?: mongoose.Types.ObjectId[];
  activeAdditionalContactInformation?: mongoose.Types.ObjectId;
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
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
