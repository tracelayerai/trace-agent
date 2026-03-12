// ── TraceAgent Design Tokens ───────────────────────────────────────────────────
// Single source of truth for all colours, shadows, and transitions.
// Import into any page: import { COLORS, SHADOWS, TRANSITIONS } from '@/tokens/designTokens';

export const COLORS = {
  // ── Text ──────────────────────────────────────────────────────────────────
  text: {
    dark:   '#111827',  // headings, primary labels
    body:   '#374151',  // body copy, metadata values
    light:  '#5C6578',  // secondary labels, hints
    white:  '#FFFFFF',
  },

  // ── Accent ────────────────────────────────────────────────────────────────
  accent: {
    lime:      '#C6FF00',  // focus rings, success highlights
    limeHover: '#B8E600',
    orange:    '#F59E0B',
    red:       '#EF4444',
    green:     '#10B981',
    blue:      '#2563EB',
    teal:      '#003C7E',  // secondary brand color
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  button: {
    primary: {
      rest:  '#1B2D58',  // dark navy — app shell palette
      hover: '#111F3E',  // deep navy
      press: '#152244',  // navy press
    },
    secondary: {         // outline — mirrors INPUT field aesthetic
      bgRest:      '#FAFBFC',          // card bg — matches INPUT.bg
      bgHover:     '#F3F4F6',          // light hover
      bgPress:     '#DBEAFE',          // navy press — matches table row / CustomSelect
      borderRest:  '#E5E7EB',          // light border — matches INPUT.border
      borderHover: '#D1D5DB',          // medium border — matches INPUT.hover.border
      borderPress: '#7B90AA',          // steel-blue — matches INPUT focus border
      shadowRest:  'inset 0 0.5px 1px rgba(0,0,0,0.02)',
      shadowHover: '0 1px 3px rgba(0,0,0,0.06)',
      shadowPress: '0 0 0 3px rgba(123,144,170,0.12), 0 1px 4px rgba(0,0,0,0.05)',
    },
    danger: {            // red outline
      bgRest:      '#FFFFFF',
      bgHover:     '#FEE2E2',
      bgPress:     '#FECACA',
      borderRest:  '#EF4444',
      borderHover: '#DC2626',
      borderPress: '#991B1B',
    },
    ghost: {
      bgRest:   'transparent',
      bgHover:  'rgba(123,144,170,0.10)', // soft blue-grey hover — matches icon.mutedBg
      bgPress:  'rgba(37,99,235,0.10)',   // navy press — aligns with COLORS.icon.activeBg
      bgActive: '#E5E7EB',               // persistent open/toggled state
    },
    disabled: {
      bg:    '#9CA3AF',
      color: '#D1D5DB',
    },
  },

  // ── Icons (ghost interactive) ──────────────────────────────────────────────
  icon: {
    rest:        '#717A8C',
    hover:       '#4A5568',
    press:       '#0F0F1A',
    restMuted:   '#7B90AA',    // steel-blue at rest for navy-accent ghost icons
    active:      '#2563EB',    // cobalt navy — filter/action active state
    activeHover: '#1D4ED8',    // darker navy on hover when active
    activeBg:    'rgba(37,99,235,0.10)',
    mutedBg:     'rgba(123,144,170,0.10)',
    size:        16,           // standard ghost icon button icon size
    dim:         38,           // touch target — matches INPUT.height
  },

  // ── Inline action link ────────────────────────────────────────────────────
  link: {
    rest:  '#3B82F6',
    hover: '#0F5A9F',
    press: '#0F3A7D',
  },

  // ── Borders ───────────────────────────────────────────────────────────────
  border: {
    light:  '#D1D5DB',
    medium: '#B0BCC8',
  },

  // ── Backgrounds ───────────────────────────────────────────────────────────
  bg: {
    page:   '#F5F7FA',
    card:   '#FAFBFC',
    light:  '#F3F4F6',
    lighter:'#E5E7EB',
    white:  '#FFFFFF',
    frame:  '#070D1F',   // dark navy chrome/nav shell
    search: '#0F1C3A',   // dark navy top nav
  },

  // ── Status ────────────────────────────────────────────────────────────────
  status: {
    openBg:     '#DBEAFE',
    openText:   '#1D4ED8',
    criticalBg: '#FEE2E2',
    criticalText:'#B91C1C',
  },

  // ── Roles ─────────────────────────────────────────────────────────────────
  // Single source of truth for role identity colours.
  // Used in: Login role chips, AdminPage badges, Sidebar indicator, stat card accents.
  role: {
    analyst: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
    lead:    { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
    admin:   { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  },
};

// ── Shadows ───────────────────────────────────────────────────────────────────
export const SHADOWS = {
  subtle:   '0 1px 3px rgba(0,0,0,0.10)',
  card:     '0 1px 4px rgba(0,0,0,0.04)',
  elevated: '0 4px 12px rgba(0,0,0,0.15)',
  pressed:  '0 1px 2px rgba(0,0,0,0.08)',
  dark:     {
    rest:  '0 1px 3px rgba(0,0,0,0.18)',
    hover: '0 4px 12px rgba(0,0,0,0.30)',
    press: '0 1px 2px rgba(0,0,0,0.30)',
  },
};

// ── Typography ────────────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  fontSans: "Inter, system-ui, -apple-system, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
  fontDisplay: "'Sora', sans-serif",
  size: {
    xs:  11,
    sm:  12,
    md:  13,
    lg:  14,
    xl:  16,
    h2:  20,
    h1:  24,
  },
  weight: {
    light:     300,
    regular:   400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
  },
};

// ── Transitions ───────────────────────────────────────────────────────────────
export const TRANSITIONS = {
  standard: '0.2s ease-in-out',
  fast:     '0.15s ease-in-out',
};

// All radii intentionally stepped up for iOS-style smooth corners (squircle feel)
// ── Border radius ─────────────────────────────────────────────────────────────
export const RADIUS = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   20,
  xxl:  28,
  pill: 50,
  full: 9999,
};

// ── Card Tokens ───────────────────────────────────────────────────────────────

// Baseline — every card variant shares these
export const CARD = {
  background:   '#FFFFFF',
  border:       '1px solid #E5E7EB',
  borderRadius: 12,
  padding:      16,
  shadow:       '0 1px 3px rgba(0,0,0,0.05)',
  shadowHover:  '0 2px 8px rgba(0,0,0,0.10)',
  // Heights — 'auto' cards size to content; metric is fixed
  height: {
    metric:  176,   // MetricCard + GaugeMetric — single source of truth (CARD_H)
    stat:    'auto',
    info:    'auto',
    details: 'auto',
  },
};

// ── StatCard ──────────────────────────────────────────────────────────────────
export const STAT_CARD = {
  label: {
    fontSize:      11,
    fontWeight:    700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color:         '#717A8C',
    marginBottom:  6,
  },
  number: {
    fontSize:   30,
    fontWeight: 700,
    lineHeight: 1,
    color:      '#1A1F35',
    fontFamily: "'Sora', sans-serif",
  },
  bar: {
    height:       6,
    borderRadius: 999,
    width:        4,
    widthActive:  12,
  },
  accentColors: {
    grey:   '#9CA3AF',
    orange: '#F59E0B',
    red:    '#EF4444',
    green:  '#10B981',
  },
};

// ── MetricCard ────────────────────────────────────────────────────────────────
export const METRIC_CARD = {
  label: {
    fontSize:      11,
    fontWeight:    700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color:         '#717A8C',
    marginBottom:  8,
  },
  number: {
    fontSize:   32,
    fontWeight: 700,
    color:      '#1A1F35',
    fontFamily: "'Sora', sans-serif",
  },

  // Variant 1 — Gradient Bar (horizontal)
  gradientBar: {
    height:       6,
    borderRadius: 3,
    trackColor:   '#E5E7EB',
    // fill goes green → yellow → red (low=safe, high=risk)
    gradient: 'linear-gradient(to right, #10B981 0%, #F59E0B 50%, #EF4444 100%)',
    dot: {
      size:        14,
      background:  '#FFFFFF',
      border:      '2.5px solid #374151',
      shadow:      '0 1px 4px rgba(0,0,0,0.25)',
    },
    labels: ['0 · Low', '50 · Med', '100 · High'],
  },

  // Variant 2 — Gauge (semicircle)
  gauge: {
    trackColor:   '#E5E7EB',
    strokeWidth:  10,
    // gradient mapped across arc: red(poor) → amber → green(excellent)
    gradient: {
      poor:      '#EF4444',
      mid:       '#F59E0B',
      excellent: '#10B981',
    },
    labels: ['POOR', 'EXCELLENT'],
  },

  // Variant 3 — Vertical Bar
  verticalBar: {
    width:        14,
    borderRadius: 6,
    trackColor:   '#E5E7EB',
    // fill rises bottom→top: green(low) → amber → red(high risk)
    gradient: 'linear-gradient(to top, #10B981, #F59E0B 50%, #EF4444)',
    labels: { bottom: 'Low', top: 'High' },
  },

  // Variant 4 — Dots
  dots: {
    size:          8,
    gap:           4,
    activeColor:   '#10B981',    // filled dot
    inactiveColor: '#D1D5DB',    // unfilled dot
    highlightRing: '0 0 0 2px', // box-shadow ring on active
  },

  // Variant 5 — Chips / Badges
  chips: {
    padding:      '8px 14px',
    borderRadius: 20,
    fontSize:     12,
    fontWeight:   600,
    colors: {
      eth:  { bg: '#EEF2FF', text: '#4F46E5' },
      arb:  { bg: '#FEF3C7', text: '#92400E' },
      pol:  { bg: '#F0FDF4', text: '#166534' },
      grey: { bg: '#F3F4F6', text: '#374151' },
    },
  },
};

// ── InfoCard ──────────────────────────────────────────────────────────────────
export const INFO_CARD = {
  icon: {
    size:  16,
    color: '#717A8C',
  },
  number: {
    fontSize:   24,
    fontWeight: 700,
    color:      '#1A1F35',
    fontFamily: "'Sora', sans-serif",
  },
  label: {
    fontSize: 12,
    color:    '#717A8C',
    marginTop: 3,
  },
};

// ── DetailsCard ───────────────────────────────────────────────────────────────
export const DETAILS_CARD = {
  title: {
    fontSize:   14,
    fontWeight: 600,
    color:      '#1A1F35',
  },
  label: {
    fontSize:   12,
    fontWeight: 400,
    color:      '#717A8C',
  },
  value: {
    fontSize:   14,
    fontFamily: "'JetBrains Mono', monospace",
    color:      '#1A1F35',
  },
  // Row layout variants
  layout: {
    vertical:   'column',   // label above value
    horizontal: 'row',      // label left, value right
  },
};

// ── Input / Select ────────────────────────────────────────────────────────────
export const INPUT = {
  bg:           '#FFFFFF',
  border:       `1px solid ${COLORS.border.light}`,
  borderRadius: RADIUS.md,
  padding:      '9px 14px',
  height:       38,
  fontSize:     TYPOGRAPHY.size.lg,
  color:        COLORS.text.dark,
  shadow:       'inset 0 1px 2px rgba(0,0,0,0.04)',
  transition:   'border-color 0.15s, box-shadow 0.15s, background 0.15s',
  hover: {
    border: `1px solid ${COLORS.border.medium}`,
    shadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  focus: {
    border: '1px solid #4B7AC7',
    shadow: '0 0 0 3px rgba(37,99,235,0.10), 0 1px 4px rgba(0,0,0,0.05)',
  },
  select: {
    bg:           '#FFFFFF',
    border:       `1px solid ${COLORS.border.light}`,
    borderRadius: RADIUS.md,
    padding:      '9px 14px',
    height:       38,
    fontSize:     TYPOGRAPHY.size.lg,
    color:        COLORS.text.dark,
    minWidth:     140,
    hover: {
      border: `1px solid ${COLORS.border.medium}`,
      shadow: '0 1px 4px rgba(0,0,0,0.08)',
    },
    focus: {
      border: '1px solid #4B7AC7',
      shadow: '0 0 0 3px rgba(37,99,235,0.10), 0 1px 4px rgba(0,0,0,0.05)',
    },
  },
};

// ── Status & Risk Chip ────────────────────────────────────────────────────────
// Single source of truth for ALL status/risk chip visuals.
// Used in: header status row, grids, search history, any badge context.
// Props on StatusChip: status | risk | dot | size | label
export const CHIP = {
  borderRadius: 20,
  fontWeight:   600,

  // Size variants — only affect padding, font, dot size
  size: {
    xs: { padding: '3px 8px',   fontSize: 10 },
    sm: { fontSize: 11, fontWeight: 600, padding: '3px 8px',  dotSize: 6, gap: 4 },
    md: { fontSize: 12, fontWeight: 600, padding: '4px 10px', dotSize: 7, gap: 5 },
  },

  // Tag size variants — chain/typology chips (Tag component)
  tag: {
    md: { fontSize: 13, paddingChain: '3px 12px 3px 4px', paddingPlain: '4px 12px', iconDim: 20, iconFontSize: 11, borderRadius: 16 },
    sm: { fontSize: 11, paddingChain: '2px 8px 2px 3px',  paddingPlain: '2px 8px',  iconDim: 15, iconFontSize: 9,  borderRadius: 20 },
  },

  // Legacy colour map — used by SearchBar (keep for backward compat)
  colors: {
    eth:  { bg: '#EEF2FF', text: '#4F46E5' },
    arb:  { bg: '#FEF3C7', text: '#92400E' },
    pol:  { bg: '#F0FDF4', text: '#166534' },
    grey: { bg: '#F3F4F6', text: '#374151' },
    red:  { bg: '#FEE2E2', text: '#B91C1C' },
  },

  // Status tokens — add new statuses here, never hardcode in components
  status: {
    'open':             { bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6',  label: 'Open'             },
    'under-review':     { bg: '#EDE9FE', color: '#5B21B6', dot: '#7C3AED',  label: 'Under Review'     },
    'pending-approval': { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B',  label: 'Pending Approval' },
    'returned':         { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444',  label: 'Returned'         },
    'approved':         { bg: '#D1FAE5', color: '#065F46', dot: '#10B981',  label: 'Approved'         },
    'escalated':        { bg: '#FEE2E2', color: '#B91C1C', dot: '#EF4444',  label: 'Escalated'        },
    'closed':           { bg: '#F3F4F6', color: '#4B5563', dot: '#9CA3AF',  label: 'Closed'           },
    'archived':         { bg: '#F3F4F6', color: '#9CA3AF', dot: '#D1D5DB',  label: 'Archived'         },
    'reopened':         { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B',  label: 'Reopened'         },
  },

  // Risk tokens — add new levels here
  risk: {
    'Critical': { bg: '#FEE2E2', color: '#B91C1C', dot: '#EF4444' },
    'High':     { bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
    'Medium':   { bg: '#FFFBEB', color: '#92400E', dot: '#F59E0B' },
    'Low':      { bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  },
};

// ── Table ─────────────────────────────────────────────────────────────────────
export const TABLE = {
  // Outer wrapper
  bg:           '#FFFFFF',
  border:       '1px solid #ECEEF2',
  borderRadius: 12,

  // Column header
  header: {
    bg:           '#FAFBFC',
    borderBottom: '1px solid #ECEEF2',
    fontSize:     11,
    fontWeight:   500,
    color:        '#717A8C',
    letterSpacing:'0.06em',
    textTransform:'uppercase',
  },

  // Body rows
  row: {
    borderBottom: '1px solid #F3F4F6',
    hoverBg:      '#F8F9FB',   // all rows — read-only and tappable
    pressedBg:    '#DBEAFE',   // tappable rows only — matches CustomSelect selected state
    fontSize:     13,
    color:        '#374151',
  },

  // Density variants — change padding only, everything else stays
  density: {
    compact: { headerPadding: '9px 16px',  rowPadding: '9px 16px'  },
    relaxed: { headerPadding: '13px 20px', rowPadding: '14px 20px' },
  },

  // ── Cell type tokens ──────────────────────────────────────────────────────
  // Use as column.type in column definitions.
  // Add new types here to extend the system — never hardcode in pages.
  cell: {
    // Default plain text — inherits row.fontSize / row.color
    plain: {
      fontSize: 13, color: '#374151',
    },
    // Monospace — addresses, dates, short codes
    mono: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12, fontWeight: 400, color: '#4A5568',
    },
    // Monospace bold — primary IDs / case numbers
    monoId: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13, fontWeight: 600, color: '#2D3142',
    },
    // Numeric score — rendered with dynamic colour by caller
    numeric: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 14, fontWeight: 700,
    },
    // Muted italic — empty / unassigned states
    muted: {
      fontSize: 12, color: '#9CA3AF', fontStyle: 'italic',
    },
    // Accent dot + label — risk level, severity indicators
    riskDot: {
      dotSize: 7,
      gap: 6,
      colors: {
        Critical: '#EF4444',
        High:     '#F97316',
        Medium:   '#F59E0B',
        Low:      '#22C55E',
      },
      defaultColor: '#9CA3AF',
      text: { fontSize: 13, fontWeight: 500, color: '#4A5568' },
    },
  },
};

// ── Callout / Alert Note ───────────────────────────────────────────────────────
// Inline callout card: left-border accent + tinted background.
// severity: 'info' | 'success' | 'warning' | 'critical'
export const CALLOUT = {
  borderRadius: 12,
  accentWidth:  4,      // px — left border bar
  padding:      '14px 16px',
  labelSize:    11,
  textSize:     13,
  lineHeight:   1.65,
  variants: {
    info: {                         // AI / neutral — indigo
      bg:         '#EEF2FF',
      border:     '1px solid #C7D2FE',
      accent:     '#6366F1',
      labelColor: '#6366F1',
      textColor:  '#3730A3',
    },
    success: {                      // Good / clear — green
      bg:         '#F0FDF4',
      border:     '1px solid #BBF7D0',
      accent:     '#10B981',
      labelColor: '#065F46',
      textColor:  '#064E3B',
    },
    warning: {                      // OK / moderate — amber
      bg:         '#FFFBEB',
      border:     '1px solid #FDE68A',
      accent:     '#F59E0B',
      labelColor: '#92400E',
      textColor:  '#78350F',
    },
    critical: {                     // Bad / high risk — red
      bg:         '#FEF2F2',
      border:     '1px solid #FECACA',
      accent:     '#EF4444',
      labelColor: '#B91C1C',
      textColor:  '#7F1D1D',
    },
  },
};

// ── SearchBar ─────────────────────────────────────────────────────────────────
export const SEARCHBAR = {
  brandColor: '#C6FF00',
  padding: '10px 20px',
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: '0.1em',
  resting: {
    bg: 'rgba(0,0,0,0.55)',
    border: '1px solid rgba(255,255,255,0.18)',
    shadow: 'none',
    textColor: 'rgba(255,255,255,0.9)',
    iconColor: 'rgba(255,255,255,0.5)',
  },
  active: {
    bg: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.35)',
    shadow: 'none',
    textColor: '#FFFFFF',
    iconColor: '#C6FF00',
  },
  page: {
    bg: '#FFFFFF',
    bgActive: '#FFFFFF',
    border: '1.5px solid #E5E7EB',
    borderActive: '1.5px solid #C6FF00',
    shadow: '0 1px 4px rgba(0,0,0,0.06)',
    shadowActive: '0 2px 10px rgba(198,255,0,0.18)',
  },
  shortcutHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    bg: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    padding: '2px 6px',
    borderRadius: 4,
  },
  dropdown: {
    bg:     '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    shadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
  },
  dropdownDark: {
    bg:         '#0F1C3A',   // matches SURFACE.nav.bg — pure dark navy, no teal
    border:     '1px solid rgba(255,255,255,0.10)',
    headerBg:   'rgba(255,255,255,0.03)',
    headerBorder: '1px solid rgba(255,255,255,0.07)',
    footerBg:   'rgba(255,255,255,0.03)',
    shadow:     '0 24px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)',
    rowHover:   'rgba(255,255,255,0.06)',
  },

  // ── Light variant — white pill, steel-blue focus ───────────────────────────
  light: {
    borderRadius:        25,
    inputFontSize:       15,
    placeholderFontSize: 13,
    textColor:           '#1A1F35',
    accentColor:         '#4B7AC7',   // focus stroke · caret · icon-focused
    resting: {
      bg:          '#FFFFFF',
      border:      '1.5px solid #E2E5EB',
      shadow:      '0 1px 4px rgba(0,0,0,0.04)',
      iconColor:   '#B0B8C8',
      placeholder: '#B0B8C8',
    },
    hover: {
      bg:        '#FCFCFD',
      border:    '1.5px solid #BFCAD5',
      shadow:    '0 2px 14px rgba(0,0,0,0.07)',
      iconColor: '#9BAABB',
    },
    focus: {
      border:    '1.5px solid #4B7AC7',
      shadow:    '0 0 0 4px rgba(37,99,235,0.10), 0 4px 20px rgba(0,0,0,0.06)',
      iconColor: '#4B7AC7',
    },
    shortcutHint: {
      color:  '#9CA3AF',
      bg:     '#F5F7FA',
      border: '1px solid #E2E5EB',
    },
    pasteBtn: {
      bg:     '#F5F7FA',
      border: '#E2E5EB',
      color:  '#9CA3AF',
      hover: {
        bg:     'rgba(123,144,170,0.09)',
        border: 'rgba(123,144,170,0.35)',
        color:  '#5A6B7E',
      },
    },
  },
};

// ── Modal ─────────────────────────────────────────────────────────────────────
// Dark-theme tokens for side panel / overlay form internals only.
// Regular modals use theme="light". Apply these only inside dark side panels.
export const MODAL = {
  // Label above a field
  label: {
    fontSize: 12, fontWeight: 600,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6, display: 'block',
  },
  // Base field object — spread as inline style, then override with hover/focus via events
  field: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: RADIUS.md,
    padding: '9px 14px',
    height: 38,
    fontSize: 13,
    color: '#E5E7EB',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border 0.15s, box-shadow 0.15s',
    // Events — apply these in onMouseEnter/onFocus handlers
    hover: {
      border: '1px solid rgba(255,255,255,0.22)',
      boxShadow: '0 1px 6px rgba(0,0,0,0.25)',
    },
    focus: {
      border: '1px solid rgba(198,255,0,0.45)',
      boxShadow: '0 0 0 3px rgba(198,255,0,0.08)',
    },
    reset: {
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: 'none',
    },
  },
  // Textarea — same as field but no fixed height
  textarea: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: RADIUS.md,
    padding: '9px 14px',
    fontSize: 13,
    color: '#E5E7EB',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    boxSizing: 'border-box',
    transition: 'border 0.15s, box-shadow 0.15s',
    hover: {
      border: '1px solid rgba(255,255,255,0.22)',
      boxShadow: '0 1px 6px rgba(0,0,0,0.25)',
    },
    focus: {
      border: '1px solid rgba(198,255,0,0.45)',
      boxShadow: '0 0 0 3px rgba(198,255,0,0.08)',
    },
    reset: {
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: 'none',
    },
  },
  // Body / description text inside modal
  bodyText: { fontSize: 13, color: '#B0B8C8', lineHeight: 1.55 },
  // Divider
  divider: 'rgba(255,255,255,0.07)',
};

// ── Alert / Confirmation Dialog ───────────────────────────────────────────────
// Light-theme destructive and warning confirmation modals.
// Use theme="light" on Modal; apply ALERT tokens inside for severity context.
export const ALERT = {
  danger: {
    iconColor:  '#EF4444',
    iconBg:     '#FEE2E2',
    titleColor: '#111827',
    bodyColor:  '#374151',
  },
  warning: {
    iconColor:  '#F59E0B',
    iconBg:     '#FEF3C7',
    titleColor: '#111827',
    bodyColor:  '#374151',
  },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
// Token reference for the Toast component variants. Used in Toast.jsx.
// Call showToast(message, 'success' | 'error' | 'info') via useToast().
export const TOAST = {
  borderRadius: RADIUS.md,
  padding:      '12px 20px',
  fontSize:      13,
  fontWeight:    500,
  shadow:        '0 4px 20px rgba(0,0,0,0.25)',
  variants: {
    success: { bg: '#22C55E', color: '#FFFFFF' },
    error:   { bg: '#EF4444', color: '#FFFFFF' },
    info:    { bg: '#2D3142', color: '#FFFFFF' },
  },
};

// ── Empty State ───────────────────────────────────────────────────────────────
// Use inside any table/panel when filtered results return zero rows.
// Deliberately subtle — user should focus on refining filters, not the empty state.
export const EMPTY_STATE = {
  wrapper: {
    padding: '48px 24px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  icon:     { size: 28, color: '#D1D5DB' },
  title:    { fontSize: 13, fontWeight: 600, color: '#9CA3AF', margin: 0 },
  subtitle: { fontSize: 12, color: '#B0B8C8', textAlign: 'center', margin: 0 },
};

// ── Modal size variants ────────────────────────────────────────────────────────
// Usage: <Modal size="md"> or <Modal size="lg">
// width in px — maps to the size prop on the Modal component
export const MODAL_SIZE = {
  sm:  400,   // compact — confirm dialogs, single-field actions
  md:  480,   // standard — Change Lead, short forms  ← default
  lg:  580,   // wide — multi-column forms (Reassign Case)
  xl:  720,   // extra wide — rich content modals
};

// ── Dashboard Widget ──────────────────────────────────────────────────────────
// Tokens for DashWidget containers used exclusively in Dashboard_v4.
// Title: one step below SURFACE.panelTitle (12→11, weight 600→700, lighter color)
// Action: ghost pill — no arrow, subtle border, hover brightens
export const DASH_WIDGET = {
  title: {
    fontSize:      11,
    fontWeight:    700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color:         '#9CA3AF',
    margin:        0,
  },
  // Spread directly onto <button> style; onMouseEnter/Leave toggle hover state
  action: {
    display:      'inline-flex',
    alignItems:   'center',
    fontSize:     11,
    fontWeight:   600,
    color:        '#9CA3AF',
    background:   'transparent',
    border:       '1px solid #E5E7EB',
    borderRadius: 20,
    padding:      '3px 10px',
    cursor:       'pointer',
    fontFamily:   'inherit',
    lineHeight:   1,
    outline:      'none',
    flexShrink:   0,
  },
  actionHover: {
    background: 'rgba(123,144,170,0.10)',
    color:      '#6B7280',
  },
};

// ── Surface & Layout ──────────────────────────────────────────────────────────
export const SURFACE = {
  frame: {
    bg: 'linear-gradient(160deg, #060C1A 0%, #0C1D3C 55%, #091630 100%)',
    padding: 8,
    borderRadius: RADIUS.lg,
  },
  nav: {
    bg: '#0F1C3A',
    height: 44,
    paddingX: 20,
    gap: 16,
    borderRadius: RADIUS.lg,
    border: '1px solid rgba(255,255,255,0.08)',
    shadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.04)',
  },
  content: {
    bg:     '#FFFFFF',
    bodyBg: 'linear-gradient(180deg, #F5F6FA 0%, #EAEBF0 60%, #E3E4EA 100%)',
    padding: '24px 32px',
    gap: 20,
    panelTop: 8,
    borderRadius: 12,
    shadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 2px 8px rgba(0,0,0,0.03), inset 0 -2px 8px rgba(0,0,0,0.02)',
  },
  // ── Page header — sits flush against the top/left/right of the content surface
  // One token to rule all headers: CaseFile (full), Cases/Search/Dashboard (title only)
  header: {
    bg:            '#FFFFFF',
    padding:            '20px 32px',    // case detail — more room for tall header content
    paddingTitleOnly:   '14px 32px',    // title-only and title+CTA pages (compact)
    paddingX:      32,                  // extracted for full-bleed negative margins
    paddingY:      20,                  // extracted for full-bleed negative top margin
    paddingBottom: 14,
    borderBottom:  '1px solid #ECEEF2',
    borderRadius:  `12px 12px 0 0`,
    shadow:        '0 1px 0 rgba(0,0,0,0.03)',
    // Breadcrumb — full-bleed subtle strip flush to the top of the header card
    breadcrumbStrip: {
      bg:           'transparent',      // blends with white header; border alone is the separator
      borderBottom: '1px solid #ECEEF2',
      fontSize:     11,
      fontWeight:   500,
      color:        '#9CA3AF',
      hoverColor:   '#6B7280',
      paddingY:     7,                  // top/bottom padding of the strip itself
      marginBottom: 12,                 // gap from strip to title group
    },
    // Title group (title + wallet + chips) — gap before status box
    titleRow: {
      gap:          5,                  // (unused — rows are now siblings, not flex column)
      marginBottom: 14,                 // gap from title/chips row down to status box
    },
    // Status bar — stretches within header padding, top+bottom border
    statusBox: {
      bg:           '#F8F9FB',
      borderTop:    '1px solid #ECEEF2',
      borderBottom: '1px solid #ECEEF2',
      borderRadius: 6,
      padding:      '4px 12px',
      gap:          6,
      fontSize:     11,
      marginTop:    0,                  // titleRow.marginBottom owns the gap above; no double-count
    },
    // Tab strip — flush at bottom of header
    tabStrip: {
      marginTop:   24,                  // gap from status box to tabs
      tabPaddingX: 20,
      tabPaddingY: 9,
      fontSize:    13,
      // Item states — hover/press bg shared with SURFACE.menuItem for consistency
      default:  { color: '#717A8C', fontWeight: 400,   bg: 'transparent' },
      hover:    { color: '#4A5568', fontWeight: 400,   bg: '#F5F7FA', borderRadius: '6px 6px 0 0' },
      press:    { color: '#2D3142', fontWeight: 600,   bg: '#DBEAFE', borderRadius: '6px 6px 0 0' },
      active:   { color: '#1A1F35', fontWeight: 600,   indicator: '#003C7E' },
    },
    // Page heading — full H1 (28px / 700) e.g. large hero titles
    pageHeading: {
      fontFamily: TYPOGRAPHY.fontDisplay,
      fontSize:   28,
      fontWeight: 700,
      letterSpacing: '-0.5px',
      lineHeight: 1.2,
      color:      '#1A1F35',
    },
    // Page heading compact — used inside the CaseHeader card (20px / 600)
    pageHeadingSm: {
      fontFamily: TYPOGRAPHY.fontDisplay,
      fontSize:   20,
      fontWeight: 600,
      letterSpacing: '-0.3px',
      lineHeight: 1.2,
      color:      '#1A1F35',
    },
  },
  // Menu item — used by MoreMenu, lead dropdowns, and any contextual action list
  menuItem: {
    padding:      '9px 12px',
    borderRadius: 8,
    fontSize:     13,
    gap:          8,
    marginBottom: 2,
    transition:   'all 0.12s',
    default:  { bg: 'none',      color: '#4A5568', fontWeight: 400 },
    hover:    { bg: '#F5F7FA',   color: '#4A5568', fontWeight: 400, transform: 'translateX(2px)' },
    press:    { bg: '#DBEAFE',   color: '#2D3142', fontWeight: 600 },
    danger: {
      default: { color: '#EF4444' },
      press:   { bg: '#FEE2E2',  color: '#EF4444' },
    },
  },
  panel: {
    bg: '#FFFFFF',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid #ECEEF2',
    shadow: '0 1px 2px rgba(0,0,0,0.02)',
  },
  // ── Right-side overlay panel — shared by Notes and Analysis panels ──────────
  overlay: {
    width:      360,
    bg:         '#FFFFFF',
    borderLeft: '1px solid #ECEEF2',
    shadow:     '-6px 0 28px rgba(0,0,0,0.09), -1px 0 4px rgba(0,0,0,0.04)',
    header: {
      padding:       '16px 20px',
      borderBottom:  '1px solid #ECEEF2',
      titleSize:     14,
      titleWeight:   700,
      titleColor:    '#0A0A0F',
      subtitleSize:  12,
      subtitleColor: '#9CA3AF',
    },
    body: {
      padding: '14px 20px',
    },
    footer: {
      padding:     '12px 16px',
      borderTop:   '1px solid #ECEEF2',
      bg:          '#F8F9FB',
    },
    separator: '1px solid #ECEEF2',
    sectionLabel: {
      fontSize:      11,
      fontWeight:    700,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color:         '#9CA3AF',
      marginBottom:  8,
    },
    bodyText: { fontSize: 13, color: '#374151', lineHeight: 1.45 },
  },
  card: {
    bg:          '#FFFFFF',
    padding:     16,
    borderRadius: 12,
    border:      '1px solid #E5E7EB',
    borderHover: '1px solid #D1D5DB',
    shadow:      '0 1px 3px rgba(0,0,0,0.05)',
    shadowHover: '0 4px 12px rgba(0,0,0,0.10)',
    shadowPress: '0 2px 6px rgba(0,0,0,0.08)',
    gap: 24,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: COLORS.text.light,
    marginBottom: 16,
  },
  // Panel section title row — flex, accommodates sm action on right
  panelTitle: {
    fontSize:      12,
    fontWeight:    600,
    color:         '#4B5563',        // one step darker — readable section label
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    rowHeight:     32,               // matches Btn size="sm" — breathing + alignment
    marginBottom:  12,
  },
  pageHeading: {
    fontFamily: TYPOGRAPHY.fontDisplay,
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    lineHeight: 1.2,
    color: '#1A1F35',
  },
  sectionHeading: {
    fontFamily: TYPOGRAPHY.fontDisplay,
    fontSize: TYPOGRAPHY.size.lg,      // 14px — compact section label
    fontWeight: TYPOGRAPHY.weight.medium,
    letterSpacing: '-0.2px',
    lineHeight: 1.2,
    color: '#717A8C',
  },
  pageSubheading: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.regular,
    color: COLORS.text.light,
    marginTop: 4,
  },
  sidebar: {
    bg: '#0A1528',
    borderRadius: RADIUS.lg,
    width: 64,
    widthExpanded: 240,
    paddingY: 12,
    paddingX: 8,
    iconColor: 'rgba(255,255,255,0.4)',
    iconColorActive: '#C6FF00',
    iconBgActive: 'rgba(198,255,0,0.08)',
    iconBgHover: 'rgba(255,255,255,0.06)',
    divider: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.07)',
    shadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
    // Panel chrome — set to 'transparent'/'none' to hide, restore values shown in comments
    panelBg:     'transparent',                        // restore: sb.bg (#0F1628)
    panelBorder: 'none',                               // restore: sb.border
    panelShadow: 'none',                               // restore: sb.shadow
  },
  tokenRow: {
    labelColor: COLORS.text.light,
    valueColor: COLORS.text.dark,
    bg: COLORS.bg.card,
    borderRadius: RADIUS.md,
    padding: '10px 16px',
    border: `1px solid ${COLORS.border.light}`,
  },
};

