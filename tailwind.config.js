/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bodyBg: "#2E2E2E",
        defaultFont: "#F1F1F1",
        highlightRed: "#AD3434",
        highlightGreen: "#3D8351",
        highlightLoading: "#6E3C3C",
        darkerBg: "#1F1F1F",
      },
      fontFamily: {
        main: ["SpaceGrotesk", "Roboto", "sans-serif"],
      },
      gridTemplateColumns: {
        gameSearchBarResult: "minmax(0, 1fr) minmax(0, 0.5fr)",
      },
    },
  },
  plugins: [],
};
