/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#004aad",
          soft: "#f0f6ff",
          tint: "#e0eaff",
          muted: "#3b82f6",
          deep: "#003a85",
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
          blue: "#004aad",
          blueInk: "#003a85",
          sky: "#3b82f6",
          mist: "#e0eaff",
          gold: "#ffd500",
          goldDeep: "#b88a00",
          goldSoft: "#fff8e1",
        },
        status: {
          pendingBg: "#fff8e1",
          pendingFg: "#92400e",
          assignedBg: "#cfe0ff",
          assignedFg: "#004aad",
          movingBg: "#dbeafe",
          movingFg: "#1d4ed8",
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
