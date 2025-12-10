/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monochrome palette
        surface: {
          DEFAULT: '#0a0a0a',
          secondary: '#141414',
          tertiary: '#1a1a1a',
          elevated: '#242424',
        },
        border: {
          DEFAULT: '#2a2a2a',
          subtle: '#1f1f1f',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0',
          muted: '#606060',
        },
        // Accent - International Orange
        accent: {
          DEFAULT: '#FF4F00',
          hover: '#FF6B2C',
          muted: 'rgba(255, 79, 0, 0.15)',
        },
        // Semantic colors (muted)
        positive: '#22c55e',
        negative: '#ef4444',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
    },
  },
  plugins: [],
}
