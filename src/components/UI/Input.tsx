import { motion } from "framer-motion";
import properties from "../../styles/properties";
import { ChangeEventHandler } from "react";

type inputValue = string | number | undefined;

export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
}: {
  type?: string;
  placeholder?: string;
  value?: inputValue;
  onChange?: (val: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const focusHoverStyleProperties = {
    opacity: 1,
    borderColor: properties.highlightRed,
    boxShadow: properties.boxShadow,
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    onChange && onChange(e.currentTarget.value);

  return (
    <motion.input
      type={type}
      placeholder={placeholder}
      className="outline-none py-2 px-1 rounded-lg bg-darkerBg text-defaultFont border-2 w-full"
      initial={{
        opacity: 0.5,
        borderColor: properties.bodyBg,
        boxShadow: "none",
      }}
      whileHover={focusHoverStyleProperties}
      whileFocus={focusHoverStyleProperties}
      value={value}
      onChange={handleInputChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}
