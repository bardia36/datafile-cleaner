import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        keppel: {
          50: '#effefa',
          100: '#c7fff2',
          200: '#90ffe4',
          300: '#51f7d6',
          400: '#1de4c3',
          500: '#04c8aa',
          600: '#00af98',
          700: '#058071',
          800: '#0a655b',
          900: '#0d544c',
          950: '#003330',
        }
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        colors: {
          primary: {
            50: '#effefa',
            100: '#c7fff2',
            200: '#90ffe4',
            300: '#51f7d6',
            400: '#1de4c3',
            500: '#04c8aa',
            600: '#00af98',
            700: '#058071',
            800: '#0a655b',
            900: '#0d544c',
            950: '#003330',
            DEFAULT: '#04c8aa',
            foreground: '#ffffff',
          },
        },
      },
      dark: {
        colors: {
          primary: {
            50: '#effefa',
            100: '#c7fff2',
            200: '#90ffe4',
            300: '#51f7d6',
            400: '#1de4c3',
            500: '#04c8aa',
            600: '#00af98',
            700: '#058071',
            800: '#0a655b',
            900: '#0d544c',
            950: '#003330',
            DEFAULT: '#04c8aa',
            foreground: '#ffffff',
          },
        },
      },
    },
  })],
}

module.exports = config;