import { Location } from "react-router-dom";

export default function createUrlWithCurrentSearchParams({
  searchParams,
  pathname,
  location,
  searchParamsEntriesToOverride,
}: {
  searchParams: URLSearchParams;
  pathname?: string;
  location?: Location;
  searchParamsEntriesToOverride?: {
    [searchParamEntry: string]: unknown | false;
  }; // set searchParamEntry to false if you want to omit including this search param entry
}) {
  const leftSearchParamsEntriesToOverride = searchParamsEntriesToOverride
    ? Object.entries(searchParamsEntriesToOverride)
    : [];

  console.log([...searchParams.entries()], searchParamsEntriesToOverride);

  const readSearchParamsEntries = [...searchParams.entries()]
    .map((searchParamEntry) => {
      const leftSearchParamsEntriesToOverrideDesiredEntryIndex =
        leftSearchParamsEntriesToOverride.findIndex(
          (leftSearchParamsEntriesToOverrideEntry) =>
            leftSearchParamsEntriesToOverrideEntry[0] === searchParamEntry[0]
        );
      let searchParamValue: string;
      if (leftSearchParamsEntriesToOverrideDesiredEntryIndex !== -1) {
        const leftSearchParamsEntriesToOverrideDesiredEntryValue =
          leftSearchParamsEntriesToOverride[
            leftSearchParamsEntriesToOverrideDesiredEntryIndex
          ][1];
        leftSearchParamsEntriesToOverride.splice(
          leftSearchParamsEntriesToOverrideDesiredEntryIndex,
          1
        );
        if (leftSearchParamsEntriesToOverrideDesiredEntryValue === false)
          return false;
        searchParamValue = JSON.stringify(
          leftSearchParamsEntriesToOverrideDesiredEntryValue
        );
      } else searchParamValue = searchParamEntry[1];
      return `${searchParamEntry[0]}=${searchParamValue}`;
    })
    .filter((searchParamStr) => searchParamStr !== false);

  return `${pathname ? pathname : location?.pathname}?${[
    ...readSearchParamsEntries,
    ...leftSearchParamsEntriesToOverride.map(
      (leftSearchParamsEntriesToOverrideEntry) =>
        `${leftSearchParamsEntriesToOverrideEntry[0]}=${JSON.stringify(
          leftSearchParamsEntriesToOverrideEntry[1]
        )}`
    ),
  ].join("&")}`;
}
