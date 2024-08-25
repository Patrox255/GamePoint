import mongoose, { isValidObjectId } from "mongoose";
import { IAdditionalContactInformationWithoutDateOfBirth } from "./models/additionalContactInformation.model";
import { IGame } from "./models/game.model";
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

export interface IContactInformationEntriesFromRequest
  extends IAdditionalContactInformationWithoutDateOfBirth,
    IBodyFromRequestToValidate {
  dateOfBirth: string;
}

type IContactInformationEntriesForValidation =
  IValidateBodyEntry<IContactInformationEntriesFromRequest>[];

export const contactInformationEntries: IValidateBodyEntry<IContactInformationEntriesFromRequest>[] =
  (() => {
    const addressEntries: IContactInformationEntriesForValidation = [
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
    const firstAndLastNameBodyEntries: IContactInformationEntriesForValidation =
      [
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

    return [...addressEntries, ...firstAndLastNameBodyEntries];
  })();

export interface IRegisterBodyFromRequest
  extends ILoginBodyFromRequest,
    IContactInformationEntriesFromRequest {
  confirmedPassword: string;
  email: string;
  expandedContactInformation?: string;
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
  ];

  return [
    ...loginBodyEntries,
    ...newBodyEntries,
    ...contactInformationEntries,
  ] as unknown as IRegisterBodyEntriesForValidation;
})();

// Had to do such things in order to correctly merge loginBodyEntries into registerBodyEntries without losing proper
// type inference

export interface IVerifyEmailEntriesFromRequest
  extends IBodyFromRequestToValidate {
  uId: string;
  providedRegistrationCode: string;
  registrationCode: string;
  cartData: receivedCart;
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
    {
      ...cartDataEntry,
      name: "Your current cart details",
      requestBodyName: "cartData",
    } as IValidateBodyEntry<IVerifyEmailEntriesFromRequest>,
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

export interface IChangeActiveContactInformationEntriesFromRequest
  extends IBodyFromRequestToValidate {
  newActiveAdditionalInformationEntryId: string;
}

export const changeActiveContactInformationEntries: IValidateBodyEntry<IChangeActiveContactInformationEntriesFromRequest>[] =
  [
    {
      name: "Identificator of your contact details entry",
      requestBodyName: "newActiveAdditionalInformationEntryId",
      type: "string",
      optional: true,
    },
  ];

export interface IModifyOrAddContactInformationEntriesFromRequest {
  newContactInformation: IContactInformationEntriesFromRequest;
  updateContactInformationId?: string;
}

export const modifyOrAddContactInformationValidationEntries: IValidateBodyEntry<IContactInformationEntriesFromRequest>[] =
  [...contactInformationEntries];

export interface IOrderDataFromRequestOrderedGamesDetails
  extends IBodyFromRequestToValidate {
  orderedGamesDetails: (IGame & {
    quantity: number;
    _id: mongoose.Types.ObjectId;
  })[];
}

export const orderedGamesEntries: IValidateBodyEntry<IOrderDataFromRequestOrderedGamesDetails>[] =
  [
    {
      type: "object",
      name: "Details of your ordered games",
      requestBodyName: "orderedGamesDetails",
    },
  ];

export interface IOrderDataFromRequestContactInformationForGuests
  extends IBodyFromRequestToValidate {
  contactInformationForGuests?: IContactInformationEntriesFromRequest & {
    email: string;
  };
}

type IContactInformationForGuestsEntry =
  IValidateBodyEntry<IOrderDataFromRequestContactInformationForGuests>;
type contactInformationForGuestsEntriesArr =
  IContactInformationForGuestsEntry[];
export const contactInformationForGuestsEntries: contactInformationForGuestsEntriesArr =
  [
    ...(contactInformationEntries as unknown as contactInformationForGuestsEntriesArr),
    registerBodyEntries.find(
      (registerBodyEntry) => registerBodyEntry.requestBodyName === "email"
    ) as unknown as IContactInformationForGuestsEntry,
  ];

export interface IOrderDataFromRequestContactInformationForLoggedUsers
  extends IBodyFromRequestToValidate {
  contactInformationForLoggedUsers?: IContactInformationEntriesFromRequest;
}

export interface IOrderDataFromRequest
  extends IOrderDataFromRequestOrderedGamesDetails,
    IOrderDataFromRequestContactInformationForGuests,
    IOrderDataFromRequestContactInformationForLoggedUsers {}

export interface ICheckOrderIdBodyFromRequest
  extends IBodyFromRequestToValidate {
  orderId: string;
}

export const checkOrderIdEntries: IValidateBodyEntry<ICheckOrderIdBodyFromRequest>[] =
  [
    {
      requestBodyName: "orderId",
      name: "Order identificator",
      type: "string",
      validateFn: (val) =>
        isValidObjectId(val)
          ? true
          : { message: "Provided order identificator isn't valid!" },
    },
  ];

export interface IRetrieveUsersBasedOnEmailOrLoginBodyFromRequest
  extends IBodyFromRequestToValidate {
  loginOrEmail: string;
}

export const retrieveUsersBasedOnEmailOrLoginEntries: IValidateBodyEntry<IRetrieveUsersBasedOnEmailOrLoginBodyFromRequest>[] =
  [
    {
      name: "Provided orderer's login or e-mail address",
      type: "string",
      requestBodyName: "loginOrEmail",
      inputNameOtherThanVisibleNameToSetAppropriateValidationErrorInputName:
        "orderFindingUser",
    },
  ];

export interface IRetrieveOrdersInAdminPanelBodyFromRequest
  extends IBodyFromRequestToValidate {
  orderId?: string;
  ordererLogin?: string;
}

export const retrieveOrdersInAdminPanelEntries: IValidateBodyEntry<IRetrieveOrdersInAdminPanelBodyFromRequest>[] =
  [
    {
      ...retrieveUsersBasedOnEmailOrLoginEntries[0],
      requestBodyName: "ordererLogin",
      optional: true,
    } as IValidateBodyEntry<IRetrieveOrdersInAdminPanelBodyFromRequest>,
    {
      name: "Provided order identificator",
      requestBodyName: "orderId",
      type: "string",
      optional: true,
      inputNameOtherThanVisibleNameToSetAppropriateValidationErrorInputName:
        "orderFindingOrderId",
    },
  ];
