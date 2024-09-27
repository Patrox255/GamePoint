import { AnimationProps, HoverHandlers } from "framer-motion";
import { createContext, ReactNode, useContext } from "react";
import { Link } from "react-router-dom";
import properties from "../../../styles/properties";
import generateUrlEndpointWithSearchParams, {
  ISearchParamsToAddToURL,
} from "../../../helpers/generateUrlEndpointWithSearchParams";

export const HeaderLinkContext = createContext<{
  headerAnimationProps: AnimationProps & HoverHandlers;
  disabled: boolean;
}>({ headerAnimationProps: {}, disabled: false });

export const HeaderLinkSearchParamsContext = createContext<{
  otherSearchParams: ISearchParamsToAddToURL;
}>({ otherSearchParams: {} });

export function HeaderLinkSearchParamsContextProvider({
  otherSearchParams,
  children,
}: {
  children: ReactNode;
  otherSearchParams: ISearchParamsToAddToURL;
}) {
  return (
    <HeaderLinkSearchParamsContext.Provider value={{ otherSearchParams }}>
      {children}
    </HeaderLinkSearchParamsContext.Provider>
  );
}

export default function HeaderLinkOrHeaderAnimation({
  href,
  children,
  searchParams,
  additionalTailwindClasses = "",
  sendCurrentPageInformation = false,
  onlyAnimation = false,
  onClick,
  disabled = false,
  customWhileHoverColor = "highlightRed",
}: {
  href?: string;
  children: ReactNode;
  searchParams?: { [key: string]: unknown };
  additionalTailwindClasses?: string;
  sendCurrentPageInformation?: boolean;
  onlyAnimation?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  customWhileHoverColor?: keyof typeof properties;
}) {
  const { otherSearchParams } = useContext(HeaderLinkSearchParamsContext);

  return (
    <HeaderLinkContext.Provider
      value={{
        headerAnimationProps: {
          initial: { color: properties.defaultFont },
          whileHover: !disabled
            ? { color: properties[customWhileHoverColor] }
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
        <Link
          to={generateUrlEndpointWithSearchParams(
            href!,
            [...Object.entries(otherSearchParams)].length !== 0
              ? otherSearchParams
              : undefined
          )}
        >
          {children}
        </Link>
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
