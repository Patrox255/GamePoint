import mongoose, { Schema, Types } from "mongoose";
import slugify from "slugify";

export interface IGame {
  title: string;
  price: number;
  discount: number;
  releaseDate: Date;
  genres: Types.ObjectId[];
  platforms: Types.ObjectId[];
  developer?: Types.ObjectId;
  publisher?: Types.ObjectId;
  popularity?: number;
  artworks?: string[];
  summary: string;
  finalPrice?: number;
  slug?: string;
  storyLine?: string;
}

const GameSchema = new Schema<IGame>({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  genres: [{ type: Schema.Types.ObjectId, ref: "Genre", required: true }],
  releaseDate: { type: Date },
  platforms: [{ type: Schema.Types.ObjectId, ref: "Platform", required: true }],
  developer: { type: Schema.Types.ObjectId, ref: "Developer" },
  publisher: { type: Schema.Types.ObjectId, ref: "Publisher" },
  popularity: { type: Number, default: 0 },
  artworks: [{ type: String, required: true }],
  summary: { type: String, required: true },
  finalPrice: { type: Number },
  slug: { type: String },
  storyLine: { type: String },
});

GameSchema.pre("save", function (next) {
  this.finalPrice = Math.trunc(this.price * (100 - this.discount)) / 100;
  this.slug = slugify(this.title, { lower: true });
  next();
});

GameSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as {
    price?: number;
    discount?: number;
    finalPrice?: number;
    title?: string;
    slug?: string;
  };
  const docToUpdate = (await this.model.findOne(this.getQuery())) as IGame;
  const price = update.price ? update.price : docToUpdate.price;
  const discount = update.discount ? update.discount : docToUpdate.discount;
  update.finalPrice = Math.trunc(price * (100 - discount)) / 100;
  update.slug = update.title
    ? slugify(update.title, { lower: true })
    : docToUpdate.slug;

  next();
});

const Game = mongoose.model<IGame>("Game", GameSchema);

export default Game;
