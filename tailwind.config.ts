import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Цветовая палитра Citrus - Apple/Microsoft Style
        citrus: {
          primary: '#FFFFFF',
          secondary: {
            light: '#F5F5F7',
            dark: '#1C1C1E',
          },
          tertiary: {
            light: '#E8E8ED',
            dark: '#2C2C2E',
          },
          background: {
            light: '#FFFFFF',
            dark: '#0A0A0A',
          },
          accent: '#E47600', // Оранжевый акцент
          'accent-hover': '#D06A00',
          text: {
            light: '#000000',
            dark: '#FFFFFF',
          },
        },
        // Сокращенные классы
        'citrus-accent': '#E47600',
        'citrus-bg-light': '#FFFFFF',
        'citrus-bg-dark': '#0A0A0A',
        'citrus-secondary-light': '#F5F5F7',
        'citrus-secondary-dark': '#1C1C1E',
        'citrus-tertiary-light': '#E8E8ED',
        'citrus-tertiary-dark': '#2C2C2E',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backdropBlur: {
        '3xl': '64px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(228, 118, 0, 0.3)',
        'glow-lg': '0 0 40px rgba(228, 118, 0, 0.4)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
