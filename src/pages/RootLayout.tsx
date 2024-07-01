import { Outlet } from "react-router-dom";
import { ReactNode } from "react";
import Nav from "../components/UI/Nav";
import Footer from "../components/UI/Footer";

export default function RootLayout({ children }: { children?: ReactNode }) {
  return (
    <>
      <Nav />

      {children ? children : <Outlet />}

      <Footer />
    </>
  );
}
