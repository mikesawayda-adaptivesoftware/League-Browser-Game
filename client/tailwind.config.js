/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C89B3C',
          light: '#F0E6D3',
          dark: '#785A28',
        },
        navy: {
          DEFAULT: '#0A1428',
          light: '#091428',
          card: '#1E2328',
        },
      },
      fontFamily: {
        beaufort: ['Beaufort for LOL', 'serif'],
        spiegel: ['Spiegel', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
