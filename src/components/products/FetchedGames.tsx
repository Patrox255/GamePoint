import { useContext } from "react";
import { ProductsContext } from "../../store/products/ProductsContext";
import Error from "../UI/Error";
import LoadingFallback from "../UI/LoadingFallback";
import GamesResults from "../main/nav/GamesResults";
import OrderCustomization from "../UI/OrderCustomization";
import PagesElement from "../UI/PagesElement";
import { SearchCustomizationContext } from "../../store/products/SearchCustomizationContext";
import { MAX_GAMES_PER_PAGE } from "../../lib/config";

const appropriateDisplayNamesForGamesOrderEntries = {
  popularity: "Popularity",
  price: "Price",
  title: "Title",
};

export default function FetchedGames() {
  const {
    isError,
    isLoading,
    games,
    error,
    pageNr,
    setPageNr,
    totalGamesAmountForQuery,
  } = useContext(ProductsContext);

  console.log(totalGamesAmountForQuery);

  const {
    orderCustomizationState: orderCustomizationStateStable,
    orderCustomizationDispatch,
  } = useContext(SearchCustomizationContext);

  let content;
  const showGames = games && Array.isArray(games) && !isLoading && !isError;
  if (isError) content = <Error message={error?.message} />;
  else if (isLoading || pageNr === null) content = <LoadingFallback />;
  else if (showGames && games.length !== 0)
    content = (
      <>
        <GamesResults games={games} largeFormat>
          <OrderCustomization
            orderCustomizationObjStable={orderCustomizationStateStable}
            appropriateDisplayNamesEntriesStable={
              appropriateDisplayNamesForGamesOrderEntries
            }
            orderCustomizationDispatch={orderCustomizationDispatch}
          />
        </GamesResults>
        <nav className="pages py-8">
          <PagesElement
            propPageNr={pageNr}
            propSetPageNr={setPageNr}
            totalAmountOfElementsToDisplayOnPages={totalGamesAmountForQuery}
            amountOfElementsPerPage={MAX_GAMES_PER_PAGE}
          />
        </nav>
      </>
    );
  else if (showGames && games.length === 0)
    content = <p>No games match the provided requirements</p>;

  return (
    <div
      className={`results-container min-h-[90vh] flex justify-${
        showGames && games.length !== 0 ? "between" : "center"
      } items-center w-full ${showGames ? "flex-col" : ""}`}
    >
      {content}
    </div>
  );
}
