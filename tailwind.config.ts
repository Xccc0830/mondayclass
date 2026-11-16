import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        muted: "#667085",
        canvas: "#f5f7f8",
        brand: "#167d78",
      },
    },
  },
  plugins: [],
};

export default config;
