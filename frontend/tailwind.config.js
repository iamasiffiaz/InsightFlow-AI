/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f7f7',
          100: '#e3ebeb',
          200: '#c5d4d4',
          300: '#9bb3b3',
          400: '#6f8f8f',
          500: '#547474',
          600: '#425c5c',
          700: '#374b4b',
          800: '#2f3e3e',
          900: '#2a3535',
          950: '#151c1c',
        },
        brand: {
          50: '#effaf6',
          100: '#d8f3e9',
          200: '#b4e6d4',
          300: '#82d3b8',
          400: '#4fb896',
          500: '#2d9a7a',
          600: '#1f7c62',
          700: '#1a6350',
          800: '#174f41',
          900: '#144137',
        },
        sand: {
          50: '#fbf8f3',
          100: '#f3ebe0',
          200: '#e6d5bd',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -18px rgba(21, 28, 28, 0.35)',
      },
      backgroundImage: {
        'mesh':
          'radial-gradient(ellipse at 20% 20%, rgba(45,154,122,0.18), transparent 45%), radial-gradient(ellipse at 80% 0%, rgba(228,199,150,0.25), transparent 40%), linear-gradient(160deg, #fbf8f3 0%, #eff5f3 45%, #e8f0ee 100%)',
        'dash':
          'radial-gradient(circle at top right, rgba(45,154,122,0.08), transparent 35%), linear-gradient(180deg, #f7faf9 0%, #eef3f2 100%)',
      },
    },
  },
  plugins: [],
}
