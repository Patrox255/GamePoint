import {
  createContext,
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { motion } from "framer-motion";

import {
  FormWithErrorHandlingContext,
  IFormInputField,
  ValidationErrorsArr,
} from "./FormWithErrorHandling";
import Input, { inputOnChange, inputValue } from "./Input";
import Error from "./Error";

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

const InputFieldSingleRowCtx = createContext<boolean>(false);

export const InputFieldSingleRow = ({ children }: { children: ReactNode }) => {
  return (
    <InputFieldSingleRowCtx.Provider value={true}>
      <div className="contact-information-first-last-name w-full flex gap-6 items-center">
        {children}
      </div>
    </InputFieldSingleRowCtx.Provider>
  );
};

export const InputFieldElementChildrenCtx = createContext<{
  forceInputFieldBlur: () => void;
  forceInputFieldFocus: () => void;
  inputFieldObj?: IFormInputField;
}>({
  forceInputFieldBlur: () => {},
  forceInputFieldFocus: () => {},
  inputFieldObj: undefined,
});

const InputFieldElement = forwardRef<
  HTMLInputElement,
  {
    inputFieldObjFromProps?: IFormInputField;
    formWithErrorHandlingCtxInputFieldsName?: string;
    onChangeCheckbox?: (newCheckboxState: boolean) => void;
    checkedCheckbox?: boolean;
    children?: ReactNode;
    value?: inputValue;
    onChange?: inputOnChange;
  }
>(
  (
    {
      inputFieldObjFromProps,
      formWithErrorHandlingCtxInputFieldsName,
      onChangeCheckbox,
      checkedCheckbox,
      children,
      value,
      onChange,
    },
    inputRef
  ) => {
    const { errorsRelatedToValidation, inputFields } = useContext(
      FormWithErrorHandlingContext
    );
    const usesFormWithErrorHandlingCtx = errorsRelatedToValidation !== null;
    const inputFieldObj = inputFieldObjFromProps
      ? inputFieldObjFromProps
      : usesFormWithErrorHandlingCtx && formWithErrorHandlingCtxInputFieldsName
      ? inputFields.find(
          (inputFieldObj) =>
            inputFieldObj.name === formWithErrorHandlingCtxInputFieldsName
        )
      : undefined;

    const [inputFocused, setInputFocused] = useState<boolean>(false);

    const onInputBlur = useCallback(() => setInputFocused(false), []);
    const onInputFocus = useCallback(() => setInputFocused(true), []);
    const insideSingleRowCtx = useContext(InputFieldSingleRowCtx);

    if (!inputFieldObj || errorsRelatedToValidation === null)
      return (
        <p>
          Must provide information about an input field via props or by placing
          inside form with error handling component and setting a name to
          retrieve a desired input field object from a context
        </p>
      );

    const inputLabelElement = (
      <>
        {inputFieldObj.renderLabel && (
          <label htmlFor={`input-${inputFieldObj.name}`}>
            {inputFieldObj.placeholder}
          </label>
        )}
        <div className={`flex gap-3`}>
          <Input
            placeholder={
              !inputFieldObj.renderLabel ? inputFieldObj.placeholder : undefined
            }
            ref={inputRef}
            belongToFormElement
            otherValidationInputAttributes={
              inputFieldObj.otherValidationAttributes
            }
            name={inputFieldObj.name}
            type={inputFieldObj.type}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            width={inputFieldObj.type === "checkbox" ? "w-6" : undefined}
            onChangeCheckbox={onChangeCheckbox}
            checkedCheckbox={checkedCheckbox}
            options={inputFieldObj.selectOptions}
            value={value}
            manuallyManageValueInsideForm={value !== undefined}
            onChange={onChange}
          />
          {children && (
            <InputFieldElementChildrenCtx.Provider
              value={{
                forceInputFieldBlur: onInputBlur,
                forceInputFieldFocus: onInputFocus,
                inputFieldObj,
              }}
            >
              {children}
            </InputFieldElementChildrenCtx.Provider>
          )}
        </div>
      </>
    );

    return (
      <motion.div
        className={`w-${
          inputFieldObj.type === "checkbox" ? "auto" : "full"
        } flex flex-col gap-3 opacity-1 ${
          insideSingleRowCtx ? "self-end" : ""
        } ${inputFieldObj.type === "date" ? "relative z-10" : ""}`}
        variants={{
          initial: { opacity: 0 },
          default: { opacity: 0.7 },
          hover: {
            x: inputFieldObj.type === "checkbox" ? undefined : 10,
            opacity: 1,
          },
        }}
        initial="initial"
        animate={inputFocused ? "hover" : "default"}
        whileHover="hover"
        whileFocus="hover"
      >
        {inputFieldObj.type === "checkbox" ? (
          <div className="w-full flex justify-center gap-3">
            {inputLabelElement}
          </div>
        ) : (
          inputLabelElement
        )}
        {inputFieldObj.instructionStr && (
          <p className="text-highlightRed font-bold">
            {inputFieldObj.instructionStr}
          </p>
        )}
        {generateValidationErrorsRelatedToAnInput(
          errorsRelatedToValidation,
          inputFieldObj.name
        )}
      </motion.div>
    );
  }
);

export default InputFieldElement;
