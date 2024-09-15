import { createContext, FormEvent, ReactNode, useEffect, useRef } from "react";
import Error from "./Error";
import { inputValue, IOtherValidationInputAttributes } from "./Input";
import LoadingFallback from "./LoadingFallback";
import InputFieldElement from "./InputFieldElement";
import DatePickerInputFieldElement from "./DatePickerInputFieldElement";

export interface IFormDataObj {
  [k: string]: FormDataEntryValue;
}

export type ValidationErrorsArr = { message: string; errInputName: string }[];

export type FormActionBackendResponse<T = string> =
  | { data: T }
  | { data: { message: string } };

export type FormActionBackendErrorResponse = Error | ValidationErrorsArr;

export interface IFormInputField {
  type?: string;
  name: string;
  placeholder?: string;
  otherValidationAttributes?: IOtherValidationInputAttributes;
  renderLabel?: boolean;
  renderPlaceholderInTheLabel?: boolean;
  instructionStr?: string;
  active?: boolean;
  selectOptions?: string[];
  defaultValue?: inputValue;
  propertyNameToDisplay?: string;
  omitMovingTheInputFieldUponSelecting?: boolean;
  allowForDropDownMenuImplementation?: boolean;
  dropDownMenuContent?: ReactNode;
  showDropDownElementsToAvoidUnnecessaryPadding?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export type FormInputFields = IFormInputField[];

interface IFormProps<T, Y> {
  onSubmit: (formDataObj: T) => void;
  children?: ReactNode;
  queryRelatedToActionState: {
    isPending: boolean;
    error: FormActionBackendErrorResponse | null;
    data: FormActionBackendResponse<Y> | undefined;
  };
  actionIfSuccess?: () => void;
  focusFirstField?: boolean;
  inputFields?: FormInputFields;
  inputFieldsToRender?: FormInputFields;
  lightTheme?: boolean;
}

export const FormWithErrorHandlingContext = createContext<{
  errorsRelatedToValidation: ValidationErrorsArr | undefined | null;
  inputFields?: FormInputFields;
  lightTheme: boolean;
  isPending: boolean;
}>({
  errorsRelatedToValidation: null,
  inputFields: [],
  lightTheme: false,
  isPending: false,
});

export default function FormWithErrorHandling<T, Y>({
  onSubmit,
  children,
  queryRelatedToActionState: { isPending, error, data },
  actionIfSuccess,
  focusFirstField,
  inputFields,
  inputFieldsToRender,
  lightTheme = false,
}: IFormProps<T, Y>) {
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
  const differentError = error && !Array.isArray(error) && error;
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

  const inputFieldsToRenderInsideOrRelyOnChildren = inputFieldsToRender
    ? inputFieldsToRender
    : inputFields
    ? inputFields
    : undefined;

  return (
    <FormWithErrorHandlingContext.Provider
      value={{ errorsRelatedToValidation, inputFields, lightTheme, isPending }}
    >
      <form
        className="login-form w-3/4 h-full flex flex-col justify-center items-center gap-3"
        method="post"
        action=""
        onSubmit={handleFormSubmit}
      >
        {inputFieldsToRenderInsideOrRelyOnChildren &&
          inputFieldsToRenderInsideOrRelyOnChildren.map((inputFieldObj, i) =>
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
          {differentError && <Error message={differentError.message} />}
        </div>
      </form>
    </FormWithErrorHandlingContext.Provider>
  );
}
