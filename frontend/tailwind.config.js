/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2ed',
          100: '#cce5db',
          200: '#99cbb7',
          300: '#66b193',
          400: '#40826d',
          500: '#2d5a3a',
          600: '#1a3f2c',
          700: '#152f22',
          800: '#102018',
          900: '#0a100e',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(26, 63, 44, 0.2)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(64, 130, 109, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(64, 130, 109, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
