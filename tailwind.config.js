   /** @type {import('tailwindcss').Config} */
   module.exports = {
     darkMode: 'class',
     content: [
       "./app/**/*.{js,ts,jsx,tsx}",
       "./pages/**/*.{js,ts,jsx,tsx}",
       "./components/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {
         animation: {
           'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
           aurora: 'aurora 20s linear infinite',
         },
         keyframes: {
           'fade-in-up': {
             from: {
               opacity: '0',
               transform: 'translateY(20px)',
             },
             to: {
               opacity: '1',
               transform: 'translateY(0)',
             },
           },
           aurora: {
             '0%, 100%': { transform: 'translateX(0) translateY(0) rotate(0deg) scale(1)' },
             '25%': { transform: 'translateX(-20px) translateY(20px) rotate(10deg) scale(1.1)' },
             '50%': { transform: 'translateX(0) translateY(-20px) rotate(-10deg) scale(1)' },
             '75%': { transform: 'translateX(20px) translateY(0px) rotate(5deg) scale(1.05)' },
           }
         },
       },
     },
     plugins: [],
   }