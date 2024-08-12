import { model, Schema } from "mongoose";

export interface IAdditionalContactInformationWithoutDateOfBirth {
  firstName: string;
  surName: string;
  phoneNr: string;
  country: string;
  zipCode: string;
  city: string;
  street: string;
  house: string;
  flat?: string;
}

export interface IAdditionalContactInformation
  extends IAdditionalContactInformationWithoutDateOfBirth {
  dateOfBirth: Date;
}

const AdditionalContactInformationSchema =
  new Schema<IAdditionalContactInformation>({
    firstName: { type: String, required: true },
    surName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    phoneNr: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    house: { type: String, required: true },
    flat: { type: String },
  });

const AdditionalContactInformation = model<IAdditionalContactInformation>(
  "AdditionalContactInformation",
  AdditionalContactInformationSchema
);
export default AdditionalContactInformation;
