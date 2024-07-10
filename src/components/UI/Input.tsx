import { motion } from "framer-motion";
import properties from "../../styles/properties";
import { ChangeEventHandler } from "react";

type inputValue = string | number;

export default function Input({
  type = "text",
  placeholder,
  value,
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
}: {
  type?: string;
  placeholder?: string;
  value: inputValue;
  onChange?: (val: string) => void;
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
}) {
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

  return (
    <motion.input
      type={type}
      placeholder={placeholder}
      className={`outline-none py-2 px-1 rounded-lg bg-darkerBg text-defaultFont border-2 ${width} ${
        additionalTailwindClasses ? additionalTailwindClasses : ""
      }`}
      initial={{
        opacity: useOpacity ? 0.5 : undefined,
        borderColor: useBorder ? properties.bodyBg : undefined,
        boxShadow: useShadow ? "none" : undefined,
      }}
      whileHover={focusHoverStyleProperties}
      whileFocus={focusHoverStyleProperties}
      value={typeof value === "string" ? value : isNaN(value) ? "" : value}
      onFocus={onFocus}
      onBlur={onBlur}
      {...(((type === "number" || type === "range") && {
        min,
        max,
        step,
        onInput: handleInputChange,
      }) || { onChange: handleInputChange })}
    />
  );
}
