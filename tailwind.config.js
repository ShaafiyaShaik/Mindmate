/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        sage: {
          50: '#f7f9f7',
          100: '#eef2ee',
          200: '#d7e3d8',
          300: '#b5c7b7',
          400: '#8fa592',
          500: '#6b8470',
          600: '#556b5a',
          700: '#47584b',
          800: '#3c493f',
          900: '#343e36',
        },
        'soft-blue': {
          50: '#f1f7fd',
          100: '#dfecfa',
          200: '#c6dff6',
          300: '#9fcbf0',
          400: '#71afe7',
          500: '#5094de',
          600: '#3c7bd2',
          700: '#3469c0',
          800: '#30569b',
          900: '#2d4a7b',
        },
        'warm-gray': {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        lavender: {
          50: '#faf7ff',
          100: '#f3edff',
          200: '#e9ddff',
          300: '#d9c2ff',
          400: '#c298ff',
          500: '#a866ff',
          600: '#9644ff',
          700: '#8230f7',
          800: '#6d28d9',
          900: '#5b21b6',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(107, 132, 112, 0.1), 0 1px 2px 0 rgba(107, 132, 112, 0.06)',
        'medium': '0 4px 6px -1px rgba(107, 132, 112, 0.1), 0 2px 4px -1px rgba(107, 132, 112, 0.06)',
        'large': '0 10px 15px -3px rgba(107, 132, 112, 0.1), 0 4px 6px -2px rgba(107, 132, 112, 0.05)',
        'xl': '0 20px 25px -5px rgba(107, 132, 112, 0.1), 0 10px 10px -5px rgba(107, 132, 112, 0.04)',
      },
      animation: {
        'gentle-pulse': 'gentle-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        'gentle-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'fadeIn': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}