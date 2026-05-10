/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#ffd500",
          soft: "#fff5b8",
          tint: "#fffbe0",
          muted: "#e6bf00",
          deep: "#a88a00",
          foreground: "#1a1a1a",
        },
        brand: {
          ink: "#0f0f10",
          paper: "#fafaf9",
          paperDark: "#0b0b0c",
          card: "#ffffff",
          cardDark: "#161617",
          line: "#ececec",
          lineDark: "#262628",
        },
        status: {
          pendingBg: "#fff5b8",
          pendingFg: "#7a5d00",
          assignedBg: "#dbeafe",
          assignedFg: "#1e3a8a",
          movingBg: "#ffedd5",
          movingFg: "#9a3412",
          doneBg: "#d1fae5",
          doneFg: "#065f46",
        },
        surface: {
          DEFAULT: "#FAFAF9",
          dark: "#0B0B0C",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.06)",
        "soft-dark": "0 8px 30px rgba(0,0,0,0.35)",
        glow: "0 12px 36px rgba(255,213,0,0.35)",
      },
    },
  },
  plugins: [],
};
