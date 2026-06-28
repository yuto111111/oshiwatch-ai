import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0EA5E9",
        secondary: "#BAE6FD",
        accent: "#0C4A6E",
        surface: "#F0F9FF",
      },
    },
  },
  plugins: [],
};

export default config;