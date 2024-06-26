/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bodyBg: "#2E2E2E",
        defaultFont: "#F1F1F1",
        highlightRed: "#AD3434",
      },
      fontFamily: {
        main: ["SpaceGrotesk", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
