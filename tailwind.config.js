/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f2f2f2',
        card: '#ffffff',
        muted: '#8e8e93',
        accent: '#ff6b00',
        border: '#e0e0e0', 
        danger: '#ff3b30',
        success: '#34c759',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}