import { IMongooseDocument } from "./mongooseDocument.model";

export interface IDeveloper extends IMongooseDocument {
  name: string;
}
