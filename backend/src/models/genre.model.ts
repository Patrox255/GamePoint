import mongoose, { Schema } from "mongoose";

interface IGenre extends Document {
  name: string;
}

const GenreSchema = new Schema({
  name: { type: String, required: true },
});

const Genre = mongoose.model<IGenre>("Genre", GenreSchema);
export default Genre;
