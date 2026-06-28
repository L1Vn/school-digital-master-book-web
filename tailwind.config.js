/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",       // untuk App Router
    "./pages/**/*.{js,ts,jsx,tsx}",     // untuk Pages Router
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.css"                // wajib agar globals.css terbaca
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3E236D",
          500: "#3E236D",
          600: "#2c184e",
        },
        accent: {
          DEFAULT: "#955893",
          500: "#955893",
          600: "#7c447a",
        },
        lightbg: "#F7F5FA",
        card: "#FFFFFF"
      },
      fontFamily: {
        sans: ["'Source Sans 3'", "sans-serif"],
        serif: ["'Playfair Display'", "serif"],
      },
      boxShadow: {
        soft: "0 6px 18px rgba(62, 35, 109, 0.05)"
      }
    }
  },
  plugins: []
};
