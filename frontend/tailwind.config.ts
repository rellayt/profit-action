import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paGreen: {
          bright: '#21f18b',
          DEFAULT: '#14d977',
          deep: '#0ea85c',
        },
      },
      boxShadow: {
        'pa-glow': 'var(--pa-shadow-glow)',
        'pa-card': 'var(--pa-shadow-card)',
      },
    },
  },
  plugins: [],
};

export default config;
