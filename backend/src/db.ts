import mongoose from "mongoose";
import { MONGO_URL } from "./secret";

export const connectDB = async () => {
  await mongoose.connect(MONGO_URL);
};
