/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1F6F64',
        accent: '#FF6A13',
      },
    },
  },
  plugins: [],
};
