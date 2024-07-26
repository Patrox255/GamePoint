export default function isoStringToDateInputValue(isoString: string) {
  return isoString.indexOf("T") === -1
    ? "Enter a valid ISO string!"
    : isoString.split("T")[0];
}
