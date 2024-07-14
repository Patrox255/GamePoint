import { useContext } from "react";
import { ProductsContext } from "../../store/products/ProductsContext";
import Error from "../UI/Error";
import LoadingFallback from "../UI/LoadingFallback";
import GamesResults from "../main/nav/GamesResults";
import OrderCustomization from "./SearchCustomization/OrderCustomization";
import PagesElement from "../UI/PagesElement";

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

  let content;
  const showGames = games && Array.isArray(games) && !isLoading && !isError;
  if (isError) content = <Error message={error?.message} />;
  else if (isLoading || pageNr === null) content = <LoadingFallback />;
  else if (showGames && games.length !== 0)
    content = (
      <>
        <GamesResults games={games} largeFormat>
          <OrderCustomization />
        </GamesResults>
        <nav className="pages py-8">
          <PagesElement
            propPageNr={pageNr}
            propSetPageNr={setPageNr}
            totalAmountOfElementsToDisplayOnPages={totalGamesAmountForQuery}
            amountOfElementsPerPage={10}
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
