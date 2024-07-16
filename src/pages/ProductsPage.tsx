import { LoaderFunction, redirect } from "react-router-dom";
import FetchedGames from "../components/products/FetchedGames";
import MainSearchBar from "../components/products/MainSearchBar";
import SearchCustomization from "../components/products/SearchCustomization/main";
import MainWrapper from "../components/structure/MainWrapper";
import ProductsContextProvider from "../store/products/ProductsContext";
import SearchCustomizationContextProvider from "../store/products/SearchCustomizationContext";
import applySearchParamsSessionStorageEntryUpdateInLoader from "../helpers/applySearchParamsSessionStorageEntryUpdateInLoader";

export default function ProductsPage() {
  return (
    <MainWrapper>
      <SearchCustomizationContextProvider>
        <ProductsContextProvider>
          <div className="flex w-full min-h-full gap-3">
            <article className="w-3/5 min-h-full pl-3">
              <nav className="min-h-[10vh] w-full">
                <MainSearchBar />
              </nav>
              <FetchedGames />
            </article>
            <aside className="w-2/5 min-h-full pr-3">
              <SearchCustomization />
            </aside>
          </div>
        </ProductsContextProvider>
      </SearchCustomizationContextProvider>
    </MainWrapper>
  );
}

const updateSessionStorageBasedOnSearchParams: LoaderFunction = ({
  request,
}) => {
  if (request.url.indexOf("?") === -1) return null;
  const searchParams = new URLSearchParams(
    request.url.slice(request.url.indexOf("?") + 1)
  );
  const updateURL = applySearchParamsSessionStorageEntryUpdateInLoader(
    searchParams,
    [
      { searchParamName: "genre", sessionStorageEntryToUpdateName: "genres" },
      {
        searchParamName: "platform",
        sessionStorageEntryToUpdateName: "platforms",
      },
      {
        searchParamName: "developer",
        sessionStorageEntryToUpdateName: "developers",
      },
      {
        searchParamName: "publisher",
        sessionStorageEntryToUpdateName: "publishers",
      },
    ]
  );
  if (updateURL) return redirect(`/products?${searchParams.toString()}`);
  return null;
};

export { updateSessionStorageBasedOnSearchParams as loader };
