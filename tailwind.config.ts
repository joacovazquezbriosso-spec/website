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
        gold: '#c9a84c',
        cream: '#f5f0e8',
        dark: '#0d0d0d',
        'dark-border': '#222222',
        'dark-muted': '#666666',
      },
      fontFamily: {
        gothic: ['var(--font-gothic)'],
        cormorant: ['var(--font-cormorant)'],
      },
      letterSpacing: {
        widest2: '0.3em',
        widest3: '0.5em',
      },
    },
  },
  plugins: [],
}

export default config
