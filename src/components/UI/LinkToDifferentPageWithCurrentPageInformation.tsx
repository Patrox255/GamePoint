import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

export default function LinkToDifferentPageWithCurrentPageInformation({
  className = "",
  to,
  children,
}: {
  className?: string;
  to: string;
  children: ReactNode;
}) {
  const { pathname } = useLocation();

  return (
    <Link className={className} to={`${to}?previousPagePathName=${pathname}`}>
      {children}
    </Link>
  );
}
