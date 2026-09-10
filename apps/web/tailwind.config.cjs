const themeConfig = require('../../packages/shared/theme/theme.config.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: themeConfig.colors,
      borderRadius: themeConfig.borderRadius,
      fontFamily: themeConfig.fontFamily,
    },
  },
  plugins: [],
};
