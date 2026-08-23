import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'twitch': {
          purple: '#9146FF',
          'purple-hover': '#772CE8',
          green: '#00F593',
          red: '#eb0400',
        },
        'bg': {
          primary: '#0E0E10',
          secondary: '#18181B',
          tertiary: '#1F1F23',
          input: '#26262C',
        },
        'text': {
          primary: '#EFEFF1',
          secondary: '#ADADB8',
          muted: '#53535F',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
export default config
