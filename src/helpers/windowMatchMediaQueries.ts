// Order matters here when it comes to handling media quereis in related hooks! Ordered by size ascending

const windowMatchMediaQueries = {
  xs: window.matchMedia("(min-width: 340px)"),
  "2xs": window.matchMedia("(min-width: 550px)"),
  lg: window.matchMedia("(min-width: 1024px)"),
  sm: window.matchMedia("(min-width: 640px)"),
};

export type windowMatchMediaQueriesKeys = keyof typeof windowMatchMediaQueries;
export default windowMatchMediaQueries;
