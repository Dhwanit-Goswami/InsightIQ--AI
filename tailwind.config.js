/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Primary Brand (Muted Professional Blue: #5278A6) ──────────
        primary: {
          DEFAULT: '#5278A6',
          hover:   '#42688F',
          soft:    '#EDF3F8',
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

        // ── Danger / Error (Muted Red: #B76868) ───────────────
        danger: {
          DEFAULT: '#B76868',
          bg:      '#FBF2F2',
          dark:    '#7F4242',
        },

        // ── AI Lavender (Muted AI Accent: #8178A2 - use sparingly) ──
        lavender: {
          DEFAULT: '#8178A2',
          bg:      '#F4F3F8',
          dark:    '#5C5478',
        },

        // ── Light Mode Surfaces (Exact Spec) ──────────────────
        light: {
          bg:         '#F7F7F5',       // main background
          card:       '#FFFFFF',       // card surface
          surface:    '#F1F2EF',       // secondary surface
          border:     '#E2E4E1',       // default border
          divider:    '#EAECE9',       // subtle divider
          'text-primary':   '#20242A', // main text
          'text-secondary': '#626A73', // secondary text
          'text-muted':     '#8A9199', // muted text
          sidebar:    '#FFFFFF',       // sidebar bg
          topbar:     '#FFFFFF',       // topbar bg
        },

        // ── Dark Mode Surfaces (Exact Spec) ───────────────────
        dark: {
          bg:         '#111315',       // main background
          card:       '#181B1F',       // card surface
          surface:    '#1E2227',       // elevated surface
          border:     '#2A2F35',       // default border
          divider:    '#24292E',       // subtle divider
          'text-primary':   '#F4F4F1', // main text
          'text-secondary': '#AEB4BB', // secondary text
          'text-muted':     '#747C85', // muted text
          sidebar:    '#14171A',       // sidebar bg
          topbar:     '#14171A',       // topbar bg
          primary:    '#5B7FAF',       // dark mode primary
          ai:         '#8178B2',       // dark mode AI
        },

        // ── Professional Chart Palette ────────────────────────
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
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],    // 11px
        'xs':  ['0.75rem',   { lineHeight: '1.125rem' }], // 12px
        'sm':  ['0.875rem',  { lineHeight: '1.25rem' }],  // 14px
        'base':['0.9375rem', { lineHeight: '1.4rem' }],   // 15px
        'lg':  ['1.125rem',  { lineHeight: '1.5rem' }],   // 18px
        'xl':  ['1.25rem',   { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['1.5rem',    { lineHeight: '2rem' }],     // 24px
        '3xl': ['1.875rem',  { lineHeight: '2.25rem' }],  // 30px
      },

      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '8px',
        'xl': '11px',
        '2xl': '14px',
      },

      boxShadow: {
        // Restrained, subtle elevation — strictly NO glow or neon
        'card':    '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card-md': '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-lg': '0 6px 12px -2px rgba(0, 0, 0, 0.08), 0 3px 6px -3px rgba(0, 0, 0, 0.05)',
        'topbar':  '0 1px 0 0 rgba(0, 0, 0, 0.05)',
        'card-dark':    '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        'card-md-dark': '0 3px 6px -1px rgba(0, 0, 0, 0.35)',
        'card-lg-dark': '0 8px 16px -2px rgba(0, 0, 0, 0.45)',
      },

      animation: {
        'fade-in':   'fadeIn 0.2s ease-out',
        'fade-up':   'fadeUp 0.22s ease-out',
        'fade-down': 'fadeDown 0.22s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%':   { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      transitionDuration: {
        '180': '180ms',
        '220': '220ms',
        '250': '250ms',
      },
    },
  },
  plugins: [],
};
