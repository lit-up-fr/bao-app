/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // === COULEURS LIT UP OFFICIELLES ===
        canard: {
          DEFAULT: '#00989D',
          dark: '#007479',
          light: '#b3dfe0',
        },
        jaune: {
          DEFAULT: '#FCC33D',
          dark: '#e0a920',
          accent: '#856100',
          light: '#ffe8a6',
        },
        anthracite: {
          DEFAULT: '#2B3442',
          soft: '#4a5568',
        },
        prune: {
          DEFAULT: '#6B2468',
          light: '#9a4e97',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        caveat: ['"Caveat"', 'cursive'],
      },
    },
  },
  plugins: [],
};
