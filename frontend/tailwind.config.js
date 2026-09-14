/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 900: "#14181C", 700: "#232A31", 500: "#3A4650" },
        paper: "#F6F5F2",
        amber: { DEFAULT: "#C1802E", dark: "#9C6623" },
        teal: { DEFAULT: "#2F6F62", light: "#E4EEEC" },
        danger: "#B3452D",
        rule: "#E4E1DA",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
