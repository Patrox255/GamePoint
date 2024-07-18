import { IUser } from "./user.model";

export interface IReviewCriterion {
  criterionName: string;
  rating: number;
}

export interface IReview {
  userId: IUser;
  criteria: IReviewCriterion[];
  content: string;
  likes: number;
  date: Date;
}
