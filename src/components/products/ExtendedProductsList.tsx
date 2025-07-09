import ProductsContextProvider from "../../store/products/ProductsContext";
import SearchCustomizationContextProvider from "../../store/products/SearchCustomizationContext";
import FetchedGames from "./FetchedGames";
import MainSearchBar from "./MainSearchBar";
import SearchCustomization from "./SearchCustomization/main";

export default function ExtendedProductsList() {
  return (
    <SearchCustomizationContextProvider>
      <ProductsContextProvider>
        <div className="flex w-full min-h-full gap-3 md:flex-row flex-col">
          <article className="w-full md:w-3/5 min-h-full md:pl-3 p-3 md:py-0 md:pr-0">
            <nav className="min-h-[10vh] w-full">
              <MainSearchBar />
            </nav>
            <FetchedGames />
          </article>
          <aside className="w-full md:w-2/5 min-h-full md:pr-3 p-3 md:pl-0 md:py-0">
            <SearchCustomization />
          </aside>
        </div>
      </ProductsContextProvider>
    </SearchCustomizationContextProvider>
  );
}
