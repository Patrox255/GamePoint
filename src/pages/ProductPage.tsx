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
import ExtendedGamePreview from "../components/products/ExtendedGamePreview";

export default function ProductPage() {
  const { productSlug } = useParams();

  const { data, error } = useQuery({
    queryFn: ({ signal }) => getGameData({ signal, productSlug: productSlug! }),
    queryKey: ["games", productSlug],
  });

  let content;
  if (error) content = <Error message={error.message} />;
  if (data && data.data) {
    const game = data.data;
    content = <ExtendedGamePreview game={game} />;
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
