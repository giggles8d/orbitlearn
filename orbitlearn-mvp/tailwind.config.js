/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
      },
      colors: {
        brand: { DEFAULT: '#2563EB', accent: '#22D3EE', warm: '#F59E0B', ink: '#0B132B' }
      }
    },
  },
  plugins: [],
}
