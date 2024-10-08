import { Request, Response } from "express";
import { sameRegex } from "./helpers";
import { IRegisterBodyFromRequest } from "./validateBodyEntries";

const createBodyEntryErr = (errInputName: string, message: string) => ({
  message,
  errInputName,
});

export interface IBodyFromRequestToValidate {
  [k: string]: string | undefined | string[] | object;
}

export type bodyEntryValidateFn<T extends IBodyFromRequestToValidate> = (
  val: unknown,
  name: string,
  otherEntries?: (IValidateBodyEntry<T> & { value: unknown })[]
) => { message: string } | boolean;

export interface IValidateBodyEntry<T extends IBodyFromRequestToValidate> {
  type: string;
  name: string;
  validateFn?: bodyEntryValidateFn<T>;
  optional?: boolean;
  requestBodyName: keyof T;
  inputNameOtherThanVisibleNameToSetAppropriateValidationErrorInputName?: string;
}

type IValidationErrorsArr = { message: string; errInputName: string }[];

export function validateBodyEntries<
  T extends IBodyFromRequestToValidate
>(params: {
  entries: IValidateBodyEntry<T>[];
  req?: Request;
  requestBodyEntriesObj?: T;
  res: Response;
  sendAResponseWithErrors?: boolean;
}): IValidationErrorsArr | false;

export function validateBodyEntries<
  T extends IBodyFromRequestToValidate
>(params: {
  entries: IValidateBodyEntry<T>[];
  req?: Request;
  requestBodyEntriesObj?: T;
  res?: undefined;
  sendAResponseWithErrors: false;
}): IValidationErrorsArr;

export function validateBodyEntries<T extends IBodyFromRequestToValidate>({
  entries,
  req,
  requestBodyEntriesObj,
  res,
  sendAResponseWithErrors = true,
}: {
  entries: IValidateBodyEntry<T>[];
  req?: Request;
  requestBodyEntriesObj?: T;
  res?: Response;
  sendAResponseWithErrors?: boolean;
}) {
  const errors: IValidationErrorsArr = [];
  const entriesWithValues = entries.map((entry) => ({
    ...entry,
    value: req
      ? req.body[entry.requestBodyName]
      : requestBodyEntriesObj![entry.requestBodyName],
  }));

  entriesWithValues.forEach((entry) => {
    const {
      type,
      name,
      validateFn,
      optional = false,
      requestBodyName,
      value,
      inputNameOtherThanVisibleNameToSetAppropriateValidationErrorInputName,
    } = entry as typeof entry & { name: string; requestBodyName: string };

    const createBodyEntryErrSuppliedWithInputName = createBodyEntryErr.bind(
      null,
      inputNameOtherThanVisibleNameToSetAppropriateValidationErrorInputName !==
        undefined
        ? inputNameOtherThanVisibleNameToSetAppropriateValidationErrorInputName
        : requestBodyName
    );
    const typeToCheckFor = type === "array" ? "object" : type;
    const optionalValueFilled = value !== undefined || !optional;

    if (typeof value !== typeToCheckFor && optionalValueFilled)
      errors.push(
        createBodyEntryErrSuppliedWithInputName(
          `Please write a correct ${name}`
        )
      );
    if (
      typeof value !== "object" &&
      !optional &&
      (value === "" || new String(value).trim() === "")
    )
      errors.push(
        createBodyEntryErrSuppliedWithInputName(`${name} can't be empty!`)
      );
    if (
      type === "array" &&
      Array.isArray(value) &&
      value.length === 0 &&
      !optional
    )
      errors.push(
        createBodyEntryErrSuppliedWithInputName(`${name} can't be empty!`)
      );
    if (
      validateFn &&
      optionalValueFilled &&
      validateFn(value, name, entriesWithValues) !== true
    ) {
      errors.push(
        createBodyEntryErrSuppliedWithInputName(
          (
            validateFn(
              value,
              inputNameOtherThanVisibleNameToSetAppropriateValidationErrorInputName
                ? inputNameOtherThanVisibleNameToSetAppropriateValidationErrorInputName
                : name,
              entriesWithValues
            ) as { message: string }
          ).message
        )
      );
    }
  });
  if (errors.length === 0) return errors;
  if (sendAResponseWithErrors) res!.status(422).json({ errors });
  return sendAResponseWithErrors ? false : errors;
}

type validateHelperFn<T, payload extends object> = (
  validateHelperFnArg: {
    val: T;
    strNameForErrorGeneration: string;
  } & payload
) => boolean | { message: string };

export const validateStrLength: validateHelperFn<
  string,
  { length: number; checkType: "min" | "max" }
> = ({ checkType, val, strNameForErrorGeneration, length }) =>
  (checkType === "min" ? val.length >= length : val.length <= length) || {
    message: `${strNameForErrorGeneration} must consist of at ${
      checkType === "min" ? "least" : "most"
    } ${length} character${length >= 2 ? "s" : ""}`,
  };

export const stringFollowsRegex: validateHelperFn<
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
  regex.lastIndex = 0; // due to the global flag updating lastIndex
  return (
    regex.test(val) === needsToHaveOrDontHave || {
      message: errorMessageGeneratorFn
        ? errorMessageGeneratorFn(strNameForErrorGeneration)
        : `${strNameForErrorGeneration} has to meet its format requirements!`,
    }
  );
};

export const upperCaseRegex = /[A-Z]/g;
export const lowerCaseRegex = /[a-z]/g;
export const digitRegex = /\d/g;
export const specialCharacterRegex = /\W/g;
export const whiteSpaceCharacterRegex = /\s/g;

export const passwordRegexArr = [
  upperCaseRegex,
  lowerCaseRegex,
  digitRegex,
  specialCharacterRegex,
  whiteSpaceCharacterRegex,
];

export const validatePasswordFn = (password: unknown, name: string) => {
  const passwordLengthValidation = validateStrLength({
    val: password as string,
    strNameForErrorGeneration: name,
    checkType: "min",
    length: 8,
  });
  if (passwordLengthValidation !== true) return passwordLengthValidation;
  for (const passwordRegex of passwordRegexArr) {
    const isWhiteSpaceRegex = sameRegex(
      passwordRegex,
      whiteSpaceCharacterRegex
    );
    const regexValidationResult = stringFollowsRegex({
      regex: passwordRegex,
      val: password as string,
      strNameForErrorGeneration: name,
      needsToHaveOrDontHave: !isWhiteSpaceRegex,
      errorMessageGeneratorFn: (name) =>
        `${name} has${isWhiteSpaceRegex ? " not" : ""} to contain ${
          !isWhiteSpaceRegex ? "at least one" : "any"
        } ${
          sameRegex(passwordRegex, lowerCaseRegex) ||
          sameRegex(passwordRegex, upperCaseRegex) ||
          sameRegex(passwordRegex, specialCharacterRegex)
            ? `${
                sameRegex(passwordRegex, lowerCaseRegex)
                  ? "lowercase"
                  : sameRegex(passwordRegex, upperCaseRegex)
                  ? "uppercase"
                  : "special"
              } character`
            : sameRegex(passwordRegex, digitRegex)
            ? "digit"
            : "whitespace character"
        }`,
    });
    if (regexValidationResult !== true) return regexValidationResult;
  }
  return true;
};

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9]+$/;
export const firstAndLastNameRegex = /^[a-zA-ZÀ-ÿ' -]+$/;
export const properDateFromInputTypeDateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
export const zipCodeRegex = /^[A-Za-z0-9\- ]{2,15}$/;

export const firstAndLastNameValidateFn: bodyEntryValidateFn<
  IRegisterBodyFromRequest
> = (val, name) =>
  stringFollowsRegex({
    val: val as string,
    regex: firstAndLastNameRegex,
    strNameForErrorGeneration: name,
  });
