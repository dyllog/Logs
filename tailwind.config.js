/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Inter gives a clean, geometric look like the mock
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial"],
      },
      colors: {
        logs: {
          teal: "#0F3B3F", // hero bg
          tealLight: "#0E373B", // hero gradient base
          mid1: "#114348", // mid skyline
          mid2: "#0B2D2F", // far skyline
          fore: "#164C51", // foreground skyline + buttons
          water: "#0B2F31",
          cream: "#F5EADF", // light section bg
          creamText: "#0F2F32", // dark-on-cream text
          creamSub: "#D6CBC0", // body text on teal
          cardBorder: "#E7DED3",
        },
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0,0,0,.06)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
