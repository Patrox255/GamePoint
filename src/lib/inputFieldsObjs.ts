import { IFormInputField } from "../components/UI/FormWithErrorHandling";

type inputFieldsNames =
  | "login"
  | "password"
  | "email"
  | "confirmPassword"
  | "expandedContactInformation"
  | "firstName"
  | "surName"
  | "dateOfBirth"
  | "country"
  | "zipCode"
  | "city"
  | "street"
  | "house"
  | "flat"
  | "phoneNr";

const firstAndLastNamePattern = "^[a-zA-ZÀ-ÿ' -]+$";

const inputFieldsObjs: Record<inputFieldsNames, IFormInputField> = {
  login: {
    name: "login",
    placeholder: "Enter your account login",
    otherValidationAttributes: { required: true },
    renderLabel: false,
  },
  password: {
    name: "password",
    type: "password",
    placeholder: "Enter your account password",
    otherValidationAttributes: {
      required: true,
      minLength: 8,
      pattern: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W)(?=.*\\d)(?!.*\\s).+`,
    },
    instructionStr:
      "Your password should consist of at least 8 characters including at least one lowercase and uppercase character, one digit and a special symbol",
    renderLabel: false,
  },
  confirmPassword: {
    name: "confirmPassword",
    type: "password",
    placeholder: "Confirm your password by entering it once again",
    otherValidationAttributes: {
      required: true,
      minLength: 8,
    },
  },
  email: {
    name: "email",
    placeholder: "Enter your account e-mail address",
    otherValidationAttributes: {
      required: true,
      pattern: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z0-9]+$`,
    },
  },
  expandedContactInformation: {
    name: "expandedContactInformation",
    placeholder:
      "Include contact information so that You don't have to do this later before fullfilling your order",
    type: "checkbox",
  },
  firstName: {
    name: "firstName",
    placeholder: "Enter your first name",
    otherValidationAttributes: {
      required: true,
      pattern: firstAndLastNamePattern,
    },
  },
  surName: {
    name: "surName",
    placeholder: "Enter your last name",
    otherValidationAttributes: {
      required: true,
      pattern: firstAndLastNamePattern,
    },
  },
  dateOfBirth: {
    name: "dateOfBirth",
    placeholder: "Select your date of birth",
    otherValidationAttributes: { required: true },
    type: "date",
  },
  country: {
    name: "country",
    placeholder: "Select your country",
    otherValidationAttributes: { required: true },
    renderLabel: true,
    type: "select",
  },
  zipCode: {
    name: "zipCode",
    placeholder: "Enter your zip code",
    otherValidationAttributes: {
      required: true,
      pattern: "^[A-Za-z0-9\\- ]{2,15}$",
    },
  },
  city: {
    name: "city",
    placeholder: "Enter your city name",
    otherValidationAttributes: { required: true },
  },
  street: {
    name: "street",
    placeholder: "Enter your street name",
    otherValidationAttributes: { required: true },
  },
  house: {
    name: "house",
    placeholder: "Enter your house number",
    otherValidationAttributes: { required: true },
    renderPlaceholderInTheLabel: false,
  },
  flat: {
    name: "flat",
    placeholder: "Enter your flat number",
    renderLabel: false,
  },
  // Decided to omit using city, street, house and flat number regex as they are fairly unique for some countries
  // and it could possibly cause more harm than good
  phoneNr: {
    name: "phoneNr",
    placeholder: "Enter your phone number",
    otherValidationAttributes: {
      required: true,
      // I didn't specify a sophisticated pattern for validating phone numbers as they can be fairly different and realistically
      // we should validate them by sending appropriate validation messages to them
    },
  },
};

export default inputFieldsObjs;
