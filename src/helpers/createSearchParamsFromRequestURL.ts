export default function createSearchParamsFromRequestURL(url: string) {
  return new URLSearchParams(url.slice(url.indexOf("?") + 1));
}
