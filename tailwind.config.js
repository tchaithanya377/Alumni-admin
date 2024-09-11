// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',    // Navy Blue
        secondary: '#6366F1',  // Light Indigo
        accent: '#22C55E',     // Emerald Green
        neutral: '#F9FAFB',    // Light Gray
        textColor: '#111827',  // Charcoal for typography
      },
    },
  },
  plugins: [],
}
