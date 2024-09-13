import { IFormInputField } from "../components/UI/FormWithErrorHandling";
import {
  changeObjectKeysPrefix,
  changeStrPrefix,
} from "../helpers/changeStrPrefix";

type inputFieldsNames =
  | "login"
  | "password"
  | "email"
  | "confirmedPassword"
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

export type IInputFieldsObjsGenerator<T extends string> = Record<
  T,
  IFormInputField
>;
export type IInputFieldsObjs = IInputFieldsObjsGenerator<inputFieldsNames>;

const inputFieldsObjs: IInputFieldsObjs = {
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
  confirmedPassword: {
    name: "confirmedPassword",
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
      pattern: "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z0-9]+$",
    },
    propertyNameToDisplay: "E-mail address",
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
    propertyNameToDisplay: "First name",
  },
  surName: {
    name: "surName",
    placeholder: "Enter your last name",
    otherValidationAttributes: {
      required: true,
      pattern: firstAndLastNamePattern,
    },
    propertyNameToDisplay: "Surname",
  },
  dateOfBirth: {
    name: "dateOfBirth",
    placeholder: "Select your date of birth",
    otherValidationAttributes: { required: true },
    type: "date",
    propertyNameToDisplay: "Date of birth",
  },
  country: {
    name: "country",
    placeholder: "Select your country",
    otherValidationAttributes: { required: true },
    renderLabel: true,
    type: "select",
    propertyNameToDisplay: "Country",
  },
  zipCode: {
    name: "zipCode",
    placeholder: "Enter your zip code",
    otherValidationAttributes: {
      required: true,
      pattern: "^[A-Za-z0-9\\- ]{2,15}$",
    },
    propertyNameToDisplay: "Zip code",
  },
  city: {
    name: "city",
    placeholder: "Enter your city name",
    otherValidationAttributes: { required: true },
    propertyNameToDisplay: "City",
  },
  street: {
    name: "street",
    placeholder: "Enter your street name",
    otherValidationAttributes: { required: true },
    propertyNameToDisplay: "Street",
  },
  house: {
    name: "house",
    placeholder: "Enter your house number",
    otherValidationAttributes: { required: true },
    renderPlaceholderInTheLabel: false,
    propertyNameToDisplay: "House number",
  },
  flat: {
    name: "flat",
    placeholder: "Enter your flat number",
    renderLabel: false,
    propertyNameToDisplay: "Flat number",
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
    propertyNameToDisplay: "Phone number",
  },
};

export type existingProductManagementInputFieldsNames =
  | "existingProductTitle"
  | "existingProductSummary"
  | "existingProductStoryLine";
export type IExistingProductManagementInputFieldsObjs =
  IInputFieldsObjsGenerator<existingProductManagementInputFieldsNames>;
export const existingProductManagementInputFieldsObjs: IExistingProductManagementInputFieldsObjs =
  {
    existingProductTitle: {
      name: "existingProductTitle",
      placeholder: "Enter selected product title",
      otherValidationAttributes: {
        required: true,
      },
    },
    existingProductStoryLine: {
      name: "existingProductStoryLine",
      placeholder: "Enter selected product story",
      type: "textarea",
      otherValidationAttributes: { required: true },
    },
    existingProductSummary: {
      name: "existingProductSummary",
      placeholder: "Enter selected product summary",
      type: "textarea",
      otherValidationAttributes: { required: true },
    },
  };

type newProductManagementInputFieldsNames = changeStrPrefix<
  existingProductManagementInputFieldsNames,
  "existing",
  "new"
>;
export type INewProductManagementInputFieldsObjs =
  IInputFieldsObjsGenerator<newProductManagementInputFieldsNames>;
export const newProductManagementInputFieldsObjs: INewProductManagementInputFieldsObjs =
  changeObjectKeysPrefix(
    existingProductManagementInputFieldsObjs,
    "existing",
    "new",
    true,
    (existingProductManagementInputFieldsObjsEntryValue) => ({
      ...existingProductManagementInputFieldsObjsEntryValue,
      name: existingProductManagementInputFieldsObjsEntryValue.name.replace(
        "existing",
        "new"
      ),
      placeholder:
        existingProductManagementInputFieldsObjsEntryValue.placeholder?.replace(
          "selected",
          "new"
        ),
    })
  ) as INewProductManagementInputFieldsObjs;
export default inputFieldsObjs;
