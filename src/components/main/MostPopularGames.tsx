/* eslint-disable react-refresh/only-export-components */
import { Suspense } from "react";

import DataSlider from "./slider/DataSlider";
import { Await, useRouteLoaderData } from "react-router-dom";
import Error from "../UI/Error";
import { IGame } from "../../models/game.model";
import SliderProductElement from "./slider/SliderProductElement";
import { ILoaderResult } from "../../lib/fetch";
import LoadingFallback from "../UI/LoadingFallback";

export default function MostPopularGames() {
  const loaderData = useRouteLoaderData("root") as {
    products: Promise<ILoaderResult<IGame>>;
  };

  return (
    <article className="flex flex-col justify-center items-center py-12 w-full">
      <h1 className="text-highlightRed text-4xl">
        Check out the most popular games currently
      </h1>
      <Suspense fallback={<LoadingFallback />}>
        <Await resolve={loaderData.products}>
          {(result: ILoaderResult<IGame>) =>
            result.error ? (
              <Error
                message={result.error.message}
                status={result.error.status}
              />
            ) : (
              <DataSlider elements={result.data!}>
                <SliderProductElement elements={result.data!} />
              </DataSlider>
            )
          }
        </Await>
      </Suspense>
    </article>
  );
}
