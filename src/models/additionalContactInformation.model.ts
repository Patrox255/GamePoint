import { IMongooseDocument } from "./mongooseDocument.model";

export interface IAdditionalContactInformationFrontEnd {
  firstName: string;
  surName: string;
  dateOfBirth: Date;
  phoneNr: string;
  country: string;
  zipCode: string;
  city: string;
  street: string;
  house: string;
  flat?: string;
}

export interface IAdditionalContactInformation
  extends IAdditionalContactInformationFrontEnd,
    IMongooseDocument {}
