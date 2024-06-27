import mongoose, { Schema } from "mongoose";

export interface IPlatform {
  name: string;
}

const PlatformSchema = new Schema<IPlatform>({
  name: { type: String, required: true },
});

const Platform = mongoose.model<IPlatform>("Platform", PlatformSchema);
export default Platform;
