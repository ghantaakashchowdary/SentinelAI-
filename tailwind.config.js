/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080d1a',
          card: '#0f172a',
          cardHover: '#16223d',
          border: '#1e293b',
          borderHighlight: '#334155',
          text: '#f8fafc',
          textMuted: '#94a3b8',
          accent: '#06b6d4',
          accentDark: '#0891b2',
        },
        risk: {
          safe: '#10b981',       // Green
          safeMuted: '#064e3b',
          warning: '#f59e0b',    // Yellow
          warningMuted: '#78350f',
          elevated: '#f97316',   // Orange
          elevatedMuted: '#7c2d12',
          critical: '#ef4444',   // Red
          criticalMuted: '#7f1d1d'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radar 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '50%': { transform: 'scale(1.4)', opacity: '0.4' },
          '100%': { transform: 'scale(2.0)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      },
      boxShadow: {
        'cyber-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.3)',
        'cyber-rose': '0 0 20px -3px rgba(239, 68, 68, 0.4)',
        'cyber-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'cyber-amber': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'cyber-orange': '0 0 20px -3px rgba(249, 115, 22, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
