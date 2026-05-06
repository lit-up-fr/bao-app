import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-litup-dark", "bg-litup-teal", "bg-litup-gold", "bg-litup-violet", "bg-litup-light",
    "text-litup-dark", "text-litup-teal", "text-litup-gold", "text-litup-violet",
    "border-litup-teal", "border-litup-dark",
    "hover:text-litup-teal", "hover:border-litup-teal",
    "text-litup-dark/40", "text-litup-dark/50", "text-litup-dark/55", "text-litup-dark/60", "text-litup-dark/70",
    "bg-litup-dark/5", "bg-litup-dark/6", "bg-litup-dark/10",
    "border-litup-dark/10", "border-litup-dark/12",
  ],
  theme: {
    extend: {
      colors: {
        litup: {
          dark: "#2B3442",
          teal: "#00989D",
          gold: "#FCC33E",
          violet: "#6B2468",
          light: "#F6F6F8",
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
