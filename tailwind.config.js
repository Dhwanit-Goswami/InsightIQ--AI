/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Primary Brand (Calm Professional Blue: #5278A6) ──────────
        primary: {
          DEFAULT: '#5278A6',
          hover:   '#42688F',
          50:      '#EDF3F8',
          100:     '#D5E3F0',
          200:     '#B4CCE2',
          300:     '#90B2D3',
          400:     '#6E94C2',
          500:     '#5278A6',
          600:     '#42688F',
          700:     '#335273',
          800:     '#243C57',
          900:     '#17283B',
        },

        // ── Soft Blue Background Accent ───────────────────────
        softblue: {
          DEFAULT: '#EDF3F8',
          hover:   '#E2ECF4',
        },

        // ── Success (Muted Green: #5A8065) ────────────────────
        success: {
          DEFAULT: '#5A8065',
          bg:      '#F1F6F3',
          dark:    '#3D5946',
        },

        // ── Warning (Muted Amber: #B18A4A) ─────────────────────
        warning: {
          DEFAULT: '#B18A4A',
          bg:      '#FBF6EE',
          dark:    '#7A5E2E',
        },

        // ── Danger (Muted Red: #B76868) ───────────────────────
        danger: {
          DEFAULT: '#B76868',
          bg:      '#FBF2F2',
          dark:    '#7F4242',
        },

        // ── AI Lavender (Muted AI Accent: #8178A2) ───────────
        lavender: {
          DEFAULT: '#8178A2',
          bg:      '#F4F3F8',
          dark:    '#5C5478',
        },

        // ── Light Mode Surfaces ───────────────────────────────
        light: {
          bg:         '#F7F8FA',       // main background
          card:       '#FFFFFF',       // card surface
          surface:    '#EFF1F5',       // secondary surface
          border:     '#DDE1E8',       // default border
          divider:    '#E8EBF0',       // subtle divider
          'text-primary':   '#1C2333', // main text
          'text-secondary': '#4B5568', // secondary text
          'text-muted':     '#8896A7', // muted/metadata text
          sidebar:    '#FFFFFF',       // sidebar bg
          topbar:     '#FFFFFF',       // topbar bg
        },

        // ── Dark Mode Surfaces ────────────────────────────────
        dark: {
          bg:         '#111315',       // main background
          card:       '#181B1F',       // card surface
          surface:    '#20242A',       // secondary surface
          border:     '#2A3037',       // default border
          divider:    '#252A31',       // subtle divider
          'text-primary':   '#F5F5F4', // main text
          'text-secondary': '#A7AFBA', // secondary text
          'text-muted':     '#737C87', // muted/metadata text
          sidebar:    '#14171B',       // sidebar bg
          topbar:     '#14171B',       // topbar bg
        },

        // ── Chart Palette (Muted Professional) ────────────────
        chart: {
          blue:     '#5278A6',
          green:    '#5A8065',
          amber:    '#B18A4A',
          red:      '#B76868',
          lavender: '#8178A2',
          slate:    '#64748B',
          stone:    '#78716C',
        },
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },

      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },

      boxShadow: {
        // Subtle, clean elevation — NO glow
        'card':    '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-md': '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)',
        'card-lg': '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -4px rgba(0,0,0,0.04)',
        'topbar':  '0 1px 0 0 rgba(0,0,0,0.06)',
        'input':   '0 0 0 3px rgba(82,120,166,0.12)',
        // Dark mode elevations
        'card-dark':    '0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px -1px rgba(0,0,0,0.2)',
        'card-md-dark': '0 4px 6px -1px rgba(0,0,0,0.35), 0 2px 4px -2px rgba(0,0,0,0.25)',
        'card-lg-dark': '0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -4px rgba(0,0,0,0.3)',
      },

      animation: {
        'fade-in':   'fadeIn 0.3s ease-out',
        'fade-up':   'fadeUp 0.3s ease-out',
        'slide-in':  'slideIn 0.25s ease-out',
        'shimmer':   'shimmer 1.8s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      transitionDuration: {
        '180': '180ms',
        '220': '220ms',
        '280': '280ms',
      },
    },
  },
  plugins: [],
};
