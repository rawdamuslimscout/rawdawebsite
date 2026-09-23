import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#4B2A82",
          "purple-dark": "#2C1750",
          "purple-light": "#7856B5",
          "purple-tint": "#F3EEFA",
          turquoise: "#2FBFBA",
          "turquoise-dark": "#1B8E8B",
          "turquoise-tint": "#E7F8F7",
          yellow: "#F0B429",
          "yellow-dark": "#C88A0A",
          orange: "#E8672C",
          cream: "#FBF9F5",
          ink: "#211433",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      backgroundImage: {
        "canvas-weave":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
      },
      keyframes: {
        "rope-draw": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        "rope-draw": "rope-draw 2s ease-out forwards",
        flicker: "flicker 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
