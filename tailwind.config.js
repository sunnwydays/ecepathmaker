import { green } from '@mui/material/colors';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
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
			green4: '#287163',
  			comp1: '#FF8C94',
  			comp2: '#FF6F61',
  			comp3: '#D9534F',
			comp4: '#BB4844',
  			neutral1: '#F7F7F7',
  			neutral2: '#E0E0E0',
  			neutral3: '#BDBDBD'
  		},
  		width: {
  			wp: '65%',
  			wpl: '80%',
  			wps: '43rem',
  			navFoot: '44.5rem'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}