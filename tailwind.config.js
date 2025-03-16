/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        '52': 'repeat(52, minmax(0, 1fr))',
      },
      keyframes: {
        'slide-left': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'slide-down': {
          '0%': { transform: 'translate(-50%, -100%)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' }
        }
      },
      animation: {
        'slide-left': 'slide-left 0.3s ease-out forwards',
        'slide-down': 'slide-down 0.3s ease-out forwards'
      }
    },
  },
  plugins: [],
};
