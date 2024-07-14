import { IMongooseDocument } from "./mongooseDocument.model";

export interface IGenre extends IMongooseDocument {
  name: string;
}
