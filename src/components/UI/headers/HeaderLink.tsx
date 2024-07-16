import { AnimationProps, HoverHandlers } from "framer-motion";
import { createContext, ReactNode } from "react";
import { Link } from "react-router-dom";
import properties from "../../../styles/properties";
import generateUrlEndpointWithSearchParams from "../../../helpers/generateUrlEndpointWithSearchParams";

export const HeaderLinkContext = createContext<{
  headerAnimationProps: AnimationProps & HoverHandlers;
}>({ headerAnimationProps: {} });

export default function HeaderLink({
  href,
  children,
  searchParams,
}: {
  href: string;
  children: ReactNode;
  searchParams?: { [key: string]: unknown };
}) {
  return (
    <HeaderLinkContext.Provider
      value={{
        headerAnimationProps: {
          initial: { color: properties.defaultFont },
          whileHover: { color: properties.highlightRed },
        },
      }}
    >
      <Link to={generateUrlEndpointWithSearchParams(href, searchParams)}>
        {children}
      </Link>
    </HeaderLinkContext.Provider>
  );
}
