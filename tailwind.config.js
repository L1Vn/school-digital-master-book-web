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
          DEFAULT: "#5B4BFF",
          500: "#5B4BFF",
          600: "#4839cc",
        },
        lightbg: "#F3F7FF",
        card: "#FFFFFF"
      },
      boxShadow: {
        soft: "0 6px 18px rgba(71, 96, 130, 0.08)"
      }
    }
  },
  plugins: []
};
