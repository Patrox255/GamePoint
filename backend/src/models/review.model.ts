import mongoose, { Schema, Types } from "mongoose";

export interface IReviewCriterion {
  criterionName: string;
  rating: number;
}

export interface IReview {
  userId: Types.ObjectId;
  criteria: IReviewCriterion[];
  content: string;
  date?: Date;
  likes?: number;
}

const ReviewCriterionSchema: Schema = new Schema({
  criterionName: { type: String, required: true },
  rating: { type: Number, required: true },
});

const ReviewSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  criteria: [ReviewCriterionSchema],
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
});

const Review = mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
