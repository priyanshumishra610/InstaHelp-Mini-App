/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#7C3AED",
          soft: "#F5F3FF",
          tint: "#EDE9FE",
          muted: "#8B5CF6",
          deep: "#5B21B6",
          foreground: "#ffffff",
        },
        brand: {
          ink: "#000000",
          paper: "#ffffff",
          paperDark: "#ffffff",
          card: "#ffffff",
          cardDark: "#ffffff",
          line: "#e5e5e5",
          lineDark: "#e5e5e5",
          blue: "#7C3AED",
          blueInk: "#5B21B6",
          sky: "#8B5CF6",
          mist: "#EDE9FE",
          gold: "#ffd500",
          goldDeep: "#b88a00",
          goldSoft: "#fff8e1",
        },
        status: {
          pendingBg: "#fff8e1",
          pendingFg: "#92400e",
          assignedBg: "#EDE9FE",
          assignedFg: "#7C3AED",
          movingBg: "#EDE9FE",
          movingFg: "#6D28D9",
          doneBg: "#d1fae5",
          doneFg: "#065f46",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#FFFFFF",
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
        soft: "0 0 0 1px rgba(0,0,0,0.06)",
        "soft-dark": "0 0 0 1px rgba(0,0,0,0.06)",
        glow: "0 0 0 1px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
