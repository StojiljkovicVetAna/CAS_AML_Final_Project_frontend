import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        graphite: "#2e3a4d",
        mint: "#5eead4",
        aqua: "#4dd4c6",
        blush: "#d9969e",
        shell: "#fbfbf8",
        skywash: "#d9edf7",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 33, 43, 0.12)",
        chat: "0 26px 90px rgba(23, 33, 43, 0.14)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        caninerag: {
          primary: "#14b8a6",
          secondary: "#d9969e",
          accent: "#2e3a4d",
          neutral: "#17212b",
          "base-100": "#fbfbf8",
          "base-200": "#eef7f5",
          "base-300": "#d8ece8",
          info: "#3b82f6",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    ],
  },
};
