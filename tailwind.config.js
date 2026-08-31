/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        sheets: {
          green: '#0f9d58',
          border: '#e2e8f0',
          header: '#f8fafc',
          select: '#e8f0fe',
        }
      },
      fontFamily: {
        sans: ['"Comic Neue"', '"Comic Sans MS"', '"Comic Sans"', 'cursive', 'system-ui', 'sans-serif'],
        comic: ['"Comic Neue"', '"Comic Sans MS"', '"Comic Sans"', 'cursive', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
