import { validateJSONValue } from "./generateInitialStateFromSearchParamsOrSessionStorage";

export default function applySearchParamsSessionStorageEntryUpdateInLoader(
  searchParams: URLSearchParams,
  expectedSearchParams: {
    searchParamName: string;
    sessionStorageEntryToUpdateName: string;
  }[]
) {
  return expectedSearchParams.some((expectedSearchParamObj) =>
    applySearchParamSessionStorageEntryUpdateInLoader(
      searchParams,
      expectedSearchParamObj
    )
  );
}

function applySearchParamSessionStorageEntryUpdateInLoader(
  searchParams: URLSearchParams,
  expectedSearchParamObj: {
    searchParamName: string;
    sessionStorageEntryToUpdateName: string;
  }
) {
  const { searchParamName, sessionStorageEntryToUpdateName } =
    expectedSearchParamObj;
  const searchParamsValue = validateJSONValue(
    searchParams.get(searchParamName),
    ""
  );
  if (!searchParamsValue) return null;
  const sessionStorageEntry = sessionStorage.getItem(
    sessionStorageEntryToUpdateName
  );
  const sessionStorageEntryParsed = sessionStorageEntry
    ? (JSON.parse(sessionStorageEntry) as string[])
    : [];
  searchParams.delete(searchParamName);
  if (sessionStorageEntryParsed.indexOf(searchParamsValue) !== -1) return true;
  sessionStorageEntryParsed.push(searchParamsValue);
  sessionStorage.setItem(
    sessionStorageEntryToUpdateName,
    JSON.stringify(sessionStorageEntryParsed)
  );
  return true;
}
