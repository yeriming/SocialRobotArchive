import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        appleBlue: "#0066cc",
        ink: "#1d1d1f",
        parchment: "#f5f5f7",
        tileDark: "#272729",
        tileDarkAlt: "#2a2a2c"
      },
      fontFamily: {
        display: ["SF Pro Display", "system-ui", "-apple-system", "sans-serif"],
        text: ["SF Pro Text", "system-ui", "-apple-system", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
