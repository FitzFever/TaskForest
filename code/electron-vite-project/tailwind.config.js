/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8cba80',
          DEFAULT: '#4CAF50',
          dark: '#2E7D32',
        },
        secondary: {
          light: '#B2EBF2',
          DEFAULT: '#00BCD4',
          dark: '#0097A7',
        },
      },
    },
  },
  plugins: [],
}

