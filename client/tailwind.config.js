/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#142B4A',
          primary: '#142B4A',
          deep: '#0B172A',
          secondary: '#203D5B',
          dark: '#0e1e33',
        },
        mint: {
          DEFAULT: '#75E0C0',
          hover: '#5eccab',
          soft: '#E3FAF2',
          light: '#f0fdf9',
        },
        campus: {
          bg: '#F5F8FC',
          text: '#26364A',
          muted: '#718096',
          border: '#E3EAF2',
          card: '#FFFFFF',
          success: '#22A06B',
          warning: '#F4B942',
          error: '#E05260',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(11, 23, 42, 0.05), 0 1px 2px rgba(11, 23, 42, 0.03)',
        card: '0 4px 16px -2px rgba(20, 43, 74, 0.06), 0 2px 6px -2px rgba(20, 43, 74, 0.04)',
        glow: '0 0 20px -3px rgba(117, 224, 192, 0.35)',
      }
    },
  },
  plugins: [],
}
