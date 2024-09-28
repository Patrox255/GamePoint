/* eslint-disable react-refresh/only-export-components */
import {
  ErrorResponse,
  LoaderFunction,
  redirect,
  useParams,
} from "react-router-dom";

import { getGameData, queryClient } from "../lib/fetch";
import MainWrapper from "../components/structure/MainWrapper";
import Product from "../components/product/Product";
import ProductContextProvider from "../store/product/ProductContext";
import store from "../store";
import { notificationSystemActions } from "../store/UI/notificationSystemSlice";

export const loadingRequestedProductMessage =
  "Loading the requested product data...";
export const couldNotFindRequestedProductErrorMessage =
  "Requested product does not exist!";

export default function ProductPage() {
  const { productSlug } = useParams();

  return (
    <MainWrapper>
      <div className="w-3/5 flex flex-col justify-center items-center">
        <ProductContextProvider productSlug={productSlug}>
          <Product />
        </ProductContextProvider>
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
    store.dispatch(
      notificationSystemActions.ADD_NOTIFICATION({
        content: loadingRequestedProductMessage,
        rawInformationToRecognizeSameNotifications:
          loadingRequestedProductMessage,
        type: "information",
        relatedApplicationFunctionalityIdentifier:
          "fetchingProductBasedOnProvidedData",
      })
    );
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
    ) {
      store.dispatch(
        notificationSystemActions.ADD_NOTIFICATION({
          content: couldNotFindRequestedProductErrorMessage,
          type: "error",
          relatedApplicationFunctionalityIdentifier:
            "fetchingProductBasedOnProvidedData",
          rawInformationToRecognizeSameNotifications:
            couldNotFindRequestedProductErrorMessage,
        })
      );
      return redirect(previousPagePathName || "/");
    }
  }
  return null;
};
