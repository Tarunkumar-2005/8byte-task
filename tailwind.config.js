/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finance: {
          bg: '#0B0F19',
          card: '#111827',
          cardHover: '#172033',
          border: '#1F2937',
          borderLight: '#374151',
          textMuted: '#9CA3AF',
          gain: '#10B981',
          gainBg: 'rgba(16, 185, 129, 0.12)',
          gainBorder: 'rgba(16, 185, 129, 0.25)',
          loss: '#EF4444',
          lossBg: 'rgba(239, 68, 68, 0.12)',
          lossBorder: 'rgba(239, 68, 68, 0.25)',
          accent: '#3B82F6',
          accentGlow: 'rgba(59, 130, 246, 0.15)',
        },
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
