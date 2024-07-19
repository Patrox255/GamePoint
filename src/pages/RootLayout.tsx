import { Outlet } from "react-router-dom";
import { ReactNode } from "react";
import Nav from "../components/UI/Nav";
import Footer from "../components/UI/Footer";
import { createPortal } from "react-dom";
import LoginModal from "../components/UI/modals/LoginModal";
import ModalContextProvider from "../store/ModalContext";
import ModalContainer from "../components/UI/modals/ModalContainer";
import ModalOverlay from "../components/UI/modals/ModalOverlay";

export default function RootLayout({ children }: { children?: ReactNode }) {
  return (
    <ModalContextProvider>
      <Nav />

      {children ? children : <Outlet />}

      <Footer />
      {createPortal(
        <ModalOverlay>
          <ModalContainer>
            <LoginModal />
          </ModalContainer>
        </ModalOverlay>,
        document.getElementById("modals")!
      )}
    </ModalContextProvider>
  );
}
