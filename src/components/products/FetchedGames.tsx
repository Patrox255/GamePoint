import { useContext } from "react";
import { ProductsContext } from "../../store/ProductsContext";
import Error from "../UI/Error";
import LoadingFallback from "../UI/LoadingFallback";

export default function FetchedGames() {
  const { isError, isLoading, games, error } = useContext(ProductsContext);

  let content;
  if (isError) content = <Error message={error?.message} />;
  if (isLoading) content = <LoadingFallback />;
  if (games && Array.isArray(games) && games.length !== 0)
    content = <p>{JSON.stringify(games)}</p>;
  else if (games.length === 0)
    content = <p>No games match the provided requirements</p>;

  return (
    <div className="results-container min-h-[90vh] flex justify-center items-center w-full">
      {content}
    </div>
  );
}
