/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'app-accent': 'var(--app-accent)',
        'app-accent-hover': 'var(--app-accent-hover)',
      },
      fontFamily: {
        'display': ['Outfit', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
