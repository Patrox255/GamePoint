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
import Input from "./Input";
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

const InputFieldElement = forwardRef<
  HTMLInputElement,
  {
    inputFieldObjFromProps?: IFormInputField;
    formWithErrorHandlingCtxInputFieldsName?: string;
    onChangeCheckbox?: (newCheckboxState: boolean) => void;
    checkedCheckbox?: boolean;
  }
>(
  (
    {
      inputFieldObjFromProps,
      formWithErrorHandlingCtxInputFieldsName,
      onChangeCheckbox,
      checkedCheckbox,
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

    const samePropsAcrossBothSelectAndInput = {
      name: inputFieldObj.name,
    };

    const inputLabelElement = (
      <>
        {inputFieldObj.renderLabel && (
          <label htmlFor={`input-${inputFieldObj.name}`}>
            {inputFieldObj.placeholder}
          </label>
        )}
        {/* {inputFieldObj.type === "select" ? (
          <Select
            {...samePropsAcrossBothSelectAndInput}
            options={inputFieldObj.selectOptions!}
          />
        ) : ( */}
        <Input
          placeholder={
            !inputFieldObj.renderLabel ? inputFieldObj.placeholder : undefined
          }
          ref={inputRef}
          belongToFormElement
          otherValidationInputAttributes={
            inputFieldObj.otherValidationAttributes
          }
          {...samePropsAcrossBothSelectAndInput}
          type={inputFieldObj.type}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          width={inputFieldObj.type === "checkbox" ? "w-6" : undefined}
          onChangeCheckbox={onChangeCheckbox}
          checkedCheckbox={checkedCheckbox}
          options={inputFieldObj.selectOptions}
        />
        {/* )} */}
      </>
    );

    return (
      <motion.div
        className={`w-${
          inputFieldObj.type === "checkbox" ? "auto" : "full"
        } flex flex-col gap-3 opacity-1 ${
          insideSingleRowCtx ? "self-end" : ""
        }`}
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
