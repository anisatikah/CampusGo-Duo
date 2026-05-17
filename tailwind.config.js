/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C4DFF',
        'primary-light': '#9C6FFF',
        'primary-dark': '#5C2DD4',
        secondary: '#F5F3FF',
        'card-bg': '#FAFAFF',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        'text-primary': '#111111',
        'text-secondary': '#666666',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(124, 77, 255, 0.08)',
        'card-hover': '0 4px 24px rgba(124, 77, 255, 0.16)',
        bottom: '0 -2px 16px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
