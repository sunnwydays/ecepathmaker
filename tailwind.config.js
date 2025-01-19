/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green1: '#A8E6CF',
        green2: '#56C596',
        green3: '#379683',
        comp1: '#FF8C94',
        comp2: '#FF6F61',
        comp3: '#D9534F',
        neutral1: '#F7F7F7',
        neutral2: '#E0E0E0',
        neutral3: '#BDBDBD',
      },
      width: {
        'wp': '65%', // width percent
        'wpl': '80%', // wp large
        'wps': '43rem', // wp small originally 95% but 43rem is min width of grid
        'navFoot': '44.5rem',
      }
    },
  },
  plugins: [],
}