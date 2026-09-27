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
        rakshak: {
          bg: '#090d16',
          panel: '#0f172a',
          card: '#1e293b',
          cardHover: '#334155',
          border: '#1e293b',
          borderLight: '#334155',
          primary: '#0ea5e9', // Deep Teal / Sky Blue
          primaryDark: '#0284c7',
          secondary: '#3b82f6', // Navy Blue
          ai: '#a855f7', // XAI Purple
          aiLight: '#c084fc',
          alert: '#f97316', // Orange warning
          danger: '#ef4444', // Red critical
          success: '#10b981', // Emerald verified
          gold: '#f59e0b', // Govt emblem / priority accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(14, 165, 233, 0.25)',
        'glow-ai': '0 0 20px rgba(168, 85, 247, 0.25)',
        'glow-alert': '0 0 20px rgba(249, 115, 22, 0.25)',
      }
    },
  },
  plugins: [],
}
