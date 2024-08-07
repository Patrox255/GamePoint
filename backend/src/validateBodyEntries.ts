import {
  emailRegex,
  firstAndLastNameValidateFn,
  IBodyFromRequestToValidate,
  IValidateBodyEntry,
  properDateFromInputTypeDateRegex,
  stringFollowsRegex,
  validatePasswordFn,
  zipCodeRegex,
} from "./validateBodyFn";

export interface ILoginBodyFromRequest extends IBodyFromRequestToValidate {
  login: string;
  password: string;
  cart?: receivedCart;
}

export const cartDataEntry: IValidateBodyEntry<ILoginBodyFromRequest> = {
  name: "cart",
  requestBodyName: "cart",
  type: "array",
  optional: true, // to allow an empty array
};

export const loginBodyEntries: IValidateBodyEntry<ILoginBodyFromRequest>[] = [
  {
    name: "Login",
    type: "string",
    requestBodyName: "login",
  },
  {
    name: "Password",
    type: "string",
    requestBodyName: "password",
    validateFn: validatePasswordFn,
  },
];

export const loginBodyEntriesWithCart: IValidateBodyEntry<ILoginBodyFromRequest>[] =
  [...loginBodyEntries, cartDataEntry];

export interface IRegisterBodyFromRequest extends ILoginBodyFromRequest {
  confirmedPassword: string;
  email: string;
  expandedContactInformation?: string;
  firstName: string;
  surName: string;
  dateOfBirth: string;
  phoneNr: string;
  country: string;
  zipCode: string;
  city: string;
  street: string;
  house: string;
  flat?: string;
}

type IRegisterBodyEntriesForValidation =
  IValidateBodyEntry<IRegisterBodyFromRequest>[];

export const registerBodyEntries: IRegisterBodyEntriesForValidation = (() => {
  const newBodyEntries: IRegisterBodyEntriesForValidation = [
    {
      ...loginBodyEntries[1],
      name: "Confirmed password",
      requestBodyName: "confirmedPassword",
      validateFn: (val, name, otherEntries) => {
        const validatePasswordRes = validatePasswordFn(val as string, name);
        if (validatePasswordRes !== true) return validatePasswordRes;
        const compareConfirmedPasswordToNormalRes = val ===
          otherEntries!.find(
            (registerBodyEntry) =>
              registerBodyEntry.requestBodyName === "password"
          )!.value || { message: "Provided passwords are not equal!" };
        if (compareConfirmedPasswordToNormalRes !== true)
          return compareConfirmedPasswordToNormalRes;
        return true;
      },
    },
    {
      name: "E-mail address",
      requestBodyName: "email",
      type: "string",
      validateFn: (val, name) =>
        stringFollowsRegex({
          val: val as string,
          strNameForErrorGeneration: name,
          regex: emailRegex,
        }),
    },
    {
      name: "Date of birth",
      requestBodyName: "dateOfBirth",
      type: "string",
      validateFn: (val, name) =>
        stringFollowsRegex({
          val: val as string,
          strNameForErrorGeneration: name,
          regex: properDateFromInputTypeDateRegex,
        }),
    },
    {
      name: "Phone number",
      requestBodyName: "phoneNr",
      type: "string",
    },
    { name: "Country name", requestBodyName: "country", type: "string" },
    {
      name: "Zip code",
      requestBodyName: "zipCode",
      type: "string",
      validateFn: (val, name) =>
        stringFollowsRegex({
          val: val as string,
          strNameForErrorGeneration: name,
          regex: zipCodeRegex,
        }),
    },
    { name: "City name", requestBodyName: "city", type: "string" },
    {
      name: "Street name",
      requestBodyName: "street",
      type: "string",
    },
    { name: "House number", requestBodyName: "house", type: "string" },
    {
      name: "Flat number",
      requestBodyName: "flat",
      type: "string",
      optional: true,
    },
  ];
  const firstAndLastNameBodyEntries: IRegisterBodyEntriesForValidation = [
    {
      name: "First name",
      requestBodyName: "firstName",
      type: "string",
    },
    { name: "Surname", requestBodyName: "surName", type: "string" },
  ].map((registerBodyEntry) => ({
    ...registerBodyEntry,
    validateFn: (val, name) => firstAndLastNameValidateFn(val, name),
  }));

  return [
    ...loginBodyEntries,
    ...newBodyEntries,
    ...firstAndLastNameBodyEntries,
  ] as unknown as IRegisterBodyEntriesForValidation;
})();

// Had to do such things in order to correctly merge loginBodyEntries into registerBodyEntries without losing proper
// type inference

interface IVerifyEmailEntriesFromRequest extends IBodyFromRequestToValidate {
  uId: string;
  providedRegistrationCode: string;
  registrationCode: string;
}

export const verifyEmailEntries: IValidateBodyEntry<IVerifyEmailEntriesFromRequest>[] =
  [
    {
      name: "User identificator",
      requestBodyName: "uId",
      type: "string",
    },
    {
      name: "Provided registration code",
      requestBodyName: "providedRegistrationCode",
      type: "string",
    },
    {
      name: "Simulated registration code which realistically would be received by an e-mail",
      requestBodyName: "registrationCode",
      type: "string",
    },
  ];

export type receivedCart = { id: string; quantity: number }[];

export interface ICartDataEntriesFromRequest
  extends IBodyFromRequestToValidate {
  cart: receivedCart;
}

export const cartDataEntries: IValidateBodyEntry<ICartDataEntriesFromRequest>[] =
  [cartDataEntry as unknown as IValidateBodyEntry<ICartDataEntriesFromRequest>];

type criteriaArr = {
  criterionName: string;
  rating: number | null;
}[];

export interface IAddReviewEntriesFromRequest
  extends IBodyFromRequestToValidate {
  criteria: criteriaArr;
  reviewContent: string;
  gameId: string;
}

export const addReviewEntries: IValidateBodyEntry<IAddReviewEntriesFromRequest>[] =
  [
    {
      name: "Review criteria",
      requestBodyName: "criteria",
      type: "array",
      validateFn: (criteria) =>
        (criteria as criteriaArr).every(
          (criterion) =>
            criterion.criterionName !== "" && criterion.rating !== null
        ) || {
          message: "Please fill every added criterion with appropriate data!",
        },
    },
    {
      name: "Review description",
      requestBodyName: "reviewContent",
      type: "string",
    },
    { name: "Game", requestBodyName: "gameId", type: "string" },
  ];

export interface IRemoveReviewEntriesFromRequest
  extends IBodyFromRequestToValidate {
  reviewId: string;
}

export const removeReviewEntries: IValidateBodyEntry<IRemoveReviewEntriesFromRequest>[] =
  [
    {
      type: "string",
      requestBodyName: "reviewId",
      name: "Identificator of your review",
    },
  ];
