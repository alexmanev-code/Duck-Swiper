/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./views/**/*.ejs",  
    "./public/**/*.js",  
    "./public/**/*.html" 
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
