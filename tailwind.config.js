/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        border: '#e4e4e7',
        input: '#e4e4e7',
        ring: '#000000',
        background: '#ffffff',
        foreground: '#09090b',
        surface: '#fafafa',
        primary: {
          DEFAULT: '#000000',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f4f4f5',
          foreground: '#09090b',
        },
        muted: {
          DEFAULT: '#f4f4f5',
          foreground: '#71717a',
        },
        accent: {
          DEFAULT: '#f4f4f5',
          foreground: '#09090b',
        },
        destructive: {
          DEFAULT: '#000000',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#000000',
          light: '#f4f4f5',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#000000',
          light: '#f4f4f5',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}
