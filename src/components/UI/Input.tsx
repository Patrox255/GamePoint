import { motion } from "framer-motion";
import properties from "../../styles/properties";
import { ChangeEvent, ChangeEventHandler, forwardRef, useContext } from "react";
import isoStringToDateInputValue from "../../helpers/isoStringToDateInputValue";
import { FormWithErrorHandlingContext } from "./FormWithErrorHandling";

export type inputValue = string | number | Date;

export type inputOnChangeTypeDate = (val: Date | string) => void;

export type inputOnChangeTypeText = (val: string) => void;

export type inputOnChangeTypeNumber = (val: number) => void;

export type inputOnChange =
  | inputOnChangeTypeText
  | inputOnChangeTypeDate
  | inputOnChangeTypeNumber;

export interface IOtherValidationInputAttributes {
  required?: boolean;
  minLength?: number;
  pattern?: string;
}

interface IInputProps {
  type?: string;
  placeholder?: string;
  value?: inputValue;
  onChange?: inputOnChange;
  onFocus?: () => void;
  onBlur?: () => void;
  width?: string;
  useBorder?: boolean;
  useShadow?: boolean;
  useOpacity?: boolean;
  additionalTailwindClasses?: string;
  min?: number;
  max?: number;
  step?: number;
  belongToFormElement?: boolean;
  manuallyManageValueInsideForm?: boolean;
  name?: string;
  otherValidationInputAttributes?: IOtherValidationInputAttributes;
  onChangeCheckbox?: (newCheckboxState: boolean) => void;
  imperativeActive?: boolean;
  checkedCheckbox?: boolean;
  options?: string[];
  customInputNumber?: boolean;
  lightThemeFromProps?: boolean;
  defaultValue?: inputValue;
}

const Input = forwardRef<HTMLInputElement, IInputProps>(
  (
    {
      type = "text",
      placeholder,
      value = "",
      onChange,
      onFocus,
      onBlur,
      width = "w-full",
      useBorder = true,
      useShadow = true,
      useOpacity = true,
      additionalTailwindClasses,
      min,
      max,
      step,
      otherValidationInputAttributes = {},
      belongToFormElement = false,
      manuallyManageValueInsideForm,
      name,
      onChangeCheckbox,
      imperativeActive,
      checkedCheckbox,
      options,
      customInputNumber = false,
      lightThemeFromProps,
      defaultValue,
    },
    ref
  ) => {
    const focusHoverStyleProperties = {
      opacity: useOpacity ? 1 : undefined,
      borderColor: useBorder ? properties.highlightRed : undefined,
      boxShadow: useShadow ? properties.boxShadow : undefined,
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      const value = e.currentTarget.value.replace(",", ".");
      const numberRegex = /\d*(\.\d{1,2})?/;
      const isValidNumberIfTypeNumber =
        type !== "number"
          ? true
          : value === "" ||
            (value &&
              numberRegex.test(value) &&
              (!min || parseFloat(value) >= min) &&
              (!max || parseFloat(value) <= max));
      isValidNumberIfTypeNumber && onChange
        ? type === "number"
          ? (onChange as inputOnChangeTypeNumber)(parseFloat(value))
          : (onChange as inputOnChangeTypeText)(value)
        : undefined;
    };

    const lightTheme =
      useContext(FormWithErrorHandlingContext).lightTheme ||
      lightThemeFromProps;

    const className = `outline-none py-2 px-1 rounded-lg ${
      lightTheme ? "bg-bodyBg" : "bg-darkerBg"
    } text-defaultFont border-2 ${width} ${
      additionalTailwindClasses ? additionalTailwindClasses : ""
    }`;

    const sharedPropsAcrossInputAndSelect = {
      className,
      name,
      id: `input-${name}`,
      variants: {
        initial: {
          opacity: useOpacity ? 0.5 : undefined,
          borderColor: useBorder ? properties.bodyBg : undefined,
          boxShadow: useShadow ? "none" : undefined,
        },
        hover: focusHoverStyleProperties,
      },
      initial: imperativeActive ? "hover" : "initial",
      whileHover: "hover",
      whileFocus: "hover",
      layout: true,
      onFocus,
      onBlur,
    };

    const defaultValueInCaseOfCheckboxOrTextArea =
      defaultValue && typeof defaultValue === "string"
        ? defaultValue
        : undefined;

    let content = (
      <motion.input
        {...{
          ...sharedPropsAcrossInputAndSelect,
          className: customInputNumber
            ? className + " custom-input-number"
            : className,
        }}
        type={type === "date" ? "text" : type}
        placeholder={placeholder}
        {...((!belongToFormElement ||
          (belongToFormElement && manuallyManageValueInsideForm) ||
          type === "checkbox") && {
          value:
            typeof value === "string"
              ? value
              : type === "date"
              ? isoStringToDateInputValue((value as Date).toISOString())
              : isNaN(value as number)
              ? ""
              : (value as number),
        })}
        {...(((type === "number" || type === "range") && {
          min,
          max,
          step,
          onInput: handleInputChange,
        }) || {
          onChange: onChangeCheckbox
            ? (e: ChangeEvent<HTMLInputElement>) =>
                onChangeCheckbox(e.currentTarget.checked)
            : !belongToFormElement
            ? handleInputChange
            : manuallyManageValueInsideForm
            ? (e) => {
                const value = e.currentTarget.value;
                (onChange as inputOnChangeTypeText)?.(value);
              }
            : undefined,
        })}
        {...{
          ...otherValidationInputAttributes,
          pattern: otherValidationInputAttributes?.pattern?.replace(/\\/, "\\"),
        }}
        ref={ref}
        checked={checkedCheckbox}
        defaultValue={
          defaultValue && typeof defaultValue !== "object"
            ? defaultValue
            : undefined
        }
      />
    );

    if (type === "select")
      content = (
        <motion.select
          {...sharedPropsAcrossInputAndSelect}
          defaultValue={defaultValueInCaseOfCheckboxOrTextArea}
          {...(onChange && {
            onChange: (e) =>
              (onChange as inputOnChangeTypeText)(e.currentTarget.value),
          })}
        >
          {options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </motion.select>
      );

    if (type === "textarea")
      content = (
        <motion.textarea
          {...sharedPropsAcrossInputAndSelect}
          defaultValue={defaultValueInCaseOfCheckboxOrTextArea}
        ></motion.textarea>
      );

    return content;
  }
);

export default Input;
