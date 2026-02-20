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
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Neon Emerald
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        obsidian: {
          light: '#1e293b', // Slate 800
          DEFAULT: '#0f172a', // Slate 900
          dark: '#020617', // Slate 950
        },
        gold: {
          accent: '#fbbf24', // Amber 400
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          dark: 'rgba(2, 6, 23, 0.6)', // Obsidian dark glass
          emerald: 'rgba(16, 185, 129, 0.1)',
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
