// tailwind.config.cjs
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#7c3aed', // indigo-500 as brand color
          600: '#6d28d9',
        },
      },
    },
  },
  plugins: [],
};
