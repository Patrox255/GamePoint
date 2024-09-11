/* eslint-disable react-refresh/only-export-components */
import { LoaderFunction, redirect } from "react-router-dom";

import MainWrapper from "../components/structure/MainWrapper";
import applySearchParamsSessionStorageEntryUpdateInLoader from "../helpers/applySearchParamsSessionStorageEntryUpdateInLoader";
import createSearchParamsFromRequestURL from "../helpers/createSearchParamsFromRequestURL";
import ExtendedProductsList from "../components/products/ExtendedProductsList";

export default function ProductsPage() {
  return (
    <MainWrapper>
      <ExtendedProductsList />
    </MainWrapper>
  );
}

const updateSessionStorageBasedOnSearchParams: LoaderFunction = ({
  request,
}) => {
  if (request.url.indexOf("?") === -1) return null;
  const searchParams = createSearchParamsFromRequestURL(request.url);
  if (!searchParams) return null;
  const updateURL = applySearchParamsSessionStorageEntryUpdateInLoader(
    searchParams,
    [
      { searchParamName: "genre", sessionStorageEntryToUpdateName: "genres" },
      {
        searchParamName: "platform",
        sessionStorageEntryToUpdateName: "platforms",
      },
      {
        searchParamName: "developer",
        sessionStorageEntryToUpdateName: "developers",
      },
      {
        searchParamName: "publisher",
        sessionStorageEntryToUpdateName: "publishers",
      },
    ]
  );
  if (updateURL) return redirect(`/products?${searchParams.toString()}`);
  return null;
};

export { updateSessionStorageBasedOnSearchParams as loader };
