import mongoose, { Schema } from "mongoose";

export interface IRefreshToken {
  content: string;
}

const RefreshTokenSchema = new Schema({
  content: { type: String, required: true },
});

const RefreshToken = mongoose.model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema
);

export default RefreshToken;
