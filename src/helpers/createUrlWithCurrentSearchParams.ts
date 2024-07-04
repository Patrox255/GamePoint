import { Location } from "react-router-dom";

export default function createUrlWithCurrentSearchParams({
  searchParams,
  pathname,
  location,
}: {
  searchParams: URLSearchParams;
  pathname?: string;
  location?: Location;
}) {
  return `${pathname ? pathname : location?.pathname}?${[
    ...searchParams.entries(),
  ]
    .map((searchParamEntry) => `${searchParamEntry[0]}=${searchParamEntry[1]}`)
    .join("&")}`;
}
