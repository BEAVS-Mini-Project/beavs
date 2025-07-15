/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  darkMode: ["class"],
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: '#e5e7eb', // gray-200
        input: '#f9fafb', // gray-50
        ring: '#cbd5e1', // gray-300
        background: '#ffffff', // light bg
        foreground: '#111827', // gray-900

        primary: {
          DEFAULT: '#2563eb', // blue-600
          foreground: '#ffffff', // white
        },
        secondary: {
          DEFAULT: '#64748b', // slate-500
          foreground: '#ffffff', // white
        },
        destructive: {
          DEFAULT: '#dc2626', // red-600
          foreground: '#ffffff', // white
        },
        muted: {
          DEFAULT: '#f3f4f6', // gray-100
          foreground: '#6b7280', // gray-500
        },
        accent: {
          DEFAULT: '#e0f2fe', // sky-100
          foreground: '#0284c7', // sky-600
        },
        popover: {
          DEFAULT: '#f9fafb', // gray-50
          foreground: '#111827', // gray-900
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1f2937', // gray-800
        },
        sidebar: {
          DEFAULT: '#f8fafc', // gray-50/blue-50
          foreground: '#1e293b', // slate-800
          primary: '#1d4ed8', // blue-700
          'primary-foreground': '#ffffff',
          accent: '#c7d2fe', // indigo-200
          'accent-foreground': '#1e40af', // indigo-800
          border: '#e2e8f0', // gray-200
          ring: '#cbd5e1', // gray-300
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 

