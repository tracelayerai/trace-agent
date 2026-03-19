/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ── Colors — all mapped to CSS variables ─────────────────────────────
      colors: {
        // Shadcn semantic tokens (used by shadcn components)
        background:   'var(--background)',
        foreground:   'var(--foreground)',
        border:       'var(--border)',
        input:        'var(--input)',
        ring:         'var(--ring)',
        primary: {
          DEFAULT:    'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT:    'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT:    'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT:    'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        sidebar: {
          DEFAULT:    'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary:    'var(--sidebar-primary)',
          accent:     'var(--sidebar-accent)',
          border:     'var(--sidebar-border)',
          ring:       'var(--sidebar-ring)',
        },

        // ── Trace brand tokens ──────────────────────────────────────────────
        trace: {
          // Text
          'text-dark':    'var(--trace-text-dark)',
          'text-body':    'var(--trace-text-body)',
          'text-light':   'var(--trace-text-light)',
          'text-muted':   'var(--trace-text-muted)',

          // Accent
          lime:           'var(--trace-lime)',
          'lime-hover':   'var(--trace-lime-hover)',
          orange:         'var(--trace-orange)',
          red:            'var(--trace-red)',
          green:          'var(--trace-green)',
          blue:           'var(--trace-blue)',
          teal:           'var(--trace-teal)',

          // Backgrounds
          'bg-page':      'var(--trace-bg-page)',
          'bg-card':      'var(--trace-bg-card)',
          'bg-light':     'var(--trace-bg-light)',
          'bg-lighter':   'var(--trace-bg-lighter)',
          'bg-frame':     'var(--trace-bg-frame)',
          'bg-nav':       'var(--trace-bg-nav)',
          'bg-sidebar':   'var(--trace-bg-sidebar)',

          // Borders
          'border-light':  'var(--trace-border-light)',
          'border-medium': 'var(--trace-border-medium)',
          'border-table':  'var(--trace-border-table)',

          // Buttons
          'btn-primary':        'var(--trace-btn-primary)',
          'btn-primary-hover':  'var(--trace-btn-primary-hover)',

          // Icons
          'icon-rest':    'var(--trace-icon-rest)',
          'icon-hover':   'var(--trace-icon-hover)',
          'icon-muted':   'var(--trace-icon-muted)',
          'icon-active':  'var(--trace-icon-active)',

          // Links
          'link':         'var(--trace-link)',
          'link-hover':   'var(--trace-link-hover)',

          // Roles
          'role-analyst': 'var(--trace-role-analyst)',
          'role-lead':    'var(--trace-role-lead)',
          'role-admin':   'var(--trace-role-admin)',

          // Status
          'status-open-bg':       'var(--trace-status-open-bg)',
          'status-open-text':     'var(--trace-status-open-text)',
          'status-review-bg':     'var(--trace-status-review-bg)',
          'status-review-text':   'var(--trace-status-review-text)',
          'status-pending-bg':    'var(--trace-status-pending-bg)',
          'status-pending-text':  'var(--trace-status-pending-text)',
          'status-returned-bg':   'var(--trace-status-returned-bg)',
          'status-returned-text': 'var(--trace-status-returned-text)',
          'status-approved-bg':   'var(--trace-status-approved-bg)',
          'status-approved-text': 'var(--trace-status-approved-text)',
          'status-closed-bg':     'var(--trace-status-closed-bg)',
          'status-closed-text':   'var(--trace-status-closed-text)',
          'status-archived-text': 'var(--trace-status-archived-text)',

          // Risk
          'risk-critical-bg':   'var(--trace-risk-critical-bg)',
          'risk-critical-text': 'var(--trace-risk-critical-text)',
          'risk-critical-dot':  'var(--trace-risk-critical-dot)',
          'risk-high-bg':       'var(--trace-risk-high-bg)',
          'risk-high-text':     'var(--trace-risk-high-text)',
          'risk-high-dot':      'var(--trace-risk-high-dot)',
          'risk-medium-bg':     'var(--trace-risk-medium-bg)',
          'risk-medium-text':   'var(--trace-risk-medium-text)',
          'risk-medium-dot':    'var(--trace-risk-medium-dot)',
          'risk-low-bg':        'var(--trace-risk-low-bg)',
          'risk-low-text':      'var(--trace-risk-low-text)',
          'risk-low-dot':       'var(--trace-risk-low-dot)',
        },
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        display: ['Sora', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '14px' }],
        'sm':   ['12px', { lineHeight: '16px' }],
        'base': ['13px', { lineHeight: '18px' }],
        'md':   ['14px', { lineHeight: '20px' }],
        'lg':   ['16px', { lineHeight: '24px' }],
        'xl':   ['20px', { lineHeight: '24px' }],
        '2xl':  ['24px', { lineHeight: '29px' }],
        '3xl':  ['28px', { lineHeight: '34px' }],
        '4xl':  ['32px', { lineHeight: '38px' }],
      },

      // ── Border radius ─────────────────────────────────────────────────────
      borderRadius: {
        sm:   'var(--trace-radius-sm)',   // 6px
        md:   'var(--trace-radius-md)',   // 10px
        lg:   'var(--trace-radius-lg)',   // 16px
        xl:   'var(--trace-radius-xl)',   // 20px
        xxl:  'var(--trace-radius-xxl)',  // 28px
        pill: 'var(--trace-radius-pill)', // 50px
        full: '9999px',
      },

      // ── Spacing ───────────────────────────────────────────────────────────
      spacing: {
        xs:  'var(--trace-space-xs)',   // 4px
        sm:  'var(--trace-space-sm)',   // 8px
        md:  'var(--trace-space-md)',   // 16px
        lg:  'var(--trace-space-lg)',   // 24px
        xl:  'var(--trace-space-xl)',   // 32px
        '2xl': 'var(--trace-space-2xl)', // 48px
        '3xl': 'var(--trace-space-3xl)', // 64px
      },

      // ── Shadows ───────────────────────────────────────────────────────────
      boxShadow: {
        card:     'var(--trace-shadow-card)',
        subtle:   'var(--trace-shadow-subtle)',
        elevated: 'var(--trace-shadow-elevated)',
        pressed:  'var(--trace-shadow-pressed)',
        nav:      'var(--trace-shadow-nav)',
        overlay:  'var(--trace-shadow-overlay)',
      },
    },
  },
  plugins: [],
}
