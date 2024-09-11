import ProductsContextProvider from "../../store/products/ProductsContext";
import SearchCustomizationContextProvider from "../../store/products/SearchCustomizationContext";
import FetchedGames from "./FetchedGames";
import MainSearchBar from "./MainSearchBar";
import SearchCustomization from "./SearchCustomization/main";

export default function ExtendedProductsList() {
  return (
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
  );
}
