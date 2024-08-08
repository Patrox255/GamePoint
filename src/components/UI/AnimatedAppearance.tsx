import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function AnimatedAppearance({
  children,
  staggerChildren = true,
  flexTailwindClass = "flex-col",
}: {
  children: ReactNode;
  staggerChildren?: boolean;
  flexTailwindClass?: "flex-col" | "flex-row";
}) {
  return (
    <motion.div
      className={`flex ${flexTailwindClass} w-full justify-center items-center`}
      variants={{
        hidden: {
          opacity: 0,
        },
        visible: {
          opacity: 1,

          transition: {
            ...(staggerChildren && { staggerChildren: 0.15 }),
            duration: 1,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
}
