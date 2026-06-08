import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Fixed brand colors (never flip): buttons, volt/accent sections, the
        // intentionally-light "island" sections, and anywhere a literal value
        // is required regardless of theme.
        ink: '#0A0A0A',
        bone: '#F5F5F0',
        volt: '#C8FF00',
        charcoal: '#1C1C1C',
        // Theme-aware semantic tokens (flip between .theme-dark / .theme-light).
        // Backed by CSS variables as "R G B" triplets so Tailwind opacity
        // utilities (e.g. text-content/60, border-content/10) keep working.
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        content: 'rgb(var(--content) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
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
  plugins: [
    // CSS-driven theme variants (no JS state → no hydration flash). Lets a single
    // element style itself per theme, e.g. `text-accent theme-light:bg-volt`.
    plugin(({ addVariant }) => {
      addVariant('theme-light', '.theme-light &');
      addVariant('theme-dark', '.theme-dark &');
    }),
  ],
};

export default config;
