import mongoose, { Types } from "mongoose";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { accessEnvironmentVariable } from "./app";
import { CorsOptions } from "cors";

export const getJSON = async (url: string, options: RequestInit = {}) => {
  const result = await fetch(url, options);
  const data = await result.json();
  return data;
};

export const sleep = (s: number) =>
  new Promise((resolve) => setTimeout(resolve, s * 1000));

export const dropCollectionsIfTheyExist = async (collections: string[]) => {
  for (const collection of collections) {
    const collInfo = await mongoose.connection.db
      .listCollections({
        name: collection,
      })
      .next();
    if (collInfo) {
      await mongoose.connection.dropCollection(collection);
    }
  }
};

export const createDocumentsOfObjsAndInsert = async <storedObjInterface>(
  objs: storedObjInterface[],
  model: mongoose.Model<storedObjInterface>
) => {
  // Here _id is going to be id of an individual document according to our mongoDB database
  // and default id will be related to id from the API and we will be able to change ids in individual games obj properties
  // to their equivalents according to our mongoDB database
  const newObjs: (storedObjInterface & {
    _id?: Types.ObjectId | undefined;
  })[] = objs.map((obj) => ({ ...obj, _id: undefined }));
  const documents = objs.map((obj) => new model(obj));
  newObjs.forEach((newObj, i: number) => {
    const correspondingDocument = documents[i];
    newObj._id = correspondingDocument._id as Types.ObjectId;
  });
  await Promise.all(documents.map(async (doc) => await doc.save()));
  return { documents, newObjs };
};

export const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const FRONTEND_URLS = accessEnvironmentVariable("FRONTEND_URLS");

const allowedOrigins = FRONTEND_URLS.split(",");

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1)
      return callback(null, true);
    return callback(new Error("Rejected by CORS policy"));
  },
  credentials: true,
};

export const parseQueries = async (
  req: Request,
  type: "query" | "params" = "query"
) => {
  return Object.fromEntries(
    [...Object.entries(req[type])].map((entry) => [
      entry[0],
      entry[1] ? JSON.parse(entry[1] as string) : undefined,
    ])
  );
};

export const validateQueriesTypes = async (queries: unknown[][]) => {
  queries.forEach((query) => {
    if (
      query[1] !== undefined &&
      ((query[0] === "array" && !Array.isArray(query[1])) ||
        (query[0] !== "array" && typeof query[1] !== query[0]))
    )
      throw "Invalid data provided";
  });
};

export const randomizeArrOrder = function <T extends unknown[]>(arr: T) {
  return arr.sort(() => (Math.random() < 0.5 ? 1 : -1));
};

export const generateRandomStr = (length: number, prefix: string = "") => {
  let str = prefix;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  str += Array.from({ length: length - prefix.length }, () =>
    random(0, characters.length - 1)
  ).reduce((str, random) => str + characters[random], "");
  return str;
};
export const generateUniqueRandomStrs = (
  amount: number,
  prefix: string = "",
  lengthArg: number | number[]
) => {
  const strs: string[] = [];
  for (let i = 0; i < amount; i++) {
    let randomStr = "";
    const length = Array.isArray(lengthArg)
      ? random(lengthArg[0], lengthArg[1])
      : lengthArg;
    do {
      randomStr = generateRandomStr(length, prefix);
    } while (strs.includes(randomStr));
    strs.push(randomStr);
  }
  return strs;
};

export const generateAndSaveAccessToken = (res: Response, userId: string) => {
  const JWTSECRET = accessEnvironmentVariable("JWTSECRET");
  const accessToken = jwt.sign({ userId }, JWTSECRET, {
    expiresIn: "5s",
  });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: 5000,
  });
  return accessToken;
};

interface IBodyFromRequestToValidate {
  [k: string]: string | undefined;
}

type bodyEntryValidateFn<T extends IBodyFromRequestToValidate> = (
  val: unknown,
  name: string,
  otherEntries?: (IValidateBodyEntry<T> & { value: unknown })[]
) => { message: string } | boolean;

export interface IValidateBodyEntry<T extends IBodyFromRequestToValidate> {
  type: string;
  name: keyof T;
  validateFn?: bodyEntryValidateFn<T>;
  optional?: boolean;
  requestBodyName: string;
}

const createBodyEntryErr = (errInputName: string, message: string) => ({
  message,
  errInputName,
});

export const validateBodyEntries = function <
  T extends IBodyFromRequestToValidate
>(entries: IValidateBodyEntry<T>[], request: Request) {
  const errors: { message: string }[] = [];
  const entriesWithValues = entries.map((entry) => ({
    ...entry,
    value: request.body[entry.requestBodyName],
  }));

  entriesWithValues.forEach((entry) => {
    const {
      type,
      name,
      validateFn,
      optional = false,
      requestBodyName,
      value,
    } = entry as typeof entry & { name: string };

    const createBodyEntryErrSuppliedWithInputName = createBodyEntryErr.bind(
      null,
      requestBodyName
    );

    if (typeof value !== type)
      errors.push(
        createBodyEntryErrSuppliedWithInputName(
          `Please write a correct ${name}`
        )
      );
    if (typeof value !== "object" && !optional && value === "")
      errors.push(
        createBodyEntryErrSuppliedWithInputName(`${name} can't be empty!`)
      );
    if (
      typeof value === "object" &&
      Array.isArray(value) &&
      value.length === 0 &&
      !optional
    )
      errors.push(
        createBodyEntryErrSuppliedWithInputName(`${name} can't be empty!`)
      );
    if (validateFn && validateFn(value, name, entriesWithValues) !== true)
      errors.push(
        createBodyEntryErrSuppliedWithInputName(
          (validateFn(value, name, entriesWithValues) as { message: string })
            .message
        )
      );
  });
  return errors;
};

type validateHelperFn<T, payload extends object> = (
  validateHelperFnArg: {
    val: T;
    strNameForErrorGeneration: string;
  } & payload
) => boolean | { message: string };

const validateStrLength: validateHelperFn<
  string,
  { length: number; checkType: "min" | "max" }
> = ({ checkType, val, strNameForErrorGeneration, length }) =>
  (checkType === "min" ? val.length >= length : val.length <= length) || {
    message: `${strNameForErrorGeneration} must consist of at ${
      checkType === "min" ? "least" : "most"
    } ${length} character${length >= 2 ? "s" : ""}`,
  };

const stringFollowsRegex: validateHelperFn<
  string,
  {
    regex: RegExp;
    errorMessageGeneratorFn?: (name: string) => string;
    needsToHaveOrDontHave?: boolean;
  }
> = ({
  regex,
  val,
  strNameForErrorGeneration,
  errorMessageGeneratorFn,
  needsToHaveOrDontHave = true,
}) => {
  return (
    regex.test(val) === needsToHaveOrDontHave || {
      message: errorMessageGeneratorFn
        ? errorMessageGeneratorFn(strNameForErrorGeneration)
        : `${strNameForErrorGeneration} has to meet its format requirements!`,
    }
  );
};

const upperCaseRegex = /[A-Z]/g;
const lowerCaseRegex = /[a-z]/g;
const digitRegex = /\d/g;
const specialCharacterRegex = /\W/g;
const whiteSpaceCharacterRegex = /\s/g;

const passwordRegexArr = [
  upperCaseRegex,
  lowerCaseRegex,
  digitRegex,
  specialCharacterRegex,
  whiteSpaceCharacterRegex,
];

const validatePasswordFn = (password: unknown, name: string) => {
  const passwordLengthValidation = validateStrLength({
    val: password as string,
    strNameForErrorGeneration: name,
    checkType: "min",
    length: 8,
  });
  if (passwordLengthValidation !== true) return passwordLengthValidation;
  for (const passwordRegex of passwordRegexArr) {
    const regexValidationResult = stringFollowsRegex({
      regex: passwordRegex,
      val: password as string,
      strNameForErrorGeneration: name,
      needsToHaveOrDontHave:
        passwordRegex === whiteSpaceCharacterRegex ? false : true,
      errorMessageGeneratorFn: (name) =>
        `${name} has${
          passwordRegex === whiteSpaceCharacterRegex ? " not" : ""
        } to contain at least one ${
          passwordRegex === lowerCaseRegex ||
          passwordRegex === upperCaseRegex ||
          passwordRegex === specialCharacterRegex
            ? `${
                passwordRegex === lowerCaseRegex
                  ? "lowercase"
                  : passwordRegex === upperCaseRegex
                  ? "uppercase"
                  : "special"
              } character`
            : passwordRegex === digitRegex
            ? "digit"
            : "whitespace character"
        }`,
    });
    if (regexValidationResult !== true) return regexValidationResult;
  }
  return true;
};

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]+$/;
const firstAndLastNameRegex = /^[a-zA-ZÀ-ÿ' -]+$/;
const properDateFromInputTypeDateRegex = /\d{4}-\d{2}-\d{2}/;
const zipCodeRegex = /^[A-Za-z0-9\- ]{2,15}$/;

const firstAndLastNameValidateFn: bodyEntryValidateFn<
  IRegisterBodyFromRequest
> = (val, name) =>
  stringFollowsRegex({
    val: val as string,
    regex: firstAndLastNameRegex,
    strNameForErrorGeneration: name,
  });

export interface ILoginBodyFromRequest extends IBodyFromRequestToValidate {
  login: string;
  password: string;
}

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
      validateFn: (val, name, otherEntries) =>
        validatePasswordFn(val as string, name) &&
        val ===
          otherEntries!.find(
            (registerBodyEntry) =>
              registerBodyEntry.requestBodyName === "password"
          )!.value,
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
    { name: "Last name", requestBodyName: "lastName", type: "string" },
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

export default function createDateNoTakingTimezoneIntoAccount({
  year,
  month,
  day,
  omitTimeInCurrentDate = true,
}: {
  year?: number;
  month?: number;
  day?: number;
  omitTimeInCurrentDate?: boolean;
}) {
  if (!year) {
    const now = new Date();
    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        ...(omitTimeInCurrentDate
          ? [
              now.getUTCHours(),
              now.getMinutes(),
              now.getUTCSeconds(),
              now.getUTCMilliseconds(),
            ]
          : [])
      )
    );
  }

  return new Date(Date.UTC(year, month, day));
}
