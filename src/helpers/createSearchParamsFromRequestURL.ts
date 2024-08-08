export default function createSearchParamsFromRequestURL(url: string) {
  const questionMarkURLIndex = url.indexOf("?");

  return questionMarkURLIndex === -1
    ? undefined
    : new URLSearchParams(url.slice(url.indexOf("?") + 1));
}
