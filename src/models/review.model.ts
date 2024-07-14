import { IMongooseDocument } from "./mongooseDocument.model";

export interface IReview extends IMongooseDocument {
  userId: string;
  gameId: string;
  rating: number;
  content: string;
}
