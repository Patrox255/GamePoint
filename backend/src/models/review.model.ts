import mongoose, { Schema } from "mongoose";

interface IReview extends Document {
  userId: string;
  gameId: string;
  rating: number;
  content: string;
}

const ReviewSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true },
  rating: { type: Number, required: true },
  content: { type: String, required: true },
});

const Review = mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
