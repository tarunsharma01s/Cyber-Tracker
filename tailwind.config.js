/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#121212',
        card: '#1e1e1e',
        neon: {
          green: '#00ff9f',
          purple: '#b026ff',
          red: '#ff2a6d',
        }
      },
      fontFamily: {
        mono: ['monospace', 'ui-monospace', 'SFMono-Regular']
      }
    },
  },
  plugins: [],
}