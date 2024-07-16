import { motion } from "framer-motion";
import properties from "../../styles/properties";
import { ChangeEvent } from "react";

const hoverAndFocusStyleProperties = {
  opacity: 1,
  borderColor: properties.highlightRed,
  boxShadow: properties.boxShadow,
};

export default function TextArea({
  widthTailwindClass,
  rows = 5,
  placeholder,
  value = "",
  onChange,
}: {
  widthTailwindClass: string;
  rows?: number;
  placeholder?: string;
  value?: string;
  onChange?: (newValue: string) => void;
}) {
  return (
    <motion.textarea
      className={`${widthTailwindClass} bg-bodyBg text-defaultFont rounded-xl outline-none px-1 py-1 border-2`}
      rows={rows}
      placeholder={placeholder}
      initial={{
        opacity: 0.5,
        borderColor: properties.bodyBg,
        boxShadow: "none",
      }}
      whileHover={hoverAndFocusStyleProperties}
      whileFocus={hoverAndFocusStyleProperties}
      value={value}
      onChange={
        onChange
          ? (e: ChangeEvent<HTMLTextAreaElement>) =>
              onChange(e.currentTarget.value)
          : undefined
      }
    ></motion.textarea>
  );
}
