import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        maize: {
          DEFAULT: '#FFCB05',
          50: '#FFF9E0',
          100: '#FFF2BD',
          200: '#FFE785',
          300: '#FFDB4D',
          400: '#FFD326',
          500: '#FFCB05',
          600: '#D9AB00',
          700: '#A38100',
          800: '#6E5700',
          900: '#3D3000',
        },
        navy: {
          DEFAULT: '#00274D',
          50: '#E6EEF5',
          100: '#C2D5E6',
          200: '#8FB0CC',
          300: '#5C8AB3',
          400: '#2E6595',
          500: '#00509E',
          600: '#003C73',
          700: '#00274D',
          800: '#001B36',
          900: '#001122',
          950: '#000B17',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,203,5,0.25), 0 8px 40px -12px rgba(255,203,5,0.45)',
        card: '0 1px 2px rgba(0,17,34,0.06), 0 12px 32px -16px rgba(0,17,34,0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.55s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 0.4s ease both',
      },
    },
  },
  plugins: [],
};
export default config;
