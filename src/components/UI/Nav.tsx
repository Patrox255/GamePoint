import { Link, useLocation } from "react-router-dom";
import { memo, useContext } from "react";

import Button from "./Button";
import NavSearchBar from "../main/nav/NavSearchBar";
import { actions } from "../../store/mainSearchBarSlice";
import { useAppDispatch } from "../../hooks/reduxStore";
import generateInitialStateFromSearchParamsOrSessionStorage from "../../helpers/generateInitialStateFromSearchParamsOrSessionStorage";
import { ModalContext } from "../../store/ModalContext";
import Logo from "./Logo";

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
  if (initialRender && query !== null) {
    initialRender = false;
    dispatch(actions.setSearchTerm(query));
  }

  const { setLoginModalOpen } = useContext(ModalContext);

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
            <NavSearchBar placeholder="Look for a game" />
            <Link to="/products">
              <Button>Advanced Search</Button>
            </Link>
          </>
        )}
        <Button onClick={() => setLoginModalOpen(true)}>Log in</Button>
      </div>
    </nav>
  );
});

export default Nav;
