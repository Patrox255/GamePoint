import { motion } from "framer-motion";
import properties from "../../styles/properties";
import { ChangeEvent, ChangeEventHandler, forwardRef } from "react";
import isoStringToDateInputValue from "../../helpers/isoStringToDateInputValue";

export type inputValue = string | number | Date;

export type inputOnChangeTypeDate = (val: Date | string) => void;

export type inputOnChange = (val: string) => void | inputOnChangeTypeDate;

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
      const numberRegex = /\d*(,\d{1,2})?/;
      const isValidNumberIfTypeNumber =
        type !== "number"
          ? true
          : value === "" ||
            (value &&
              numberRegex.test(value) &&
              parseFloat(value) >= min! &&
              parseFloat(value) <= max!);
      isValidNumberIfTypeNumber && onChange && onChange(value);
    };

    const className = `outline-none py-2 px-1 rounded-lg bg-darkerBg text-defaultFont border-2 ${width} ${
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

    let content = (
      <motion.input
        {...sharedPropsAcrossInputAndSelect}
        type={type}
        placeholder={placeholder}
        {...((!belongToFormElement ||
          (belongToFormElement && manuallyManageValueInsideForm)) && {
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
                if (type === "string") onChange?.(value);
                if (type === "date")
                  (onChange as inputOnChangeTypeDate)?.(
                    value === "" ? value : new Date(value)
                  );
              }
            : undefined,
        })}
        {...otherValidationInputAttributes}
        ref={ref}
        checked={checkedCheckbox}
      />
    );

    if (type === "select")
      content = (
        <motion.select {...sharedPropsAcrossInputAndSelect}>
          {options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </motion.select>
      );

    return content;
  }
);

export default Input;
