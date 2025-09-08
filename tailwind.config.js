// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { tealdeep: "#0E5A5A", cream: "#F4E8DA", ink: "#0C2A2A" },
      fontFamily: { display: ["Manrope", "ui-sans-serif"], body: ["Inter", "ui-sans-serif"] }
    }
  }
};
