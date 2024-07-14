import { IMongooseDocument } from "./mongooseDocument.model";

export interface IAddress extends IMongooseDocument {
  firstName: string;
  surname: string;
  street: string;
  houseNr: string;
  flatNr?: string;
  postalCode: string;
  city: string;
  phoneNr: string;
  userId: string;
}
