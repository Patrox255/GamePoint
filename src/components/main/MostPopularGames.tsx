/* eslint-disable react-refresh/only-export-components */
import DataSlider from "./slider/DataSlider";
import Error from "../UI/Error";
import SliderProductElement from "./slider/SliderProductElement";
import LoadingFallback from "../UI/LoadingFallback";
import { useQuery } from "@tanstack/react-query";
import { load10MostPopularGames } from "../../lib/fetch";

export default function MostPopularGames() {
  const { error, isError, data, isLoading } = useQuery({
    queryKey: ["games", "most-popular"],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      load10MostPopularGames(signal),
    staleTime: 2000,
  });

  return (
    <article className="flex flex-col justify-center items-center py-12 w-full text-center">
      <h1 className="text-highlightRed md:text-4xl text-xl px-2">
        Check out the most popular games currently
      </h1>
      {isLoading && <LoadingFallback />}
      {isError && <Error message={error.message} />}
      {data && (
        <DataSlider elements={data.data}>
          <SliderProductElement elements={data.data} />
        </DataSlider>
      )}
    </article>
  );
}
