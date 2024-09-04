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
  searchParamsEntriesToOverride?: object;
}) {
  const leftSearchParamsEntriesToOverride = searchParamsEntriesToOverride
    ? Object.entries(searchParamsEntriesToOverride)
    : [];

  const readSearchParamsEntries = [...searchParams.entries()].map(
    (searchParamEntry) => {
      const leftSearchParamsEntriesToOverrideDesiredEntryIndex =
        leftSearchParamsEntriesToOverride.findIndex(
          (leftSearchParamsEntriesToOverrideEntry) =>
            leftSearchParamsEntriesToOverrideEntry[0] === searchParamEntry[0]
        );
      const searchParamValue =
        leftSearchParamsEntriesToOverrideDesiredEntryIndex !== -1
          ? JSON.stringify(
              leftSearchParamsEntriesToOverride[
                leftSearchParamsEntriesToOverrideDesiredEntryIndex
              ]
            )
          : searchParamEntry[1];
      if (leftSearchParamsEntriesToOverrideDesiredEntryIndex)
        leftSearchParamsEntriesToOverride.splice(
          leftSearchParamsEntriesToOverrideDesiredEntryIndex,
          1
        );
      return `${searchParamEntry[0]}=${searchParamValue}`;
    }
  );

  console.log(readSearchParamsEntries, leftSearchParamsEntriesToOverride);

  return `${pathname ? pathname : location?.pathname}?${[
    readSearchParamsEntries,
    leftSearchParamsEntriesToOverride.map(
      (leftSearchParamsEntriesToOverrideEntry) =>
        `${leftSearchParamsEntriesToOverrideEntry[0]}=${JSON.stringify(
          leftSearchParamsEntriesToOverrideEntry[1]
        )}`
    ),
  ].join("&")}`;
}
