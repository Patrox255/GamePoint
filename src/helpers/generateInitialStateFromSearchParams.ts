export default function generateInitialStateFromSearchParams<T>(
  initialState: T,
  searchParamValue: string | null,
  stateIsAnObjectWithPossibleNaNPropertyValues: boolean = false
) {
  let initialStateFromParams;

  try {
    initialStateFromParams = JSON.parse(searchParamValue!);
    if (
      typeof initialStateFromParams !== typeof initialState ||
      (typeof initialState === "object" && initialStateFromParams === null)
    )
      throw "";
  } catch (e) {
    initialStateFromParams = initialState;
  }
  if (
    typeof initialStateFromParams === "object" &&
    stateIsAnObjectWithPossibleNaNPropertyValues
  )
    for (const [key, value] of Object.entries(initialStateFromParams)) {
      if (value === null) initialStateFromParams[key] = NaN;
    }
  return initialStateFromParams;
}
