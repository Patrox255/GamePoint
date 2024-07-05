import { useEffect } from "react";

export default function useDebouncing(
  fn: () => void,
  shouldCall: boolean = true,
  time: number = 2000
) {
  useEffect(() => {
    if (!shouldCall) return;
    const timer = setTimeout(fn, time);

    return () => {
      clearTimeout(timer);
    };
  }, [fn, shouldCall, time]);
}
