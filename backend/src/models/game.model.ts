import mongoose, { Schema, Types } from "mongoose";

interface IGame extends Document {
  title: string;
  price: number;
  discount?: number;
  releaseDate: Date;
  genre: string[];
  platforms: Types.ObjectId[];
  producer: string;
  publisher: string;
}

const GameSchema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number },
  genre: [{ type: String, required: true }],
  releaseDate: { type: Date, required: true },
  platforms: [{ type: Schema.Types.ObjectId, ref: "Platform", required: true }],
});

const Game = mongoose.model<IGame>("Game", GameSchema);

export default Game;
