/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#14181C",
          700: "#232A31",
          500: "#3A4650",
          400: "#5C6873",
          300: "#8A94A0",
        },
        paper: "#F4F3EF",
        amber: {
          DEFAULT: "#C1802E",
          dark: "#9C6623",
          light: "#F7EEDD",
        },
        teal: {
          DEFAULT: "#2F6F62",
          light: "#E4EEEC",
        },
        info: {
          DEFAULT: "#3E6B8C",
          light: "#E6EDF3",
        },
        danger: {
          DEFAULT: "#B3452D",
          light: "#F9E9E4",
        },
        rule: "#E4E1DA",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 24, 28, 0.05), 0 1px 3px rgba(20, 24, 28, 0.04)",
        pop: "0 8px 30px rgba(20, 24, 28, 0.12)",
        sidebar: "inset -1px 0 0 rgba(255,255,255,0.06)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slide-down 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
