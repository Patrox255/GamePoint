import { IMongooseDocument } from "./mongooseDocument.model";

export interface IPublisher extends IMongooseDocument {
  name: string;
}
