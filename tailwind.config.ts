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
        // Porto Rocha Twitch Palette
        'twitch': {
          purple: '#9146FF',
          'purple-hover': '#772CE8',
          yellow: '#FAFF00',
          cyan: '#00FFF0',
          pink: '#FF00FA',
          green: '#00F593',
        },
        // Neo-brutalist Dark Theme
        'bg': {
          primary: '#0E0E10',
          secondary: '#000000',
          tertiary: '#18181B',
        },
        'text': {
          primary: '#FFFFFF',
          secondary: '#ADADB8',
          muted: '#53535F',
        },
      },
      fontFamily: {
        // Space Grotesk is an excellent open-source alternative to Roobert for that blocky, tech feel
        sans: ['var(--font-space-grotesk)', 'var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      boxShadow: {
        // Hard extruded shadows characteristic of the Porto Rocha rebrand
        'brutal-sm': '2px 2px 0px 0px rgba(145, 70, 255, 1)',
        'brutal': '4px 4px 0px 0px rgba(145, 70, 255, 1)',
        'brutal-lg': '8px 8px 0px 0px rgba(145, 70, 255, 1)',
        'brutal-yellow': '4px 4px 0px 0px rgba(250, 255, 0, 1)',
        'brutal-cyan': '4px 4px 0px 0px rgba(0, 255, 240, 1)',
        'brutal-white': '4px 4px 0px 0px rgba(255, 255, 255, 1)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
    },
  },
  plugins: [],
}
export default config
