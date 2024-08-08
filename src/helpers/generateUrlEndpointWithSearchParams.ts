export interface ISearchParamsToAddToURL {
  [key: string]: unknown;
}

export default function generateUrlEndpointWithSearchParams(
  url: string,
  searchParams?: ISearchParamsToAddToURL
) {
  return `${url}${
    searchParams
      ? `?${[...Object.entries(searchParams)]
          .filter((entry) => entry[1] !== undefined)
          .map(
            (entry) =>
              `${entry[0]}=${
                typeof entry[1] === "number"
                  ? isNaN(entry[1])
                    ? ""
                    : JSON.stringify(entry[1])
                  : JSON.stringify(entry[1])
              }`
          )
          .join("&")}`
      : ""
  }`;
}
