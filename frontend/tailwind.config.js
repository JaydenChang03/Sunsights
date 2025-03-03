/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#283618',    // Dark green (moved from DEFAULT)
          DEFAULT: '#606c38', // Light green (moved from light)
          light: '#7c8b4f',   // Lighter green (new)
        },
        accent: {
          DEFAULT: '#dda15e', // Tan
          dark: '#bc6c25',    // Rust
        },
        surface: '#2a2f2b',   // Slightly lighter background for cards
        background: '#1e231f', // Dark background but not too dark
        cream: '#fefae0',
        secondary: {
          DEFAULT: '#e9edc9', // Light cream for text
          dark: '#ccd5ae',    // Darker cream for secondary text
        }
      },
    },
  },
  plugins: [],
}
