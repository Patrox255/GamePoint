import mongoose, { Schema } from "mongoose";

export interface IUser {
  login: string;
  password: string;
  email: string;
  isAdmin?: boolean;
}

const UserSchema = new Schema({
  login: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
