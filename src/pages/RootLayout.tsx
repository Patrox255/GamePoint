import { Outlet } from "react-router-dom";
import { ReactNode } from "react";
import Nav from "../components/UI/Nav";

export default function RootLayout({ children }: { children?: ReactNode }) {
  return (
    <>
      <Nav />

      {children ? children : <Outlet />}
    </>
  );
}
