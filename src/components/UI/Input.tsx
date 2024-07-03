import { motion } from "framer-motion";
import properties from "../../styles/properties";

export default function Input({
  type = "text",
  placeholder,
}: {
  type?: string;
  placeholder?: string;
}) {
  const focusHoverStyleProperties = {
    opacity: 1,
    borderColor: properties.highlightRed,
    boxShadow: properties.boxShadow,
  };

  return (
    <motion.input
      type={type}
      placeholder={placeholder}
      className="outline-none py-2 px-1 rounded-lg bg-darkerBg text-defaultFont border-2 w-1/4"
      initial={{
        opacity: 0.5,
        borderColor: properties.bodyBg,
        boxShadow: "none",
      }}
      whileHover={focusHoverStyleProperties}
      whileFocus={focusHoverStyleProperties}
    />
  );
}
