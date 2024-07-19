import { ReactNode, useContext } from "react";
import { motion } from "framer-motion";

import { ModalContext } from "../../../store/ModalContext";

export default function ModalOverlay({ children }: { children: ReactNode }) {
  const { loginModalOpen, setLoginModalOpen } = useContext(ModalContext);

  const overlayActive = loginModalOpen;

  return (
    <motion.div
      className="modals-overlay fixed w-full h-screen z-10 left-0 top-0 backdrop-blur-md"
      initial={{ opacity: 0, pointerEvents: "none" }}
      animate={
        overlayActive ? { opacity: 1, pointerEvents: "auto" } : undefined
      }
      onKeyDown={(e) => e.key === "Escape" && setLoginModalOpen(false)}
      onClick={() => setLoginModalOpen(false)}
    >
      {children}
    </motion.div>
  );
}
