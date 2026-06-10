/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0B1220',
          soft: '#111B2E',
          card: '#1A2340',
        },
        accent: {
          DEFAULT: '#00E5FF',
          soft: '#7DF3FF',
        },
        musk: '#E11D48',
        surface: '#1A2340',
        ink: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px -6px rgba(0, 229, 255, 0.45)',
        'glow-soft': '0 0 12px -4px rgba(0, 229, 255, 0.3)',
      },
    },
  },
  plugins: [],
};
