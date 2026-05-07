/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    colors: {
      primary: '#1A1C1E',
      secondary: '#6C7278',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        DEFAULT: '#9ca3af',
      },
    },
    fontSize: {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
    fontFamily: {
      sans: ['Public Sans', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    spacing: {
      sm: '8px',
      md: '16px',
      lg: '24px',
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
    },
  },
};
