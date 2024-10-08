/* eslint-disable react-refresh/only-export-components */
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
import DropDownMenuWrapper from "./DropDownMenu/DropDownMenuWrapper";
import DropDownMenuDroppedElementsContainer from "./DropDownMenu/DropDownMenuDroppedElementsContainer";
import useCompareComplexForUseMemo from "../../hooks/useCompareComplexForUseMemo";

export interface IInputFieldValidationError {
  message: string;
  errInputName: string;
}

export const generateValidationErrorsRelatedToAnInput = (
  errorsRelatedToValidationArr: ValidationErrorsArr | undefined | null,
  inputName: string
) => {
  let content;
  if (errorsRelatedToValidationArr)
    content = errorsRelatedToValidationArr
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
      ));
  return content;
};

const InputFieldSingleRowCtx = createContext<boolean>(false);

export const InputFieldSingleRow = ({
  children,
  identificator,
}: {
  children: ReactNode;
  identificator?: string;
}) => {
  return (
    <InputFieldSingleRowCtx.Provider value={true}>
      <div className="w-full flex gap-6 items-center" id={identificator}>
        {children}
      </div>
    </InputFieldSingleRowCtx.Provider>
  );
};

type IFieldNotification = {
  [key in keyof IFormInputField]?: IFormInputField[key];
} & { formatPrefix: string; formatBoldText: string };

const inputFieldNotifications: IFieldNotification[] = [
  { type: "date", formatBoldText: "YYYY-MM-DD", formatPrefix: "format: " },
  {
    name: "phoneNr",
    formatBoldText: "+48 111 222 333",
    formatPrefix: "Include international prefix, e.g. ",
  },
];

const requiredInputFieldIndicator = (
  <span className="text-highlightRed">*</span>
);

const generateInputFieldLabel = (
  inputFieldObj: IFormInputField,
  markAsRequired: boolean | undefined
) => {
  const correspondingInputFieldNotificationObj = inputFieldNotifications.find(
    (inputFieldNotification) =>
      [...Object.entries(inputFieldNotification)].find(
        (inputFieldNotificationEntries) =>
          inputFieldNotificationEntries[0] !== "formatBoldText" &&
          inputFieldNotificationEntries[0] !== "formatPrefix" &&
          inputFieldObj[
            inputFieldNotificationEntries[0] as keyof IFormInputField
          ] === inputFieldNotificationEntries[1]
      )
  );

  return inputFieldObj.renderLabel ||
    inputFieldObj.renderLabel === undefined ? (
    <label htmlFor={`input-${inputFieldObj.name}`}>
      {(inputFieldObj.renderPlaceholderInTheLabel ||
        inputFieldObj.renderPlaceholderInTheLabel === undefined) &&
        inputFieldObj.placeholder}
      {!correspondingInputFieldNotificationObj &&
        markAsRequired &&
        requiredInputFieldIndicator}
      {correspondingInputFieldNotificationObj && (
        <span>
          &nbsp;({correspondingInputFieldNotificationObj.formatPrefix}
          <span className="font-bold">
            {correspondingInputFieldNotificationObj.formatBoldText}
          </span>
          ){markAsRequired && requiredInputFieldIndicator}
        </span>
      )}
    </label>
  ) : (
    ""
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
    customAlignSelfTailwindClass?: string;
    contentAboveInput?: ReactNode;
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
      customAlignSelfTailwindClass,
      contentAboveInput,
    },
    inputRef
  ) => {
    const { errorsRelatedToValidation, inputFields, lightTheme } = useContext(
      FormWithErrorHandlingContext
    );
    const usesFormWithErrorHandlingCtx = errorsRelatedToValidation !== null;
    const inputFieldObj = inputFieldObjFromProps
      ? inputFieldObjFromProps
      : usesFormWithErrorHandlingCtx &&
        formWithErrorHandlingCtxInputFieldsName &&
        inputFields
      ? inputFields.find(
          (inputFieldObj) =>
            inputFieldObj.name === formWithErrorHandlingCtxInputFieldsName
        )
      : undefined;

    const [inputFocused, setInputFocused] = useState<boolean>(false);

    const onInputBlur = useCallback(() => setInputFocused(false), []);
    const onInputFocus = useCallback(() => setInputFocused(true), []);
    const insideSingleRowCtx = useContext(InputFieldSingleRowCtx);
    const inputFieldObjStable = useCompareComplexForUseMemo(inputFieldObj);
    const InputFieldElementChildrenCtxWrapper = useCallback(
      ({ children }: { children: ReactNode }) => (
        <InputFieldElementChildrenCtx.Provider
          value={{
            forceInputFieldBlur: onInputBlur,
            forceInputFieldFocus: onInputFocus,
            inputFieldObj: inputFieldObjStable,
          }}
        >
          {children}
        </InputFieldElementChildrenCtx.Provider>
      ),
      [inputFieldObjStable, onInputBlur, onInputFocus]
    );

    if (!inputFieldObj || errorsRelatedToValidation === null)
      return (
        <p>
          Must provide information about an input field via props or by placing
          inside form with error handling component and setting a name to
          retrieve a desired input field object from a context
        </p>
      );

    const markAsRequired = inputFieldObj?.otherValidationAttributes?.required;

    const inputLabelElement = (
      <>
        {generateInputFieldLabel(inputFieldObj, markAsRequired)}
        <div className={`flex gap-3`}>
          <Input
            placeholder={
              inputFieldObj.renderLabel === false ||
              inputFieldObj.renderPlaceholderInTheLabel === false
                ? inputFieldObj.placeholder
                : undefined
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
            value={inputFieldObj.type === "checkbox" ? "on" : value}
            manuallyManageValueInsideForm={value !== undefined}
            onChange={onChange}
            defaultValue={inputFieldObj.defaultValue}
            min={inputFieldObj.min}
            max={inputFieldObj.max}
            step={inputFieldObj.step}
          />
          {children && (
            <InputFieldElementChildrenCtxWrapper>
              {children}
            </InputFieldElementChildrenCtxWrapper>
          )}
        </div>
      </>
    );

    const mainContent = (
      <motion.div
        className={`w-${
          inputFieldObj.type === "checkbox" ? "auto" : "full"
        } flex flex-col gap-3 opacity-1 ${
          customAlignSelfTailwindClass
            ? customAlignSelfTailwindClass
            : insideSingleRowCtx
            ? "self-end"
            : ""
        } ${inputFieldObj.type === "date" ? "relative z-10" : ""}`}
        variants={{
          initial: { opacity: 0 },
          default: { opacity: 0.7 },
          hover: {
            x:
              inputFieldObj.type === "checkbox" ||
              inputFieldObj.omitMovingTheInputFieldUponSelecting
                ? undefined
                : 10,
            opacity: 1,
          },
        }}
        initial="initial"
        animate={inputFocused ? "hover" : "default"}
        whileHover="hover"
        whileFocus="hover"
      >
        {contentAboveInput && (
          <InputFieldElementChildrenCtxWrapper>
            {contentAboveInput}
          </InputFieldElementChildrenCtxWrapper>
        )}
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

    return inputFieldObj.allowForDropDownMenuImplementation ? (
      <DropDownMenuWrapper widthTailwindClass="w-full">
        {mainContent}
        {inputFieldObj.showDropDownElementsToAvoidUnnecessaryPadding && (
          <DropDownMenuDroppedElementsContainer lightTheme={lightTheme}>
            {inputFieldObj.dropDownMenuContent}
          </DropDownMenuDroppedElementsContainer>
        )}
      </DropDownMenuWrapper>
    ) : (
      mainContent
    );
  }
);

export default InputFieldElement;
