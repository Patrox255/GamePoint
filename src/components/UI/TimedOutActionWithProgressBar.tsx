import { useEffect, useState } from "react";

export default function TimedOutActionWithProgressBar({
  action,
  timeBeforeFiringAnAction,
  negativeResult = false,
  darkerBg = false,
}: {
  action: () => void;
  timeBeforeFiringAnAction: number;
  negativeResult?: boolean;
  darkerBg?: boolean;
}) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (timeElapsed >= timeBeforeFiringAnAction) return action();

    const timer = setInterval(
      () => setTimeElapsed((oldTimeElapsed) => oldTimeElapsed + 10),
      10
    );

    return () => clearInterval(timer);
  }, [action, timeBeforeFiringAnAction, timeElapsed]);

  return (
    <progress
      max={timeBeforeFiringAnAction}
      value={timeElapsed}
      className={`${negativeResult ? "red-indicator " : ""}${
        darkerBg ? "darkerBg " : ""
      }w-full mt-3 bg-bodyBg h-1`}
    ></progress>
  );
}
