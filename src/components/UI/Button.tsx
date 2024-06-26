import { ReactNode } from "react";
import { motion } from "framer-motion";
import customColors from "../../styles/colors";

export default function Button({
  children,
  ...props
}: {
  children: ReactNode;
}) {
  return (
    <motion.button
      {...props}
      className="px-6 py-2 border-highlightRed border-2 rounded-lg font-bold opacity-50 bg-transparent"
      whileHover={{
        opacity: 1,
        backgroundColor: customColors.highlightRed,
        boxShadow: "0 0 40px -4px rgba(173,52,52,1)",
      }}
      initial={{
        backgroundColor: customColors.bodyBg,
        boxShadow: "none",
      }}
    >
      {children}
    </motion.button>
  );
}
