import { cloneDeepWith } from "lodash";

export const validateJSONValue = <T>(
  JSONValue: string | null,
  initialState: T,
  stateIsAnObjectWithPossibleNaNPropertyValues: boolean = false
) => {
  let result;
  try {
    result = JSON.parse(JSONValue!);
    if (
      typeof result !== typeof initialState ||
      (typeof initialState === "object" && result === null)
    )
      throw "";
  } catch (e) {
    return false;
  }
  if (
    typeof result === "object" &&
    stateIsAnObjectWithPossibleNaNPropertyValues
  )
    // for (const [key, value] of Object.entries(result)) {
    //   if (value === null) result[key] = NaN;
    // }
    result = cloneDeepWith(result, (value) => (value === null ? NaN : value));
  return result;
};

export default function generateInitialStateFromSearchParamsOrSessionStorage<T>(
  initialState: T,
  searchParams: URLSearchParams,
  stateName: string,
  stateIsAnObjectWithPossibleNaNPropertyValues: boolean = false,
  valueToReturnInCaseOfLackOfSuchSearchParamOrSessionStorageValue?: unknown,
  useSearchParams: boolean = true,
  storageType: "session" | "local" = "session"
) {
  const [searchParamsValue, sessionStorageValue] = Array.from(
    { length: 2 },
    () => null
  ).map((_, i) =>
    validateJSONValue(
      i === 0
        ? searchParams.get(stateName)!
        : storageType === "session"
        ? sessionStorage.getItem(stateName)!
        : localStorage.getItem(stateName)!,
      initialState,
      stateIsAnObjectWithPossibleNaNPropertyValues
    )
  );
  if (searchParamsValue !== false && useSearchParams) return searchParamsValue;
  if (sessionStorageValue !== false) return sessionStorageValue;
  return valueToReturnInCaseOfLackOfSuchSearchParamOrSessionStorageValue !==
    undefined
    ? valueToReturnInCaseOfLackOfSuchSearchParamOrSessionStorageValue
    : initialState;
}
