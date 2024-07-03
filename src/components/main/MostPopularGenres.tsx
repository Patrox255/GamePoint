import { load10MostPopularGenres } from "../../lib/fetch";
import LoadingFallback from "../UI/LoadingFallback";
import Error from "../UI/Error";
import TagsComponent from "../game/tags/TagsComponent";
import { useQuery } from "@tanstack/react-query";

export default function MostPopularGenres() {
  const { isLoading, data, error, isError } = useQuery({
    queryFn: ({ signal }) => load10MostPopularGenres(signal),
    queryKey: ["games", "genres"],
    staleTime: 2000,
  });

  return (
    <article className="popular-genres-container w-1/2 flex justify-center flex-col text-center gap-4">
      <h1 className="text-highlightRed text-4xl">
        Browse some trending genres
      </h1>
      {isLoading && <LoadingFallback />}
      {isError && <Error message={error.message} />}

      {data && (
        <TagsComponent
          tags={data.data.map((genreObj) => genreObj.name).slice(0, 10)!}
          paramName="genre"
        />
      )}
    </article>
  );
}
