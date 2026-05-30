import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./stores/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        night: "#060814",
        ocean: "#155EEF",
        mint: "#26D7A4",
        coral: "#FF6B5E",
        sun: "#F9C846",
        cloud: "#F7F8FB"
      },
      boxShadow: {
        premium: "0 24px 80px rgba(16, 24, 40, 0.16)",
        glow: "0 18px 50px rgba(21, 94, 239, 0.22)"
      },
      fontFamily: {
        sans: ["var(--font-inter, system-ui)", "sans-serif"],
        inter: ["var(--font-inter, system-ui)", "sans-serif"]
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
