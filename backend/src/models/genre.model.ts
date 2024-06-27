import mongoose, { Schema } from "mongoose";

export interface IGenre {
  name: string;
}

const GenreSchema = new Schema<IGenre>({
  name: { type: String, required: true },
});

const Genre = mongoose.model<IGenre>("Genre", GenreSchema);
export default Genre;
