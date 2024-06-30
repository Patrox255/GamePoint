export interface IAddress extends Document {
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
