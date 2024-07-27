import mongoose from "mongoose";
import { accessEnvironmentVariable } from "./app";

export const connectDB = async () => {
  const MONGO_URL = accessEnvironmentVariable("MONGO_URL");
  await mongoose.connect(MONGO_URL);
};
