import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 象牙白系列
        ivory: {
          50: '#fafaf8',
          100: '#f5f5f0',
          200: '#e8e6dc',
        },
        // 深金銅色系列
        bronze: {
          light: '#a68968',
          DEFAULT: '#8b7355',
          dark: '#6b5744',
        },
        // 粉紅色系主題
        wedding: {
          pink: {
            light: '#FFE5EC',
            DEFAULT: '#FFB3C6',
            dark: '#FF8FAB',
          },
          gold: {
            light: '#FFF8E7',
            DEFAULT: '#FFD700',
            dark: '#FFB700',
          },
        },
        // Romantic 色系 - 完整的 50-900 級別
        romantic: {
          50: '#fff5f9',   // light-pink
          100: '#ffe4f0',  // soft-pink
          200: '#ffc1e0',  // primary-pink
          300: '#ffadd2',  // secondary-pink
          400: '#ff85b3',  // deep-pink
          500: '#ff6b9d',  // accent-pink
          600: '#E91E63',
          700: '#C2185B',
          800: '#AD1457',
          900: '#880E4F',
        },
      },
      borderRadius: {
        'sm': '2px',
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.6s ease-out',
        'fadeIn': 'fadeIn 0.5s ease-in',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slideHorizontal': 'slideHorizontal 2s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scaleIn': 'scaleIn 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideHorizontal: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(10px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: [
          'Noto Serif TC',
          'Cormorant Garamond',
          'Crimson Text',
          'Georgia',
          'serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
