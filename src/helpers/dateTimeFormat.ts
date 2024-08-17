const dateFormatOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "long",
  year: "numeric",
};

const createIntlDateTimeFormat = (formatOptions: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(navigator.language, formatOptions);

export const dateFormat = createIntlDateTimeFormat(dateFormatOptions);

export const dateTimeFormat = createIntlDateTimeFormat({
  ...dateFormatOptions,
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
});
