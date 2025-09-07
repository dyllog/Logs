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
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial"],
      },
      colors: {
        logs: {
          teal: "#0F3B3F",        // hero bg
          teal2: "#0E373B",       // hero gradient base
          mid:  "#114348",        // mid skyline
          far:  "#0B2D2F",        // far skyline
          fore: "#164C51",        // foreground + CTAs
          water:"#0B2F31",
          cream:"#F5EADF",        // light section
          creamText:"#0F2F32",    // text on cream
          creamSub:"#D6CBC0",     // body on teal
          cardBorder:"#E7DED3",   // card stroke
        },
      },
      boxShadow: { soft: "0 2px 10px rgba(0,0,0,.06)" },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [],
};
