import LoadingFallback from "../UI/LoadingFallback";
import Error from "../UI/Error";
import TagsComponent from "../game/tags/TagsComponent";
import AnimatedAppearance from "../UI/AnimatedAppearance";
import useQueryGetTheMostPopularGenres from "../../hooks/useQueryGetTheMostPopularGenres";

export default function MostPopularGenres() {
  const { isLoading, isError, error, data } = useQueryGetTheMostPopularGenres();

  return (
    <article className="popular-genres-container w-1/2 flex justify-center flex-col text-center gap-4">
      <AnimatedAppearance>
        <h1 className="text-highlightRed text-4xl py-4">
          Browse some trending genres
        </h1>
        {isLoading && <LoadingFallback />}
        {isError && <Error message={error?.message} />}

        {data && (
          <TagsComponent
            tags={data.data.map((genreObj) => genreObj.name).slice(0, 10)!}
            paramName="genre"
          />
        )}
      </AnimatedAppearance>
    </article>
  );
}
