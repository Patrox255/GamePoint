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
import ExtendedGamePreview, {
  IExtendedGamePreviewGameArg,
} from "../components/products/ExtendedGamePreview";
import useCompareComplexForUseMemo from "../hooks/useCompareComplexForUseMemo";
import { IGame } from "../models/game.model";

export default function ProductPage() {
  const { productSlug } = useParams();

  const { data, error } = useQuery({
    queryFn: ({ signal }) =>
      getGameData<IExtendedGamePreviewGameArg>({
        signal,
        productSlug: productSlug!,
      }),
    queryKey: ["games", productSlug],
  });

  const gameStable = useCompareComplexForUseMemo(
    data && data.data ? data.data : {}
  );

  let content;
  if (error) content = <Error message={error.message} />;
  if (data && data.data) {
    content = (
      <ExtendedGamePreview
        game={gameStable as IExtendedGamePreviewGameArg}
        key={`product-${(gameStable as IGame).slug}`}
      />
    );
  }

  return (
    <MainWrapper>
      <div className="w-3/5 flex flex-col justify-center items-center">
        {content}
      </div>
    </MainWrapper>
  );
}

export const loader: LoaderFunction = async function ({ params, request }) {
  const searchParams = new URLSearchParams(
    request.url.slice(request.url.lastIndexOf("?") + 1)
  );
  const previousPagePathName = searchParams.get("previousPagePathName");
  const productSlug = params.productSlug;
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
