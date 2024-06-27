import mongoose, { Schema } from "mongoose";

export interface IDeveloper {
  name: string;
}

const DeveloperSchema = new Schema<IDeveloper>({
  name: { type: String, required: true },
});

const Developer = mongoose.model<IDeveloper>("Developer", DeveloperSchema);
export default Developer;
