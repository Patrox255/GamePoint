import { AnimationProps, HoverHandlers } from "framer-motion";
import { createContext, ReactNode } from "react";
import { Link } from "react-router-dom";
import properties from "../../../styles/properties";
import generateUrlEndpointWithSearchParams from "../../../helpers/generateUrlEndpointWithSearchParams";
import LinkToDifferentPageWithCurrentPageInformation from "../LinkToDifferentPageWithCurrentPageInformation";

export const HeaderLinkContext = createContext<{
  headerAnimationProps: AnimationProps & HoverHandlers;
  disabled: boolean;
}>({ headerAnimationProps: {}, disabled: false });

export default function HeaderLinkOrHeaderAnimation({
  href,
  children,
  searchParams,
  additionalTailwindClasses = "",
  sendCurrentPageInformation = false,
  onlyAnimation = false,
  onClick,
  disabled = false,
}: {
  href?: string;
  children: ReactNode;
  searchParams?: { [key: string]: unknown };
  additionalTailwindClasses?: string;
  sendCurrentPageInformation?: boolean;
  onlyAnimation?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <HeaderLinkContext.Provider
      value={{
        headerAnimationProps: {
          initial: { color: properties.defaultFont },
          whileHover: !disabled
            ? { color: properties.highlightRed }
            : undefined,
        },
        disabled,
      }}
    >
      {onlyAnimation ? (
        <div
          onClick={onClick ? onClick : undefined}
          className={additionalTailwindClasses}
        >
          {children}
        </div>
      ) : sendCurrentPageInformation ? (
        <LinkToDifferentPageWithCurrentPageInformation to={href!}>
          {children}
        </LinkToDifferentPageWithCurrentPageInformation>
      ) : (
        <Link
          to={generateUrlEndpointWithSearchParams(href!, searchParams)}
          className={additionalTailwindClasses}
          onClick={onClick}
        >
          {children}
        </Link>
      )}
    </HeaderLinkContext.Provider>
  );
}
