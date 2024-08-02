import { Link, useLocation } from "react-router-dom";
import { memo, useCallback, useContext, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";

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

let initialRender = true;

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
    if (query === null) return;
    initialRender = false;
    dispatch(actions.setSearchTerm(query));
  }, [dispatch, query]);

  const { setLoginModalOpen } = useContext(ModalContext);
  const isLogged =
    useAppSelector((state) => state.userAuthSlice.login) !== undefined;
  const { mutate } = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userAuth"] }),
    onError: () => window.location.reload(), // had to do this in case of an error related to logout because only invalidating userAuth key query won't do anything as
    // when logout fails also result of this response doesn't change so that won't trigger any change in state nor reevaluation of the logic in RootLayout
  });

  const { login, isAdmin } = useAppSelector((state) => state.userAuthSlice);

  interface IUserPanelLinkEntry {
    header: string;
    userPanelParam?: string;
    enabled?: boolean;
    actionOnClick?: () => void;
  }

  const stableMutateFn = useCallback(() => mutate(), [mutate]);

  const userPanelLinks = useMemo<IUserPanelLinkEntry[]>(() => {
    return [
      { header: "Orders", userPanelParam: "orders" },
      { header: "Contact Information", userPanelParam: "contact" },
      { header: "Admin Panel", userPanelParam: "admin", enabled: isAdmin },
      { header: "Log out", actionOnClick: stableMutateFn },
    ].filter((entry) => entry.enabled === undefined || entry.enabled);
  }, [isAdmin, stableMutateFn]);

  const showSearchBar = !pathname.includes("verify-email");

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
        {!isLogged && (
          <Button onClick={() => setLoginModalOpen(true)}>Log in</Button>
        )}
        {isLogged && (
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
                  <NavUserPanelLink
                    header={userPanelLink.header}
                    userPanelParam={userPanelLink.userPanelParam}
                    key={userPanelLink.header}
                    actionOnClick={userPanelLink.actionOnClick}
                  />
                ))}
              </ul>
            </DropDownMenuDroppedElementsContainer>
          </DropDownMenuWrapper>
        )}
      </div>
    </nav>
  );
});

export default Nav;
