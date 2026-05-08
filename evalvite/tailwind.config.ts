import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F2',
        'paper-dark': '#F0EBE0',
        ink: '#1a1612',
        'ink-soft': '#5c544a',
        brick: '#C2410C',
        'brick-dark': '#9A330A',
        sage: '#3F6B4E',
        accent: '#E8B547',
        line: '#D9D2C4',
        error: '#DC2626',
        success: '#16A34A',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(26,22,18,0.08), 0 4px 12px rgba(26,22,18,0.04)',
        'card-hover': '0 2px 8px rgba(26,22,18,0.12), 0 8px 24px rgba(26,22,18,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
