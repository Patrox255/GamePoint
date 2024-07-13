import { useQuery } from "@tanstack/react-query";
import {
  ErrorResponse,
  LoaderFunction,
  redirect,
  useParams,
} from "react-router-dom";

import { getGameData, queryClient } from "../lib/fetch";
import MainWrapper from "../components/structure/MainWrapper";
import Error from "../components/UI/Error";
import SliderProductElementContent from "../components/main/slider/SliderProductElementContent";
import Button from "../components/UI/Button";
import PagesElement from "../components/UI/PagesElement";
import { useState } from "react";

export default function ProductPage() {
  const { productSlug } = useParams();

  const { data, error } = useQuery({
    queryFn: ({ signal }) => getGameData({ signal, productSlug: productSlug! }),
    queryKey: ["games", productSlug],
  });

  const [pageNr, setPageNr] = useState<number>(0);

  let content;
  if (error) content = <Error message={error.message} />;
  if (data && data.data) {
    const game = data.data;
    console.log(game);
    content = (
      <SliderProductElementContent
        element={game}
        showTags={false}
        showSummary={false}
        sliderImageOverviewFn={(
          SliderImageOverviewPrepared,
          pageNr,
          setPageNr
        ) => (
          <>
            <SliderImageOverviewPrepared
              pageNr={pageNr}
              setPageNr={setPageNr}
            />
            <PagesElement
              amountOfElementsPerPage={5}
              totalAmountOfElementsToDisplayOnPages={game.artworks.length}
              pageNr={pageNr!}
              setPageNr={(newPageNr: number) => setPageNr!(newPageNr)}
              insideSliderProductElementArtworkContext
            />
          </>
        )}
        pageNr={pageNr}
        setPageNr={setPageNr}
      >
        {(element) => (
          <Button
            onClick={() => {
              console.log(`${element.title} added to cart!`);
            }}
          >
            Add to cart
          </Button>
        )}
      </SliderProductElementContent>
    );
  }

  return (
    <MainWrapper>
      <div className="w-3/5">{content}</div>
    </MainWrapper>
  );
}

export const loader: LoaderFunction = async function ({ params, request }) {
  const searchParams = new URLSearchParams(
    request.url.slice(request.url.lastIndexOf("?") + 1)
  );
  const previousPagePathName = searchParams.get("previousPagePathName");
  const productSlug = params.productSlug;
  console.log(previousPagePathName);
  try {
    const gameData = await queryClient.fetchQuery({
      queryFn: ({ signal }) =>
        getGameData({ signal, productSlug: productSlug! }),
      queryKey: ["games", productSlug],
    });
    return gameData;
  } catch (err) {
    if (
      (err as ErrorResponse).status === 404 &&
      (err as ErrorResponse & Error).message ===
        "No such a game has been found!"
    )
      return redirect(previousPagePathName || "/");
  }
  return null;
};
