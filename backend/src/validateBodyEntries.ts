import { isValidObjectId } from "mongoose";
import { IAdditionalContactInformationWithoutDateOfBirth } from "./models/additionalContactInformation.model";
import {
  IGame,
  IGameInformationBasicPart,
  IProductPriceInformation,
} from "./models/game.model";
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
import {
  availableTagsIdentificatorsToMongooseModelsMap,
  bodyEntryValidMongooseObjectIdValidateFn,
  tryToTransformOrderUserFriendlyStatusToItsDatabaseVersion,
} from "./helpers";

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

export const cartDataEntriesWithRequiredCartData: IValidateBodyEntry<ICartDataEntriesFromRequest>[] =
  [
    {
      ...cartDataEntry,
      optional: false,
    } as unknown as IValidateBodyEntry<ICartDataEntriesFromRequest>,
  ];

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
    {
      name: "Game",
      requestBodyName: "gameId",
      type: "string",
      validateFn: bodyEntryValidMongooseObjectIdValidateFn,
    },
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
      validateFn: bodyEntryValidMongooseObjectIdValidateFn,
    },
  ];

export interface IRetrieveOrModifyContactInformationCustomUserInformation
  extends IBodyFromRequestToValidate {
  customUserId?: string;
  customUserLogin?: string;
}

export const retrieveOrModifyContactInformationCustomUserInformationEntries: IValidateBodyEntry<IRetrieveOrModifyContactInformationCustomUserInformation>[] =
  [
    {
      requestBodyName: "customUserId",
      type: "string",
      name: "Your selected user's identificator",
      optional: true,
      validateFn: bodyEntryValidMongooseObjectIdValidateFn,
    },
    {
      requestBodyName: "customUserLogin",
      type: "string",
      name: "Your selected user's login",
      optional: true,
    },
  ];

export interface IRetrieveUserContactInformationPossibleBodyFromRequest
  extends IBodyFromRequestToValidate,
    IRetrieveOrModifyContactInformationCustomUserInformation {}

export const retrieveUserContactInformationEntries: IValidateBodyEntry<IRetrieveUserContactInformationPossibleBodyFromRequest>[] =
  retrieveOrModifyContactInformationCustomUserInformationEntries;

export interface IChangeActiveContactInformationEntriesFromRequest
  extends IRetrieveOrModifyContactInformationCustomUserInformation {
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
    ...(retrieveOrModifyContactInformationCustomUserInformationEntries as unknown as IValidateBodyEntry<IChangeActiveContactInformationEntriesFromRequest>[]),
  ];

export interface IModifyOrAddContactInformationEntriesFromRequest
  extends IRetrieveOrModifyContactInformationCustomUserInformation {
  newContactInformation: IContactInformationEntriesFromRequest;
  updateContactInformationId?: string;
}

export const modifyOrAddContactInformationValidationEntries: IValidateBodyEntry<IContactInformationEntriesFromRequest>[] =
  [...contactInformationEntries];

export interface IOrderDataFromRequestOrderedGamesDetails
  extends IBodyFromRequestToValidate {
  orderedGamesDetails: receivedGameDetailsEntries;
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
      validateFn: bodyEntryValidMongooseObjectIdValidateFn,
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

export type IReceivedGameDetailsEntry = IGame & {
  quantity: number;
  _id: string;
};
export type receivedGameDetailsEntries = IReceivedGameDetailsEntry[];
export interface IModifyOrderBodyFromRequest
  extends IBodyFromRequestToValidate {
  orderId: string;
  newStatus?: string;
  newUserContactInformationEntryId?: string;
  ordererLoginToDeterminePossibleContactInformationEntries?: string;
  modifiedCartItems?: receivedGameDetailsEntries;
}

export const modifyOrderEntries: IValidateBodyEntry<IModifyOrderBodyFromRequest>[] =
  [
    {
      name: "New status",
      requestBodyName: "newStatus",
      type: "string",
      validateFn: (value) => {
        const mappingResult =
          tryToTransformOrderUserFriendlyStatusToItsDatabaseVersion(
            value as string
          );
        if (typeof mappingResult === "object") return mappingResult;
        return true;
      },
      inputNameOtherThanVisibleNameToSetAppropriateValidationErrorInputName:
        "orderStatusChange",
      optional: true,
    },
    {
      name: "New contact details entry",
      requestBodyName: "newUserContactInformationEntryId",
      type: "string",
      validateFn: bodyEntryValidMongooseObjectIdValidateFn,
      optional: true,
    },
    {
      name: "Orderer's login",
      requestBodyName:
        "ordererLoginToDeterminePossibleContactInformationEntries",
      type: "string",
      optional: true,
    },
    {
      name: "Modified cart items",
      requestBodyName: "modifiedCartItems",
      type: "object",
      validateFn: (val, name) =>
        (val as receivedGameDetailsEntries).every((gameWithQuantity) =>
          isValidObjectId(gameWithQuantity._id)
        ) || { message: `${name} are not valid!` },
      optional: true,
    },
  ];

export interface IRetrieveUserDataByAdminBodyFromRequest
  extends IBodyFromRequestToValidate {
  userLogin: string;
}

export const retrieveUserDataByAdminEntries: IValidateBodyEntry<IRetrieveUserDataByAdminBodyFromRequest>[] =
  [
    {
      ...loginBodyEntries[0],
      requestBodyName: "userLogin",
    } as unknown as IValidateBodyEntry<IRetrieveUserDataByAdminBodyFromRequest>,
  ];

export interface IModifyUserDataBodyFromRequest
  extends IBodyFromRequestToValidate {
  userLogin: string;
  login?: string;
  email?: string;
  mode?: "emailVerification" | "admin";
}

export const modifyUserDataEntries: IValidateBodyEntry<IModifyUserDataBodyFromRequest>[] =
  [
    {
      ...loginBodyEntries[0],
      requestBodyName: "userLogin",
    } as IValidateBodyEntry<IModifyUserDataBodyFromRequest>,
    {
      ...loginBodyEntries[0],
      optional: true,
    } as unknown as IValidateBodyEntry<IModifyUserDataBodyFromRequest>,
    {
      ...registerBodyEntries.find(
        (registerBodyEntry) => registerBodyEntry.requestBodyName === "email"
      ),
      optional: true,
    } as unknown as IValidateBodyEntry<IModifyUserDataBodyFromRequest>,
    {
      requestBodyName: "mode",
      name: "Selected modification type",
      type: "string",
      optional: true,
      validateFn: (mode) =>
        ["emailVerification", "admin"].includes(mode as string) || {
          message: "Unknown modification type selected!",
        },
    },
  ];

export interface IAddProductTagBodyFromRequest
  extends IBodyFromRequestToValidate {
  tagId: string;
  tagName: string;
}

export const addProductTagEntries: IValidateBodyEntry<IAddProductTagBodyFromRequest>[] =
  [
    {
      name: "Tag identificator",
      requestBodyName: "tagId",
      type: "string",
      validateFn: (tagId) =>
        (tagId as string) in availableTagsIdentificatorsToMongooseModelsMap || {
          message: "Unknown tag type provided!",
        },
    },
    { name: "New tag name", requestBodyName: "tagName", type: "string" },
  ];

export type IGameInformationSentByAdmin = IGameInformationBasicPart<string> & {
  productId?: string;
  priceManagement?: IProductPriceInformation;
  developers?: string[];
  publishers?: string[];
  // Only because of the mechanics of tags hook which only stores selected tags in arrays and therefore in order not to
  // play with data flow that much I will receive these properties also as raw data from front end
};
interface IProductsManagementBody extends IGameInformationSentByAdmin {
  artworks?: { url: string; custom: boolean; fileName?: string }[];
}
export interface IProductsManagementBodyFromRequest
  extends IBodyFromRequestToValidate,
    IProductsManagementBody {}

type productsManagementEntry =
  IValidateBodyEntry<IProductsManagementBodyFromRequest>;
const defaultProductsManagementEntriesValue = {
  type: "string",
  optional: true,
} as unknown as productsManagementEntry;
export const productsManagementEntries: productsManagementEntry[] = [
  {
    ...defaultProductsManagementEntriesValue,
    name: "Product title",
    requestBodyName: "title",
  },
  {
    ...defaultProductsManagementEntriesValue,
    name: "Product summary",
    requestBodyName: "summary",
  },
  {
    ...defaultProductsManagementEntriesValue,
    name: "Product story line",
    requestBodyName: "storyLine",
  },
  {
    ...defaultProductsManagementEntriesValue,
    name: "Product summary",
    requestBodyName: "summary",
  },
  {
    ...defaultProductsManagementEntriesValue,
    name: "Product developer",
    requestBodyName: "developers",
    type: "array",
  },
  {
    ...defaultProductsManagementEntriesValue,
    name: "Product genres",
    requestBodyName: "genres",
    type: "array",
  },
  {
    ...defaultProductsManagementEntriesValue,
    name: "Product platforms",
    requestBodyName: "platforms",
    type: "array",
  },
  {
    ...defaultProductsManagementEntriesValue,
    name: "Product publishers",
    requestBodyName: "publishers",
    type: "array",
  },
  {
    ...defaultProductsManagementEntriesValue,
    name: "Product price management",
    requestBodyName: "priceManagement",
    type: "object",
    validateFn: (priceManagement) =>
      ("price" in (priceManagement as object) &&
        "discount" in (priceManagement as object)) || {
        message: "You have set the price management information improperly",
      },
  },
  {
    ...defaultProductsManagementEntriesValue,
    name: "Product identificator",
    requestBodyName: "productId",
    validateFn: bodyEntryValidMongooseObjectIdValidateFn,
  },
  {
    ...defaultProductsManagementEntriesValue,
    name: "Product release date",
    requestBodyName: "releaseDate",
    validateFn: (val, name) =>
      stringFollowsRegex({
        regex: properDateFromInputTypeDateRegex,
        val: val as string,
        strNameForErrorGeneration: name,
      }),
  },
  {
    ...defaultProductsManagementEntriesValue,
    type: "array",
    name: "Product artworks",
    requestBodyName: "artworks",
  },
];

const productManagementNonRequiredEntriesWhenAddingANewProduct: (keyof IProductsManagementBody)[] =
  ["artworks", "developers", "publishers", "productId"];
export const productManagementRequiredEntriesWhenAddingANewProduct: IValidateBodyEntry<IProductsManagementBodyFromRequest>[] =
  productsManagementEntries
    .filter(
      (productManagementEntry) =>
        !productManagementNonRequiredEntriesWhenAddingANewProduct.includes(
          productManagementEntry.requestBodyName as keyof IProductsManagementBody
        )
    )
    .map((productsManagementEntry) => ({
      ...productsManagementEntry,
      optional: false,
    }));
