/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      backgroundImage: {
        banner:
          "linear-gradient(180deg, rgba(0,0,0,0.75), rgba(17,24,39,0.85)), url('/banner.png')",
      },
      fontFamily: {
        geist: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        gradient: 'gradient 3s ease infinite',
      },
    },
  },
  plugins: [],
};
