import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cockpit: "#070b11",
        panel: "#101820",
        field: "#17c3b2",
        hazard: "#f6bd60",
        warning: "#ff6b6b",
      },
      boxShadow: {
        glow: "0 0 40px rgba(23, 195, 178, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
