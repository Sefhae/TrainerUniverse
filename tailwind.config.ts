import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        bone: '#F5F5F0',
        volt: '#C8FF00',
        charcoal: '#1C1C1C',
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Arial Narrow"', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(26px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'word-slide': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '60%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'highlight-swipe': {
          '0%': { opacity: '0', transform: 'rotate(-1.5deg) scaleX(0)' },
          '100%': { opacity: '0.92', transform: 'rotate(-1.5deg) scaleX(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        'scale-in': 'scale-in 0.22s ease-out both',
        'slide-down': 'slide-down 0.2s ease-out both',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'word-slide': 'word-slide 0.55s cubic-bezier(0.16,1,0.3,1) both',
        'highlight-swipe': 'highlight-swipe 0.45s cubic-bezier(0.16,1,0.3,1) both',
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
