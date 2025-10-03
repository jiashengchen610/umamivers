import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        umami: {
          aa: '#B85450',      // Red-orange for amino acids
          nuc: '#C69C6D',     // Orange-brown for nucleotides
          synergy: '#E8B4CB', // Pink for synergy
        },
        tcm: {
          cold: '#6FB7E8',    // Blue
          cool: '#9BB9E8',    // Light blue
          neutral: '#D1D1D1', // Gray
          warm: '#E8B4CB',    // Pink
          hot: '#E89BB9',     // Hot pink
          bitter: '#C8E6C9',  // Light green
          sour: '#FFF9C4',    // Light yellow
          salty: '#E1E1E1',   // Light gray
          sweet: '#F8BBD9',   // Pink
          spicy: '#FFAB91',   // Orange-red
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config