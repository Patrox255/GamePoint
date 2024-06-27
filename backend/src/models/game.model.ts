import mongoose, { Schema, Types } from "mongoose";

export interface IGame {
  title: string;
  price: number;
  discount?: number;
  releaseDate: Date;
  genres: Types.ObjectId[];
  platforms: Types.ObjectId[];
  developer?: Types.ObjectId;
  publisher?: Types.ObjectId;
}

const GameSchema = new Schema<IGame>({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number },
  genres: [{ type: Schema.Types.ObjectId, ref: "Genre", required: true }],
  releaseDate: { type: Date },
  platforms: [{ type: Schema.Types.ObjectId, ref: "Platform", required: true }],
  developer: { type: Schema.Types.ObjectId, ref: "Developer" },
  publisher: { type: Schema.Types.ObjectId, ref: "Publisher" },
});

const Game = mongoose.model<IGame>("Game", GameSchema);

export default Game;
