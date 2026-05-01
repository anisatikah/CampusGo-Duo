/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Carbon-dark base
        ink: {
          950: '#070A0F',
          900: '#0B1117',
          800: '#11181F',
          700: '#1A222B',
          600: '#27313D',
          500: '#3A4757',
          400: '#5C6B7E',
          300: '#8794A6',
          200: '#B6C0CF',
          100: '#E2E7EE',
        },
        // Electric primary
        volt: {
          400: '#7CFFD4',
          500: '#26F0A6',
          600: '#0AC684',
          700: '#0A9866',
        },
        // Accent magenta for storage
        plum: {
          400: '#FF8FE0',
          500: '#E84BC9',
          600: '#B92BA0',
        },
        // Warning amber
        amber2: {
          400: '#FFD479',
          500: '#FBA936',
        },
      },
      boxShadow: {
        'glow-volt': '0 0 0 1px rgba(38,240,166,.25), 0 18px 48px -16px rgba(38,240,166,.45)',
        'glow-plum': '0 0 0 1px rgba(232,75,201,.25), 0 18px 48px -16px rgba(232,75,201,.45)',
        'inset-card': 'inset 0 1px 0 rgba(255,255,255,.04)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at 50% 0%, rgba(38,240,166,.08), transparent 60%), radial-gradient(circle at 80% 80%, rgba(232,75,201,.06), transparent 60%)',
      },
    },
  },
  plugins: [],
};
