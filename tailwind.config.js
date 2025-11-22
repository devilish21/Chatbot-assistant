/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      "./App.tsx",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace'],
        },
        colors: {
          stc: {
            purple: '#4F008C', // Primary Brand Color
            'purple-dark': '#2D0050',
            'purple-deep': '#150029', // For Terminal BG
            coral: '#FF375E', // Accent Brand Color
            'coral-hover': '#D62045',
            white: '#FFFFFF',
            light: '#F9F7FC',
            surface: '#F2EFF5',
            'surface-dark': '#230e3d',
          }
        },
        animation: {
          'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'scan': 'scan 8s linear infinite',
          'ticker': 'ticker 120s linear infinite',
        },
        keyframes: {
          scan: {
            '0%': { backgroundPosition: '0% 0%' },
            '100%': { backgroundPosition: '0% 100%' },
          },
          ticker: {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(-100%)' },
          }
        }
      },
    },
    plugins: [],
  }