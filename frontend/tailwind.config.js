// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#7c3aed",
          600: "#6d28d9",
        },
        primary: "hsl(260, 80%, 55%)",
        secondary: "hsl(340, 70%, 55%)",
        accent: "hsl(45, 100%, 55%)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
