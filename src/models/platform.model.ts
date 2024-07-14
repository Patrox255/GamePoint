import { IMongooseDocument } from "./mongooseDocument.model";

export interface IPlatform extends IMongooseDocument {
  name: string;
}
