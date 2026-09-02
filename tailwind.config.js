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
        obsidian: {
          950: '#060709',
          900: '#0A0C10',
          850: '#0F1218',
          800: '#141820',
          700: '#1F2532',
          600: '#2D3446',
        },
        intent: {
          amber: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.15)',
        },
        recovery: {
          sage: '#10B981',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        drift: {
          coral: '#F97316',
          glow: 'rgba(249, 115, 22, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'breathe': 'breathe 8s ease-in-out infinite',
        'subtle-pulse': 'subtlePulse 3s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.03)', opacity: '1' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
