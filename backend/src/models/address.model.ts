import mongoose, { Schema } from "mongoose";

interface IAddress extends Document {
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

const AddressSchema = new Schema({
  firstName: { type: String, required: true },
  surname: { type: String, required: true },
  street: { type: String, required: true },
  houseNr: { type: String, required: true },
  flatNr: { type: String },
  postalCode: { type: String, required: true },
  city: { type: String, required: true },
  phoneNr: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Address = mongoose.model<IAddress>("Address", AddressSchema);

export default Address;
