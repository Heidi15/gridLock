/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B1F3A',
        accent: '#1A56A8',
        gold: '#F59E0B',
        success: '#22C55E',
        danger: '#EF4444',
        neutral: {
          50: '#F8FAFF',
          100: '#E8EEF7',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
