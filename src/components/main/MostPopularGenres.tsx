import LoadingFallback from "../UI/LoadingFallback";
import Error from "../UI/Error";
import TagsComponent from "../game/tags/TagsComponent";
import AnimatedAppearance from "../UI/AnimatedAppearance";
import useQueryGetTheMostPopularTags from "../../hooks/searchCustomizationRelated/useQueryGetTheMostPopularTags";
import { useContext } from "react";
import { DelayGenresAppearanceToTheFirstGameImageContext } from "../../store/mainPage/DelayGenresRenderToTheFirstGameImageContext";

export default function MostPopularGenres() {
  const { isLoading, isError, error, data } =
    useQueryGetTheMostPopularTags("genres");

  const { finishedLoading } = useContext(
    DelayGenresAppearanceToTheFirstGameImageContext
  );

  return (
    <article className="popular-genres-container w-1/2 flex justify-center flex-col text-center gap-4">
      <AnimatedAppearance>
        <h1 className="text-highlightRed text-4xl py-4">
          Browse some trending genres
        </h1>
        {(isLoading || !finishedLoading) && <LoadingFallback />}
        {isError && <Error message={error?.message} />}

        {data && finishedLoading && (
          <AnimatedAppearance>
            <TagsComponent
              tags={data.data.map((genreObj) => genreObj.name).slice(0, 10)!}
              paramName="genre"
            />
          </AnimatedAppearance>
        )}
      </AnimatedAppearance>
    </article>
  );
}
