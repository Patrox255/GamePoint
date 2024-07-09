import { useRef } from "react";

export default function useCompareComplexForUseMemo<T>(val: T) {
  const ref = useRef<T>();

  if (!ref.current) ref.current = val;
  else {
    if (typeof val !== "object" && val !== ref) ref.current = val;
    let isSame = true;
    if (Array.isArray(val)) {
      if ((val as unknown[]).length !== (ref.current as unknown[]).length)
        isSame = false;
      val.forEach((arrValue) => {
        if (!(ref.current as unknown[])?.includes(arrValue)) isSame = false;
      });
    } else {
      [...Object.entries(val as object)].forEach((valEntry) => {
        const refEntryEquivalentOfValEntry = [
          ...Object.entries(ref.current!),
        ].find((refEntry) => refEntry[0] === valEntry[0]);
        if (
          !refEntryEquivalentOfValEntry ||
          refEntryEquivalentOfValEntry[1] !== valEntry[1]
        )
          isSame = false;
      });
    }
    if (!isSame) ref.current = val;
  }
  return ref.current;
}
