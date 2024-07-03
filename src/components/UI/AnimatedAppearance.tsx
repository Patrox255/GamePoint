import { motion, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";

export default function AnimatedAppearance({
  children,
  staggerChildren = true,
}: {
  children: ReactNode;
  staggerChildren?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className="flex flex-row flex-wrap w-full justify-center items-center gap-x-1 gap-y-2"
      variants={{
        hidden: {
          opacity: 0,
        },
        visible: {
          opacity: 1,
          ...(staggerChildren && {
            transition: {
              staggerChildren: 0.15,
            },
          }),
        },
      }}
      initial="hidden"
      animate={isInView && "visible"}
    >
      {children}
    </motion.div>
  );
}
