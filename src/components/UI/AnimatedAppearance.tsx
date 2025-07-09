import { motion, MotionStyle } from "framer-motion";
import { ReactNode } from "react";

export default function AnimatedAppearance({
  children,
  staggerChildren = true,
  flexTailwindClass = "flex-col",
  style,
}: {
  children: ReactNode;
  staggerChildren?: boolean;
  flexTailwindClass?: string;
  style?: MotionStyle;
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
      style={style}
    >
      {children}
    </motion.div>
  );
}
