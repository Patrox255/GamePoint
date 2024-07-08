export default function generateInitialStateFromSearchParams<T>(
  initialState: T,
  searchParamValue: string | null
) {
  let initialStateFromParams;

  try {
    initialStateFromParams = JSON.parse(searchParamValue!);
    console.log(initialState, initialStateFromParams);
    if (typeof initialStateFromParams !== typeof initialState) throw "";
  } catch (e) {
    initialStateFromParams = initialState;
  }
  return initialStateFromParams;
}
