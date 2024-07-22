import { FormEvent, ReactNode, useEffect, useRef } from "react";
import Error from "./Error";
import Input, { IOtherValidationInputAttributes } from "./Input";
import LoadingFallback from "./LoadingFallback";

export interface IFormDataObj {
  [k: string]: FormDataEntryValue;
}

export type ValidationErrorsArr = { message: string; errInputName: string }[];

export type FormActionBackendResponse =
  | { data: string }
  | { data: { message: string } };

export type FormActionBackendErrorResponse = Error | ValidationErrorsArr;

export type FormInputFields = {
  type?: string;
  name: string;
  placeholder?: string;
  otherValidationAttributes?: IOtherValidationInputAttributes;
}[];

const generateValidationErrorsRelatedToAnInput = (
  errorsRelatedToValidationArr: ValidationErrorsArr | undefined,
  inputName: string
) => {
  return (
    errorsRelatedToValidationArr &&
    errorsRelatedToValidationArr
      .filter(
        (errorRelatedToValidation) =>
          errorRelatedToValidation.errInputName === inputName
      )
      .map((errorRelatedToValidation) => (
        <Error
          smallVersion
          message={errorRelatedToValidation.message}
          key={`${errorRelatedToValidation.errInputName}-${errorRelatedToValidation.message}`}
        />
      ))
  );
};

interface IFormProps<T> {
  onSubmit: (formDataObj: T) => void;
  children?: ReactNode;
  queryRelatedToActionState: {
    isPending: boolean;
    error: FormActionBackendErrorResponse | null;
    data: FormActionBackendResponse | undefined;
  };
  actionIfSuccess?: () => void;
  focusFirstField?: boolean;
  inputFields: FormInputFields;
}

export default function FormWithErrorHandling<T>({
  onSubmit,
  children,
  queryRelatedToActionState: { isPending, error, data },
  actionIfSuccess,
  focusFirstField,
  inputFields,
}: IFormProps<T>) {
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    focusFirstField && firstFieldRef.current?.focus();
  }, [focusFirstField]);

  useEffect(() => {
    console.log(isPending, error, data);
  }, [data, error, isPending]);

  const hasErrorRelatedToWrongUserData =
    data && data.data && (data.data as { message?: string }).message;
  const errorsRelatedToValidation =
    error && (error as ValidationErrorsArr).length > 0
      ? (error as ValidationErrorsArr)
      : undefined;
  useEffect(() => {
    if (hasErrorRelatedToWrongUserData) return;
    if (errorsRelatedToValidation) return;
    data && data.data && actionIfSuccess?.();
  }, [
    data,
    errorsRelatedToValidation,
    hasErrorRelatedToWrongUserData,
    actionIfSuccess,
  ]);

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formDataObj = Object.fromEntries(new FormData(e.currentTarget)) as T;
    onSubmit(formDataObj);
  }

  return (
    <form
      className="login-form w-3/4 h-full flex flex-col justify-center items-center gap-3"
      method="post"
      action=""
      onSubmit={handleFormSubmit}
    >
      {inputFields.map((inputFieldObj) => (
        <div className="w-full flex flex-col gap-3" key={inputFieldObj.name}>
          <Input
            placeholder={inputFieldObj.placeholder}
            ref={firstFieldRef}
            belongToFormElement
            otherValidationInputAttributes={
              inputFieldObj.otherValidationAttributes
            }
            name={inputFieldObj.name}
            type={inputFieldObj.type}
          />
          {generateValidationErrorsRelatedToAnInput(
            errorsRelatedToValidation,
            inputFieldObj.name
          )}
        </div>
      ))}
      {children}
      <div className="form-additional-information">
        {isPending && <LoadingFallback />}
        {hasErrorRelatedToWrongUserData && (
          <Error
            message={(data.data as { message: string }).message}
            smallVersion
          />
        )}
      </div>
    </form>
  );
}
