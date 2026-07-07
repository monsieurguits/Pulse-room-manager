import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#050505',
          900: '#0a0a0d',
          850: '#101014',
          800: '#16161b',
          700: '#212129',
        },
        accent: {
          400: '#ff5fa2',
          500: '#ff2d87',
          600: '#e0116d',
          700: '#b30d58',
        },
      },
      boxShadow: {
        glow: '0 0 24px rgba(255, 45, 135, 0.35)',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'pulse-slow': 'pulseSlow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
