import mongoose, { Schema } from "mongoose";

export interface IPublisher {
  name: string;
}

const PublisherSchema = new Schema<IPublisher>({
  name: { type: String, required: true },
});
const Publisher = mongoose.model<IPublisher>("Publisher", PublisherSchema);
export default Publisher;
