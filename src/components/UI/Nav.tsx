/* eslint-disable react-refresh/only-export-components */
import { Link, useLocation } from "react-router-dom";
import { memo, useCallback, useContext, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";

import Button from "./Button";
import NavSearchBar from "../main/nav/NavSearchBar";
import { actions } from "../../store/mainSearchBarSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxStore";
import generateInitialStateFromSearchParamsOrSessionStorage from "../../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import { ModalContext } from "../../store/ModalContext";
import Logo from "./Logo";
import { logout, queryClient } from "../../lib/fetch";
import DropDownMenuWrapper from "./DropDownMenu/DropDownMenuWrapper";
import UserSVG from "./svg/UserSVG";
import DropDownMenuDroppedElementsContainer from "./DropDownMenu/DropDownMenuDroppedElementsContainer";
import NavUserPanelLink from "../main/nav/NavUserPanelLink";
import AnimatedSVG from "./svg/AnimatedSVG";
import svgPathBase from "./svg/svgPathBase";
import properties from "../../styles/properties";
import { HeaderLinkSearchParamsContextProvider } from "./headers/HeaderLinkOrHeaderAnimation";
import useCreateHelperFunctionsRelatedToNotificationManagement from "../../hooks/notificationSystemRelated/useCreateHelperFunctionsRelatedToNotificationManagement";

let initialRender = true;

export type possibleUserPanelParams = "orders" | "contact" | "admin" | "logout";

export interface IUserPanelEntry {
  header: string;
  userPanelParam: possibleUserPanelParams;
  enabled?: boolean;
  actionOnClick?: () => void;
  adminRestricted?: boolean;
}

export const userPanelEntries: IUserPanelEntry[] = [
  { header: "Your Orders", userPanelParam: "orders" },
  { header: "Contact Information", userPanelParam: "contact" },
  { header: "Admin Panel", userPanelParam: "admin", adminRestricted: true },
  { header: "Log out", userPanelParam: "logout" },
] as const;

const Nav = memo(() => {
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const query = generateInitialStateFromSearchParamsOrSessionStorage(
    "",
    searchParams,
    "query",
    false,
    null
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!initialRender) return;
    initialRender = false;
    if (query === null) return;
    dispatch(actions.setSearchTerm(query));
  }, [dispatch, query]);

  const { setLoginModalOpen } = useContext(ModalContext);
  const isLogged =
    useAppSelector((state) => state.userAuthSlice.login) !== undefined;
  const {
    generateLoadingInformationNotificationStable,
    generateSuccessNotificationStable,
    generateErrorNotificationInCaseOfQueryErrStable,
  } = useCreateHelperFunctionsRelatedToNotificationManagement("logout");
  const { mutate } = useMutation({
    mutationFn: () => logout(),
    onMutate: () =>
      generateLoadingInformationNotificationStable("Logging out..."),
    onSuccess: () => {
      generateSuccessNotificationStable("Logged out!");
      queryClient.invalidateQueries({ queryKey: ["userAuth"] });
    },
    onError: (err) => {
      generateErrorNotificationInCaseOfQueryErrStable(err);
      window.location.reload();
    }, // had to do this in case of an error related to logout because only invalidating userAuth key query won't do anything as
    // when logout fails also result of this response doesn't change so that won't trigger any change in state nor reevaluation of the logic in RootLayout
  });

  const { login, isAdmin, isLoading } = useAppSelector(
    (state) => state.userAuthSlice
  );

  const stableMutateFn = useCallback(() => mutate(), [mutate]);
  const isOnUserPanelPage = pathname.startsWith("/user");

  const userPanelLinks = useMemo<IUserPanelEntry[]>(() => {
    return userPanelEntries
      .map((userPanelEntry) => ({
        ...userPanelEntry,
        enabled:
          userPanelEntry.userPanelParam !== "logout" && isOnUserPanelPage
            ? false
            : userPanelEntry.adminRestricted
            ? isAdmin
            : undefined,
        actionOnClick:
          userPanelEntry.userPanelParam === "logout"
            ? stableMutateFn
            : undefined,
      }))
      .filter((entry) => entry.enabled === undefined || entry.enabled);
  }, [isAdmin, isOnUserPanelPage, stableMutateFn]);

  const showSearchBar = !pathname.includes("verify-email");
  const { cart } = useAppSelector((state) => state.cartSlice);
  const cartTotalQuantity = cart
    ? cart.reduce((quantity, product) => quantity + product.quantity, 0)
    : undefined;

  const userRelatedElement = isLoading ? undefined : !isLogged ? (
    <Button onClick={() => setLoginModalOpen(true)}>Log in</Button>
  ) : (
    <DropDownMenuWrapper widthTailwindClass="w-auto">
      <Button>
        {/* <LinkToDifferentPageWithCurrentPageInformation
          to="/user/panel"
          className="w-full h-full block"
        > */}
        <div className="flex items-center justify-center">
          <UserSVG className="w-8 h-8" />
          {login}
        </div>
        {/* </LinkToDifferentPageWithCurrentPageInformation> */}
      </Button>
      <DropDownMenuDroppedElementsContainer
        customPaddingsTailwindClasses={{ px: "0" }}
      >
        <ul className="user-panel-nav w-full flex flex-col gap-6 text-center">
          {userPanelLinks.map((userPanelLink) => (
            <HeaderLinkSearchParamsContextProvider
              otherSearchParams={{
                panelSection: userPanelLink.userPanelParam,
              }}
              key={userPanelLink.header}
            >
              <NavUserPanelLink
                header={userPanelLink.header}
                actionOnClick={userPanelLink.actionOnClick}
              />
            </HeaderLinkSearchParamsContextProvider>
          ))}
        </ul>
      </DropDownMenuDroppedElementsContainer>
    </DropDownMenuWrapper>
  );

  return (
    <nav
      className={`w-full h-[15vh] flex items-center justify-between pt-6 pb-3 fixed top-0 left-0 z-10 bg-bodyBg opacity-80 hover:opacity-100 transition-all duration-1000`}
    >
      <header className="w-1/5 px-6 text-4xl text-highlightRed font-bold tracking-widest">
        <Logo />
      </header>
      <div className="px-6 flex justify-end gap-3 w-4/5 items-center h-full">
        {pathname !== "/products" && (
          <>
            {showSearchBar && (
              <DropDownMenuWrapper>
                <NavSearchBar placeholder="Look for a game" />
              </DropDownMenuWrapper>
            )}
            <Link to="/products">
              <Button>Advanced Search</Button>
            </Link>
          </>
        )}
        {userRelatedElement}
        {cart && (
          <Link to="/cart">
            <AnimatedSVG
              svgPath={svgPathBase.cartSVG}
              additionalTailwindClasses="w-12"
              defaultFill={properties.bodyBg}
              useVariants={true}
            >
              {cartTotalQuantity ? (
                <motion.span className="cart-total-quantity self-end cursor-default">
                  {cartTotalQuantity}
                </motion.span>
              ) : undefined}
            </AnimatedSVG>
          </Link>
        )}
      </div>
    </nav>
  );
});

export default Nav;
