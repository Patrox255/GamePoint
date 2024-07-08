import FetchedGames from "../components/products/FetchedGames";
import MainSearchBar from "../components/products/MainSearchBar";
import SearchCustomization from "../components/products/SearchCustomization/main";
import MainWrapper from "../components/structure/MainWrapper";
import ProductsContextProvider from "../store/ProductsContext";
import SearchCustomizationContextProvider from "../store/SearchCustomizationContext";

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
