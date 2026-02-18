/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{njk,html,js,md}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        dark: {
          bg: "#131313",
          surface: "#1a1a1a",
          border: "#2a2a2a",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
