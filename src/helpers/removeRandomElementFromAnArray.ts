import { random } from "lodash";

export default function removeRandomElementFromAnArray<T>(arr: T[]) {
  const indexToRemove = random(arr.length - 1);
  return arr.filter((_, i) => i !== indexToRemove);
}
