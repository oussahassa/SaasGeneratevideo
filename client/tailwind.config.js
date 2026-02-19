/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ← obligatoire pour dark mode par classe
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
