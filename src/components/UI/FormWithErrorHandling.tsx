import { createContext, FormEvent, ReactNode, useEffect, useRef } from "react";
import Error from "./Error";
import { IOtherValidationInputAttributes } from "./Input";
import LoadingFallback from "./LoadingFallback";
import InputFieldElement from "./InputFieldElement";
import DatePickerInputFieldElement from "./DatePickerInputFieldElement";

export interface IFormDataObj {
  [k: string]: FormDataEntryValue;
}

export type ValidationErrorsArr = { message: string; errInputName: string }[];

export type FormActionBackendResponse =
  | { data: string }
  | { data: { message: string } };

export type FormActionBackendErrorResponse = Error | ValidationErrorsArr;

export interface IFormInputField {
  type?: string;
  name: string;
  placeholder?: string;
  otherValidationAttributes?: IOtherValidationInputAttributes;
  renderLabel?: boolean;
  instructionStr?: string;
  active?: boolean;
  selectOptions?: string[];
}

export type FormInputFields = IFormInputField[];

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
  inputFieldsToRender?: FormInputFields;
}

export const FormWithErrorHandlingContext = createContext<{
  errorsRelatedToValidation: ValidationErrorsArr | undefined | null;
  inputFields: FormInputFields;
}>({ errorsRelatedToValidation: null, inputFields: [] });

export default function FormWithErrorHandling<T>({
  onSubmit,
  children,
  queryRelatedToActionState: { isPending, error, data },
  actionIfSuccess,
  focusFirstField,
  inputFields,
  inputFieldsToRender,
}: IFormProps<T>) {
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    focusFirstField && firstFieldRef.current?.focus();
  }, [focusFirstField]);

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
    <FormWithErrorHandlingContext.Provider
      value={{ errorsRelatedToValidation, inputFields }}
    >
      <form
        className="login-form w-3/4 h-full flex flex-col justify-center items-center gap-3"
        method="post"
        action=""
        onSubmit={handleFormSubmit}
      >
        {(inputFieldsToRender ? inputFieldsToRender : inputFields).map(
          (inputFieldObj, i) =>
            inputFieldObj.type !== "date" ? (
              <InputFieldElement
                inputFieldObjFromProps={inputFieldObj}
                ref={i === 0 ? firstFieldRef : undefined}
                key={inputFieldObj.name}
              />
            ) : (
              <DatePickerInputFieldElement
                inputFieldObjFromProps={inputFieldObj}
                key={inputFieldObj.name}
              />
            )
        )}
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
    </FormWithErrorHandlingContext.Provider>
  );
}
