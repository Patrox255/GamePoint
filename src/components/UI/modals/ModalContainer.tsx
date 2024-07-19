import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function ModalContainer({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="modal-container fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[30vw] min-h-[50vh] bg-bodyBg flex justify-center items-center rounded-xl z-20"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  );
}
