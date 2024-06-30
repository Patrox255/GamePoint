/* eslint-disable react-refresh/only-export-components */
import { Suspense } from "react";
import { API_URL } from "../../lib/config";
import { getJSON } from "../../lib/fetch";
import DataSlider from "./slider/DataSlider";
import { Await, defer, useLoaderData } from "react-router-dom";
import Error from "../UI/Error";
import { IGame } from "../../models/game.model";
import SliderProductElement from "./slider/SliderProductElement";
import Spinner from "../UI/Spinner";

export default function MostPopularGames() {
  const loaderData = useLoaderData() as { products: Promise<IGame[]> };

  return (
    <article className="flex flex-col justify-center items-center py-12 w-full">
      <h1 className="text-highlightRed text-4xl pb-3">
        Check out the most popular games currently
      </h1>
      <Suspense
        fallback={
          <>
            <p className="pb-4">Getting games data...</p>
            <Spinner />
          </>
        }
      >
        <Await resolve={loaderData.products}>
          {(result: {
            data?: IGame[];
            error?: { messsage: string; status: number };
          }) =>
            result.error ? (
              <Error
                message={result.error.messsage}
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

export const load10MostPopularProducts = async () => {
  const data = await getJSON(`${API_URL}/products`);
  console.log(data);
  return data;
};

export const loader = async () => {
  try {
    return defer({ products: load10MostPopularProducts() });
  } catch (err) {
    return { error: err };
  }
};
