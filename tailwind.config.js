/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#10B981",
        background: "var(--background)",
        surface: "var(--surface)",
        error: "#EF4444",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
      },
    },
  },
  plugins: [],
}; 