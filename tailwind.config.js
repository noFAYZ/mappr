import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        'space-grotesk': ["var(--font-space-grotesk)"],
      },
      colors: {
        // Primary color
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // orange-500
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        // Dark mode colors
        dark: {
          background: '#0F0F12',
          foreground: '#F1F1F3',
          content1: '#18181B',
          content2: '#27272A',
          content3: '#3F3F46',
          content4: '#52525B',
          divider: '#27272A',
          focus: '#F97316',
        },
        // Light mode colors
        light: {
          background: '#FFFFFF',
          foreground: '#18181B',
          content1: '#F9FAFB',
          content2: '#F3F4F6',
          content3: '#E5E7EB',
          content4: '#D1D5DB',
          divider: '#E5E7EB',
          focus: '#F97316',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in-from-bottom': 'slideInFromBottom 0.2s ease-out',
        'slide-in-from-right': 'slideInFromRight 0.1s ease-out',
        'bounce-subtle': 'bounceSubtle 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInFromBottom: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-2px)' },
          '60%': { transform: 'translateY(-1px)' },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      layout: {
        disabledOpacity: "0.3", // opacity-[0.3]
     
        borderWidth: {
          small: "1px", // border-small
          medium: "1px", // border-medium
          large: "2px", // border-large
        },
      },
     
    }),
  ],
};

export default config;