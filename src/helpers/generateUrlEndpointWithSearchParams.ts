export default function generateUrlEndpointWithSearchParams(
  url: string,
  searchParams: {
    [key: string]: number | string | undefined;
  }
) {
  return `${url}?${[...Object.entries(searchParams)]
    .filter((entry) => entry[1] !== undefined)
    .map(
      (entry) =>
        `${entry[0]}=${
          typeof entry[1] === "number"
            ? isNaN(entry[1])
              ? ""
              : entry[1]
            : entry[1]
        }`
    )
    .join("&")}`;
}
