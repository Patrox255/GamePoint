import { Await, useRouteLoaderData } from "react-router-dom";
import { IGenre } from "../../models/genre.model";
import { ILoaderResult } from "../../lib/fetch";
import { Suspense } from "react";
import LoadingFallback from "../UI/LoadingFallback";
import Error from "../UI/Error";
import TagsComponent from "../game/TagsComponent";

export default function MostPopularGenres() {
  const { popularGenres } = useRouteLoaderData("root") as {
    popularGenres: Promise<ILoaderResult<IGenre>>;
  };

  return (
    <article className="popular-genres-container w-1/2 flex justify-center flex-col text-center gap-4">
      <h1 className="text-highlightRed text-4xl">
        Browse some trending genres
      </h1>
      <Suspense fallback={<LoadingFallback />}>
        <Await resolve={popularGenres}>
          {(result: ILoaderResult<IGenre>) => {
            if (result.error) return <Error />;
            if (result.data)
              return (
                <TagsComponent
                  tags={
                    result.data.map((genreObj) => genreObj.name).slice(0, 10)!
                  }
                  paramName="genre"
                />
              );
          }}
        </Await>
      </Suspense>
    </article>
  );
}
