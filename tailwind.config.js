/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#262524',
        'ink-soft': '#33312E',
        'text-muted': '#6E6B67',
        'text-muted-2': '#7C776F',
        'text-faint': '#9A958D',
        label: '#8A857E',
        'label-2': '#B6B0A7',
        'icon-default': '#3C3A37',
        'icon-inactive': '#9C978F',
        'star-empty': '#CBC6BE',
        accent: '#AE3A23',
        'bg-app': '#F4F3F1',
        surface: '#FFFFFF',
        'tile-bg': '#F4F2EE',
        border: '#EAE7E2',
        'border-2': '#E2DFD9',
        'border-3': '#E7E4DF',
        'border-hover': '#D6D1C9',
        'avatar-bg': '#2E2C2A',
        'side-bg': '#211E1B',
        'side-muted': '#9C948A',
        'side-faint': '#736C63',
        'side-label': '#57514A',
        'side-gold': '#C9A227',
      },
      fontFamily: {
        archivo: ['Archivo', 'system-ui', 'sans-serif'],
        hanken: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card-hover': '0 12px 30px -14px rgba(38,37,36,0.22)',
        'chip-hover': '0 8px 20px -12px rgba(38,37,36,0.2)',
        toast: '0 16px 36px -10px rgba(0,0,0,0.45)',
      },
      keyframes: {
        exFloat: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        exPulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(0.85)' },
        },
      },
      animation: {
        'ex-float': 'exFloat 0.25s ease',
        'ex-pulse': 'exPulse 2.4s ease-in-out infinite',
        'ex-pulse-fast': 'exPulse 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
