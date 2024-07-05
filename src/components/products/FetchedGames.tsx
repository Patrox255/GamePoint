import { useContext } from "react";
import { ProductsContext } from "../../store/ProductsContext";
import Error from "../UI/Error";
import LoadingFallback from "../UI/LoadingFallback";
import GamesResults from "../main/nav/GamesResults";
import { motion } from "framer-motion";
import properties from "../../styles/properties";

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

  const PageNrToSelect = function ({
    pageNr,
    active = false,
  }: {
    pageNr: number;
    active?: boolean;
  }) {
    return (
      <motion.li
        className={active ? "text-highlightRed" : "cursor-pointer"}
        initial={!active ? { color: properties.defaultFont } : undefined}
        whileHover={
          !active
            ? {
                color: properties.highlightRed,
              }
            : undefined
        }
        onClick={!active ? () => setPageNr(pageNr) : undefined}
      >
        {pageNr + 1}
      </motion.li>
    );
  };
  console.log(totalGamesAmountForQuery);
  console.log(pageNr);

  let content;
  const maxPageNr =
    totalGamesAmountForQuery === null
      ? null
      : Math.ceil(totalGamesAmountForQuery / 10) === 0
      ? 0
      : Math.ceil(totalGamesAmountForQuery / 10) - 1;
  console.log(maxPageNr);
  const showGames = games && Array.isArray(games) && !isLoading && !isError;
  if (isError) content = <Error message={error?.message} />;
  else if (isLoading || pageNr === null) content = <LoadingFallback />;
  else if (showGames && games.length !== 0)
    content = (
      <>
        <GamesResults games={games} largeFormat />
        <nav className="pages py-8">
          <ul className="flex justify-center items-center gap-3">
            {pageNr - 2 <= 0 ? (
              Array.from({ length: pageNr }, (_, i) => (
                <PageNrToSelect pageNr={i} key={i}></PageNrToSelect>
              ))
            ) : (
              <>
                <PageNrToSelect pageNr={0} key={0}></PageNrToSelect>
                ...
                <PageNrToSelect
                  pageNr={pageNr - 1}
                  key={pageNr - 1}
                ></PageNrToSelect>
              </>
            )}
            <PageNrToSelect
              pageNr={pageNr}
              key={pageNr}
              active
            ></PageNrToSelect>
            {pageNr + 2 >= maxPageNr! ? (
              Array.from({ length: maxPageNr! - pageNr }, (_, i) => (
                <PageNrToSelect
                  pageNr={i + pageNr + 1}
                  key={i + pageNr + 1}
                ></PageNrToSelect>
              ))
            ) : (
              <>
                <PageNrToSelect
                  pageNr={pageNr + 1}
                  key={pageNr + 1}
                ></PageNrToSelect>
                ...
                <PageNrToSelect
                  pageNr={maxPageNr!}
                  key={maxPageNr!}
                ></PageNrToSelect>
              </>
            )}
          </ul>
        </nav>
      </>
    );
  else if (showGames && games.length === 0)
    content = <p>No games match the provided requirements</p>;

  return (
    <div
      className={`results-container min-h-[90vh] flex justify-${
        showGames ? "between" : "center"
      } items-${showGames ? "start" : "center"} w-full ${
        showGames ? "flex-col" : ""
      }`}
    >
      {content}
    </div>
  );
}
