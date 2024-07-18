import { motion, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";

export default function AnimatedAppearance({
  children,
  staggerChildren = true,
  flexTailwindClass = "flex-col",
}: {
  children: ReactNode;
  staggerChildren?: boolean;
  flexTailwindClass?: "flex-col" | "flex-row";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
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
      animate={isInView && "visible"}
    >
      {children}
    </motion.div>
  );
}
