export interface IReview extends Document {
  userId: string;
  gameId: string;
  rating: number;
  content: string;
}
