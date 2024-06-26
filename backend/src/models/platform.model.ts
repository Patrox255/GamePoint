import mongoose, { Schema } from "mongoose";

interface Platform extends Document {
  name: string;
}

const PlatformSchema = new Schema({
  name: { type: String, required: true },
});

const Platform = mongoose.model("Platform", PlatformSchema);
export default Platform;
