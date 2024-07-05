import { Link, useLocation } from "react-router-dom";
import Button from "./Button";
import logo from "../../assets/logo.png";
import { memo } from "react";
import NavSearchBar from "../main/nav/NavSearchBar";
import createUrlWithCurrentSearchParams from "../../helpers/createUrlWithCurrentSearchParams";
import { actions } from "../../store/mainSearchBarSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxStore";

// export const NavSearchBarContext = createContext<{
//   searchTerm: string;
//   setSearchTerm: (payload: string) => void;
// }>({
//   searchTerm: "",
//   setSearchTerm: () => {},
// });

let initialRender = true;

const Nav = memo(() => {
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const query = searchParams.get("query");
  // const [searchTerm, setSearchTerm] = useState<string>(() => {
  //   console.log(1);
  //   return query || "";
  // });

  // console.log("RENDER");
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector(
    (state) => state.mainSearchBarSlice.searchTerm
  );
  if (initialRender && query !== null) {
    initialRender = false;
    dispatch(actions.setSearchTerm(query));
  }

  // console.log(searchTerm, query);
  // useEffect(() => {
  //   if (query !== null && searchTerm !== query) setSearchTerm(query);
  // }, [query]);

  return (
    <nav
      className={`w-full h-[15vh] flex items-center justify-between pt-6 pb-3 fixed top-0 left-0 z-10 bg-bodyBg opacity-80 hover:opacity-100 transition-all duration-1000`}
    >
      <header className="w-1/5 px-6 text-4xl text-highlightRed font-bold tracking-widest">
        <Link
          to={createUrlWithCurrentSearchParams({ searchParams, pathname: "/" })}
          className="w-4/12 block"
        >
          <img
            src={logo}
            alt="G letter with a gamepad next to it"
            className="w-full space rounded-[100px]"
          />
        </Link>
      </header>
      <div className="px-6 flex justify-end gap-3 w-4/5 items-center h-full">
        {pathname !== "/products" && (
          <>
            {/* <NavSearchBarContext.Provider
              value={{
                searchTerm,
                setSearchTerm: dispatch(actions.setSearchTerm),
              }}
            > */}
            <NavSearchBar placeholder="Look for a game" />
            {/* </NavSearchBarContext.Provider> */}
            <Link to={`/products?query=${searchTerm}`}>
              <Button>Advanced Search</Button>
            </Link>
          </>
        )}
        <Button>Log in</Button>
      </div>
    </nav>
  );
});

export default Nav;
