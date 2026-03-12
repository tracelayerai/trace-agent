/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutral palette (wireframe)
        surface: '#F5F8FD',
        page: '#EDF0F7',
        border: '#DCE1ED',
        
        // Text colors
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },
        
        // Accent (dark)
        accent: '#111827',
        
        // Risk levels
        risk: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#F59E0B',
          low: '#22C55E',
          clear: '#6B7280',
        },
        
        // Status colors
        status: {
          open: '#3B82F6',
          closed: '#6B7280',
          reopened: '#F59E0B',
        },
        
        // Compliance
        compliance: {
          flagged: '#F97316',
          clear: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },
      fontWeight: {
        400: '400',
        500: '500',
        600: '600',
        700: '700',
      },
      borderRadius: {
        DEFAULT: '12px',
        xl: '12px',
      },
      boxShadow: {
        DEFAULT: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
    },
  },
  plugins: [],
}
