import mongoose, { Schema } from "mongoose";

interface IUser extends Document {
  login: string;
  password: string;
  email: string;
}

const UserSchema = new Schema({
  login: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
