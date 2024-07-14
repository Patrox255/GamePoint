import { IMongooseDocument } from "./mongooseDocument.model";

export interface IUser extends IMongooseDocument {
  login: string;
  password: string;
  email: string;
}
