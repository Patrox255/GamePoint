import { isEqual } from "lodash";
import { useRef } from "react";

export function are2ObjectsEqualTopLevel(obj1: object, obj2: object) {
  let isSame = true;

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) isSame = false;
    obj1.forEach((arr1Elem) => {
      if (!obj2.includes(arr1Elem)) isSame = false;
    });
  } else
    [...Object.entries(obj1)].forEach((obj1Entry) => {
      const obj2EquivalentOfObj1Entry = [...Object.entries(obj2)].find(
        (obj2Entry) => obj2Entry[0] === obj1Entry[0]
      );
      if (
        !obj2EquivalentOfObj1Entry ||
        (!isNaN(obj2EquivalentOfObj1Entry[1]) &&
          obj2EquivalentOfObj1Entry[1] !== obj1Entry[1]) ||
        (isNaN(obj2EquivalentOfObj1Entry[1]) && !isNaN(obj1Entry[1]))
      )
        isSame = false;
    });
  return isSame;
}

export default function useCompareComplexForUseMemo<T>(val: T) {
  const ref = useRef<T>();

  if (!ref.current) ref.current = val;
  if (
    (typeof val !== "object" && val !== ref) ||
    !isEqual(val as object, ref.current!)
  )
    ref.current = val;

  return ref.current;
}
