export interface IUser extends Document {
  login: string;
  password: string;
  email: string;
}
