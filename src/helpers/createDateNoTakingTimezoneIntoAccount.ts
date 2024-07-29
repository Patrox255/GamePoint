export default function createDateNoTakingTimezoneIntoAccount({
  year,
  month,
  day,
  omitTimeInCurrentDate = true,
}: {
  year?: number;
  month?: number;
  day?: number;
  omitTimeInCurrentDate?: boolean;
}) {
  if (!year) {
    const now = new Date();
    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        ...(omitTimeInCurrentDate
          ? [
              now.getUTCHours(),
              now.getMinutes(),
              now.getUTCSeconds(),
              now.getUTCMilliseconds(),
            ]
          : [])
      )
    );
  }

  return new Date(Date.UTC(year, month, day));
}
