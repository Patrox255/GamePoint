import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function TagComponent({
  tag,
  children,
}: {
  tag: string;
  children: ReactNode;
}) {
  return (
    <motion.li
      key={tag}
      variants={{
        hidden: {
          opacity: 0,
          scale: "0.5",
          translateX: "1rem",
        },
        visible: {
          opacity: 1,
          scale: "1",
          translateX: "0",
        },
      }}
    >
      {children}
    </motion.li>
  );
}
