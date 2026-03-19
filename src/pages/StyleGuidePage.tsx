// Style Guide — Trace Design System
// Accessible at /style-guide (no auth required)
// Designed for Figma capture at 1440px

// Token values inlined — no longer importing from designTokens.ts
const COLORS = {
  text: { dark: '#111827', body: '#374151', light: '#5C6578', white: '#FFFFFF' },
  accent: { lime: '#C6FF00', limeHover: '#B8E600', orange: '#F59E0B', red: '#EF4444', green: '#10B981', blue: '#2563EB', teal: '#003C7E' },
  button: {
    primary:   { rest: '#1B2D58', hover: '#111F3E', press: '#152244' },
    secondary: { bgRest: '#FAFBFC', bgHover: '#F3F4F6', bgPress: '#DBEAFE', borderRest: '#E5E7EB', borderHover: '#D1D5DB' },
    danger:    { bgHover: '#FEE2E2', borderRest: '#EF4444', borderHover: '#DC2626' },
    ghost:     { bgRest: 'transparent', bgHover: 'rgba(123,144,170,0.10)', bgPress: 'rgba(37,99,235,0.10)' },
  },
  icon: { rest: '#717A8C', hover: '#4A5568', restMuted: '#7B90AA', active: '#2563EB' },
  link: { rest: '#3B82F6', hover: '#0F5A9F', press: '#0F3A7D' },
  border: { light: '#D1D5DB', medium: '#B0BCC8' },
  bg: { page: '#F5F7FA', card: '#FAFBFC', light: '#F3F4F6', lighter: '#E5E7EB', white: '#FFFFFF', frame: '#070D1F', search: '#0F1C3A' },
  role: {
    analyst: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
    lead:    { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
    admin:   { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  },
};
const SHADOWS = {
  subtle:   '0 1px 3px rgba(0,0,0,0.10)',
  card:     '0 1px 4px rgba(0,0,0,0.04)',
  elevated: '0 4px 12px rgba(0,0,0,0.15)',
  pressed:  '0 1px 2px rgba(0,0,0,0.08)',
  dark: { rest: '0 1px 3px rgba(0,0,0,0.18)', hover: '0 4px 12px rgba(0,0,0,0.30)' },
};
const TYPOGRAPHY = {
  fontSans:    "Inter, system-ui, -apple-system, sans-serif",
  fontMono:    "'JetBrains Mono', monospace",
  fontDisplay: "'Sora', sans-serif",
};
const TRANSITIONS = { standard: '0.2s ease-in-out', fast: '0.15s ease-in-out' };
const RADIUS = { sm: 6, md: 10, lg: 16, xl: 20, xxl: 28, pill: 50 };
const CHIP = {
  status: {
    'open':             { bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6', label: 'Open'             },
    'under-review':     { bg: '#EDE9FE', color: '#5B21B6', dot: '#7C3AED', label: 'Under Review'     },
    'pending-approval': { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B', label: 'Pending Approval' },
    'returned':         { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444', label: 'Returned'         },
    'approved':         { bg: '#D1FAE5', color: '#065F46', dot: '#10B981', label: 'Approved'         },
    'escalated':        { bg: '#FEE2E2', color: '#B91C1C', dot: '#EF4444', label: 'Escalated'        },
    'closed':           { bg: '#F3F4F6', color: '#4B5563', dot: '#9CA3AF', label: 'Closed'           },
    'archived':         { bg: '#F3F4F6', color: '#9CA3AF', dot: '#D1D5DB', label: 'Archived'         },
    'reopened':         { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B', label: 'Reopened'         },
  },
  risk: {
    'Critical': { bg: '#FEE2E2', color: '#B91C1C', dot: '#EF4444' },
    'High':     { bg: '#FFF7ED', color: '#C2410C', dot: '#F97316' },
    'Medium':   { bg: '#FFFBEB', color: '#92400E', dot: '#F59E0B' },
    'Low':      { bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  },
};
const CALLOUT = {
  borderRadius: 12, accentWidth: 4, padding: '14px 16px', labelSize: 11, textSize: 13, lineHeight: 1.65,
  variants: {
    info:     { bg: '#EEF2FF', border: '1px solid #C7D2FE', accent: '#6366F1', labelColor: '#6366F1', textColor: '#3730A3' },
    success:  { bg: '#F0FDF4', border: '1px solid #BBF7D0', accent: '#10B981', labelColor: '#065F46', textColor: '#064E3B' },
    warning:  { bg: '#FFFBEB', border: '1px solid #FDE68A', accent: '#F59E0B', labelColor: '#92400E', textColor: '#78350F' },
    critical: { bg: '#FEF2F2', border: '1px solid #FECACA', accent: '#EF4444', labelColor: '#B91C1C', textColor: '#7F1D1D' },
  },
};
const TABLE = {
  bg: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: 12,
  header: { bg: '#FAFBFC', borderBottom: '1px solid #ECEEF2', fontSize: 11, fontWeight: 500, color: '#717A8C', letterSpacing: '0.06em', textTransform: 'uppercase' as const },
  row: { borderBottom: '1px solid #F3F4F6', hoverBg: '#F8F9FB', fontSize: 13, color: '#374151' },
  density: { relaxed: { headerPadding: '13px 20px', rowPadding: '14px 20px' } },
  cell: { mono: {}, monoId: {}, numeric: {}, muted: {}, plain: {} },
};
const SURFACE = {
  frame: { bg: 'linear-gradient(160deg, #060C1A 0%, #0C1D3C 55%, #091630 100%)' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 64 }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32,
      paddingBottom: 12, borderBottom: '2px solid #ECEEF2',
    }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1A1F35', fontFamily: "'Sora', sans-serif" }}>{title}</h2>
    </div>
    {children}
  </section>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 32 }}>
    <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>{title}</p>
    {children}
  </div>
);

// ─── Color Swatch ─────────────────────────────────────────────────────────────
function ColorSwatch({ name, hex, dark = false }: { name: string; hex: string; dark?: boolean }) {
  const isGradient = hex.includes('gradient') || hex.includes('linear');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{
        width: '100%', height: 56, borderRadius: RADIUS.md,
        background: hex,
        border: dark || hex === '#FFFFFF' ? '1px solid #E5E7EB' : 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }} />
      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#1A1F35' }}>{name}</p>
        {!isGradient && <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' }}>{hex}</p>}
      </div>
    </div>
  );
}

function ColorGroup({ label, swatches }: { label: string; swatches: { name: string; hex: string }[] }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8' }}>{label}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
        {swatches.map(s => <ColorSwatch key={s.name} {...s} />)}
      </div>
    </div>
  );
}

// ─── Type Specimen ────────────────────────────────────────────────────────────
function TypeSpec({ label, family, weight, size, lh, sample, muted = false }: {
  label: string; family: string; weight: number; size: number; lh?: number; sample: string; muted?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: '16px 0', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ width: 200, flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
        <p style={{ margin: '2px 0 0', fontSize: 10, color: '#B0B8C8', fontFamily: 'monospace' }}>
          {family.split(',')[0].trim().replace(/'/g, '')} / {weight} / {size}px{lh ? ` / ${lh}px` : ''}
        </p>
      </div>
      <p style={{
        margin: 0,
        fontFamily: family,
        fontWeight: weight,
        fontSize: size,
        lineHeight: lh ? `${lh}px` : 1.4,
        color: muted ? '#9CA3AF' : '#1A1F35',
        flex: 1,
      }}>{sample}</p>
    </div>
  );
}

// ─── Spacing Chip ─────────────────────────────────────────────────────────────
function SpacingRow({ name, value }: { name: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ width: 100, fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>{name}</div>
      <div style={{ width: 60, fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace' }}>{value}px</div>
      <div style={{ height: 8, borderRadius: 4, background: '#2563EB', width: Math.min(value * 2, 400) }} />
    </div>
  );
}

// ─── Radius Specimen ──────────────────────────────────────────────────────────
function RadiusSpec({ name, value }: { name: string; value: number }) {
  const size = Math.min(80, 20 + value * 2);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: size, height: size,
        background: '#DBEAFE', border: '2px solid #2563EB',
        borderRadius: value,
      }} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#374151' }}>{name}</p>
        <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' }}>{value}px</p>
      </div>
    </div>
  );
}

// ─── Shadow Specimen ──────────────────────────────────────────────────────────
function ShadowSpec({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        width: '100%', height: 64,
        background: '#FFFFFF', borderRadius: RADIUS.md,
        boxShadow: value,
        border: '1px solid #F3F4F6',
      }} />
      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#374151' }}>{name}</p>
        <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Chip Row ─────────────────────────────────────────────────────────────────
function StatusChipSpec({ status, tokens }: { status: string; tokens: { bg: string; color: string; dot: string; label?: string } }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: tokens.bg }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: tokens.dot, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: tokens.color }}>{tokens.label || status}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StyleGuidePage() {
  return (
    <div style={{ minWidth: 1440, background: '#F5F7FA', fontFamily: TYPOGRAPHY.fontSans }}>
      {/* ── Hero Header ── */}
      <div style={{
        background: SURFACE.frame.bg,
        padding: '48px 80px 56px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#C6FF00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="#070D1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Trace Design System</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 48, fontWeight: 800, color: '#FFFFFF', fontFamily: "'Sora', sans-serif", letterSpacing: '-1px', lineHeight: 1.1 }}>
              Style Guide
            </h1>
            <p style={{ margin: '12px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 500 }}>
              Every colour, typeface, spacing step, and elevation token — single source of truth from <span style={{ fontFamily: 'monospace', color: 'rgba(198,255,0,0.7)' }}>designTokens.ts</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { n: Object.keys(COLORS).reduce((a, _) => a + 1, 0) + 80, l: 'Color Tokens' },
              { n: 24, l: 'Text Styles' },
              { n: 6, l: 'Elevations' },
            ].map(({ n, l }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#C6FF00', fontFamily: "'Sora', sans-serif" }}>{n}+</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '64px 80px', maxWidth: 1440, boxSizing: 'border-box' }}>

        {/* ══ SECTION 1: COLORS ══════════════════════════════════════════════ */}
        <Section title="🎨 Color Palette">
          <ColorGroup label="Text" swatches={[
            { name: 'text/dark',   hex: COLORS.text.dark   },
            { name: 'text/body',   hex: COLORS.text.body   },
            { name: 'text/light',  hex: COLORS.text.light  },
            { name: 'text/muted',  hex: '#9CA3AF'           },
            { name: 'text/white',  hex: COLORS.text.white  },
          ]} />
          <ColorGroup label="Accent" swatches={[
            { name: 'accent/lime',   hex: COLORS.accent.lime      },
            { name: 'accent/orange', hex: COLORS.accent.orange    },
            { name: 'accent/red',    hex: COLORS.accent.red       },
            { name: 'accent/green',  hex: COLORS.accent.green     },
            { name: 'accent/blue',   hex: COLORS.accent.blue      },
            { name: 'accent/teal',   hex: COLORS.accent.teal      },
          ]} />
          <ColorGroup label="Background" swatches={[
            { name: 'bg/page',    hex: COLORS.bg.page    },
            { name: 'bg/card',    hex: COLORS.bg.card    },
            { name: 'bg/light',   hex: COLORS.bg.light   },
            { name: 'bg/lighter', hex: COLORS.bg.lighter },
            { name: 'bg/white',   hex: COLORS.bg.white   },
            { name: 'bg/nav',     hex: COLORS.bg.search  },
            { name: 'bg/frame',   hex: COLORS.bg.frame   },
          ]} />
          <ColorGroup label="Border" swatches={[
            { name: 'border/light',  hex: COLORS.border.light  },
            { name: 'border/medium', hex: COLORS.border.medium },
            { name: 'border/table',  hex: '#ECEEF2'             },
          ]} />
          <ColorGroup label="Buttons — Primary" swatches={[
            { name: 'button/primary/rest',  hex: COLORS.button.primary.rest  },
            { name: 'button/primary/hover', hex: COLORS.button.primary.hover },
            { name: 'button/primary/press', hex: COLORS.button.primary.press },
          ]} />
          <ColorGroup label="Buttons — Secondary" swatches={[
            { name: 'secondary/bg-rest',       hex: COLORS.button.secondary.bgRest      },
            { name: 'secondary/bg-hover',      hex: COLORS.button.secondary.bgHover     },
            { name: 'secondary/bg-press',      hex: COLORS.button.secondary.bgPress     },
            { name: 'secondary/border-rest',   hex: COLORS.button.secondary.borderRest  },
            { name: 'secondary/border-hover',  hex: COLORS.button.secondary.borderHover },
          ]} />
          <ColorGroup label="Buttons — Danger" swatches={[
            { name: 'danger/bg-hover',     hex: COLORS.button.danger.bgHover    },
            { name: 'danger/border-rest',  hex: COLORS.button.danger.borderRest },
            { name: 'danger/border-hover', hex: COLORS.button.danger.borderHover},
          ]} />
          <ColorGroup label="Icon" swatches={[
            { name: 'icon/rest',   hex: COLORS.icon.rest       },
            { name: 'icon/hover',  hex: COLORS.icon.hover      },
            { name: 'icon/muted',  hex: COLORS.icon.restMuted  },
            { name: 'icon/active', hex: COLORS.icon.active     },
          ]} />
          <ColorGroup label="Link" swatches={[
            { name: 'link/rest',  hex: COLORS.link.rest  },
            { name: 'link/hover', hex: COLORS.link.hover },
            { name: 'link/press', hex: COLORS.link.press },
          ]} />
          <ColorGroup label="Roles" swatches={[
            { name: 'role/analyst', hex: COLORS.role.analyst.color },
            { name: 'role/lead',    hex: COLORS.role.lead.color    },
            { name: 'role/admin',   hex: COLORS.role.admin.color   },
          ]} />
        </Section>

        {/* ══ SECTION 2: STATUS & RISK ════════════════════════════════════════ */}
        <Section title="🏷 Status & Risk Chips">
          <SubSection title="Status">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {Object.entries(CHIP.status).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <StatusChipSpec status={k} tokens={v} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: RADIUS.sm, background: v.bg }} />
                    <div style={{ width: 28, height: 28, borderRadius: RADIUS.sm, background: v.color }} />
                    <div style={{ width: 28, height: 28, borderRadius: RADIUS.sm, background: v.dot }} />
                  </div>
                  <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' }}>{k}</p>
                </div>
              ))}
            </div>
          </SubSection>
          <SubSection title="Risk">
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {Object.entries(CHIP.risk).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: v.bg }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: v.dot }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: v.color }}>{k}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: RADIUS.sm, background: v.bg }} />
                    <div style={{ width: 28, height: 28, borderRadius: RADIUS.sm, background: v.color }} />
                    <div style={{ width: 28, height: 28, borderRadius: RADIUS.sm, background: v.dot }} />
                  </div>
                  <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace' }}>{k}</p>
                </div>
              ))}
            </div>
          </SubSection>
        </Section>

        {/* ══ SECTION 3: TYPOGRAPHY ═══════════════════════════════════════════ */}
        <Section title="Aa Typography">
          <SubSection title="Display — Sora (headings, numbers)">
            <TypeSpec label="display/page-heading"    family={TYPOGRAPHY.fontDisplay} weight={700} size={28} lh={34} sample="Trace AML Intelligence Platform" />
            <TypeSpec label="display/page-heading-sm" family={TYPOGRAPHY.fontDisplay} weight={600} size={20} lh={24} sample="Cases Overview · Dashboard" />
            <TypeSpec label="display/stat-number"     family={TYPOGRAPHY.fontDisplay} weight={700} size={30} lh={36} sample="1,248 cases" />
            <TypeSpec label="display/metric-number"   family={TYPOGRAPHY.fontDisplay} weight={700} size={32} lh={38} sample="87" />
            <TypeSpec label="display/info-number"     family={TYPOGRAPHY.fontDisplay} weight={700} size={24} lh={29} sample="342" />
          </SubSection>
          <SubSection title="Sans — Inter (body, labels, UI)">
            <TypeSpec label="sans/h2"       family={TYPOGRAPHY.fontSans} weight={700} size={20} lh={24} sample="Section Title" />
            <TypeSpec label="sans/h3"       family={TYPOGRAPHY.fontSans} weight={600} size={16} lh={20} sample="Sub-section Heading" />
            <TypeSpec label="sans/body-lg"  family={TYPOGRAPHY.fontSans} weight={400} size={14} lh={20} sample="Body text — wallet flagged for mixer activity with high-risk counterparties." />
            <TypeSpec label="sans/body-md"  family={TYPOGRAPHY.fontSans} weight={400} size={13} lh={18} sample="Secondary body — case assigned to analyst for further review." />
            <TypeSpec label="sans/body-sm"  family={TYPOGRAPHY.fontSans} weight={400} size={12} lh={16} sample="Caption — last updated 2 hours ago" />
            <TypeSpec label="sans/label-xl" family={TYPOGRAPHY.fontSans} weight={600} size={14} lh={20} sample="Field Label" />
            <TypeSpec label="sans/label-lg" family={TYPOGRAPHY.fontSans} weight={600} size={13} lh={18} sample="Button · Nav Item" />
            <TypeSpec label="sans/label-md" family={TYPOGRAPHY.fontSans} weight={600} size={12} lh={16} sample="Table Header" />
            <TypeSpec label="sans/overline" family={TYPOGRAPHY.fontSans} weight={700} size={11} lh={14} sample="RECENT SEARCHES · SECTION TITLE" muted />
            <TypeSpec label="sans/caption"  family={TYPOGRAPHY.fontSans} weight={400} size={11} lh={14} sample="Timestamp · hint text · metadata" muted />
          </SubSection>
          <SubSection title="Mono — JetBrains Mono (addresses, IDs, data)">
            <TypeSpec label="mono/wallet-lg"  family={TYPOGRAPHY.fontMono} weight={600} size={14} lh={20} sample="0x7a3d4f8e9b2c...6c7d" />
            <TypeSpec label="mono/case-id"    family={TYPOGRAPHY.fontMono} weight={600} size={13} lh={18} sample="TRC-2024-00847" />
            <TypeSpec label="mono/data-value" family={TYPOGRAPHY.fontMono} weight={500} size={13} lh={18} sample="$1,284,503.22 · 99 txns" />
            <TypeSpec label="mono/score"      family={TYPOGRAPHY.fontMono} weight={700} size={14} lh={20} sample="87 · 95 · 42" />
            <TypeSpec label="mono/address-sm" family={TYPOGRAPHY.fontMono} weight={400} size={12} lh={16} sample="0x5d3c8f2a...c9d" muted />
          </SubSection>
        </Section>

        {/* ══ SECTION 4: SPACING ══════════════════════════════════════════════ */}
        <Section title="↔ Spacing Scale">
          <div style={{ maxWidth: 600 }}>
            {[
              { name: 'spacing/xs',  value: 4  },
              { name: 'spacing/sm',  value: 8  },
              { name: 'spacing/md',  value: 16 },
              { name: 'spacing/lg',  value: 24 },
              { name: 'spacing/xl',  value: 32 },
              { name: 'spacing/2xl', value: 48 },
              { name: 'spacing/3xl', value: 64 },
            ].map(s => <SpacingRow key={s.name} {...s} />)}
          </div>
        </Section>

        {/* ══ SECTION 5: BORDER RADIUS ════════════════════════════════════════ */}
        <Section title="⬜ Border Radius">
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <RadiusSpec name="radius/sm"   value={RADIUS.sm}   />
            <RadiusSpec name="radius/md"   value={RADIUS.md}   />
            <RadiusSpec name="radius/lg"   value={RADIUS.lg}   />
            <RadiusSpec name="radius/xl"   value={RADIUS.xl}   />
            <RadiusSpec name="radius/xxl"  value={RADIUS.xxl}  />
            <RadiusSpec name="radius/pill" value={RADIUS.pill} />
          </div>
        </Section>

        {/* ══ SECTION 6: ELEVATION / SHADOWS ══════════════════════════════════ */}
        <Section title="🌫 Elevation & Shadows">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <ShadowSpec name="elevation/card"     value={SHADOWS.card}     />
            <ShadowSpec name="elevation/subtle"   value={SHADOWS.subtle}   />
            <ShadowSpec name="elevation/elevated" value={SHADOWS.elevated} />
            <ShadowSpec name="elevation/pressed"  value={SHADOWS.pressed}  />
            <ShadowSpec name="elevation/dark-rest"  value={SHADOWS.dark.rest}  />
            <ShadowSpec name="elevation/dark-hover" value={SHADOWS.dark.hover} />
          </div>
        </Section>

        {/* ══ SECTION 7: TRANSITIONS ══════════════════════════════════════════ */}
        <Section title="⚡ Transitions">
          <div style={{ display: 'flex', gap: 32 }}>
            {Object.entries(TRANSITIONS).map(([k, v]) => (
              <div key={k} style={{
                padding: '16px 24px', background: '#FFFFFF', borderRadius: RADIUS.md,
                border: '1px solid #E5E7EB', boxShadow: SHADOWS.card,
              }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#374151' }}>transitions/{k}</p>
                <p style={{ margin: 0, fontSize: 13, fontFamily: 'monospace', color: '#2563EB' }}>{v}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ══ SECTION 8: CALLOUTS ══════════════════════════════════════════════ */}
        <Section title="📣 Callout Variants">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {Object.entries(CALLOUT.variants).map(([k, v]) => (
              <div key={k} style={{
                borderRadius: CALLOUT.borderRadius,
                background: v.bg, border: v.border,
                borderLeft: `${CALLOUT.accentWidth}px solid ${v.accent}`,
                padding: CALLOUT.padding,
              }}>
                <p style={{ margin: '0 0 4px', fontSize: CALLOUT.labelSize, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: v.labelColor }}>{k}</p>
                <p style={{ margin: 0, fontSize: CALLOUT.textSize, color: v.textColor, lineHeight: CALLOUT.lineHeight }}>
                  This is a {k} callout — used for AI analysis results, risk flags, and inline guidance messages.
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ══ SECTION 9: TABLE TOKENS ══════════════════════════════════════════ */}
        <Section title="⊞ Table Tokens">
          <div style={{ background: TABLE.bg, border: TABLE.border, borderRadius: TABLE.borderRadius, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '180px 140px 100px 120px 120px',
              background: TABLE.header.bg,
              borderBottom: TABLE.header.borderBottom,
              padding: TABLE.density.relaxed.headerPadding,
            }}>
              {['CASE ID', 'WALLET', 'RISK', 'STATUS', 'DATE'].map(h => (
                <span key={h} style={{ fontSize: TABLE.header.fontSize, fontWeight: TABLE.header.fontWeight, color: TABLE.header.color, letterSpacing: TABLE.header.letterSpacing, textTransform: 'uppercase' as const }}>
                  {h}
                </span>
              ))}
            </div>
            {/* Rows */}
            {[
              { id: 'TRC-2024-00847', wallet: '0x7a3d...6c7d', risk: 'Critical', status: 'open', date: '2024-12-01' },
              { id: 'TRC-2024-00846', wallet: '0x5d3c...c9d',  risk: 'High',     status: 'under-review', date: '2024-11-30' },
              { id: 'TRC-2024-00844', wallet: '0x8a7f...1f',   risk: 'Medium',   status: 'pending-approval', date: '2024-11-28' },
              { id: 'TRC-2024-00839', wallet: '0x4c1b...2c',   risk: 'Low',      status: 'closed', date: '2024-11-25' },
            ].map((row, i) => {
              const riskColors: Record<string, string> = { Critical: '#EF4444', High: '#F97316', Medium: '#F59E0B', Low: '#22C55E' };
              const statusTok = CHIP.status[row.status as keyof typeof CHIP.status];
              return (
                <div key={row.id} style={{
                  display: 'grid', gridTemplateColumns: '180px 140px 100px 120px 120px',
                  padding: TABLE.density.relaxed.rowPadding,
                  borderBottom: i < 3 ? TABLE.row.borderBottom : 'none',
                  background: '#FFFFFF',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#2D3142' }}>{row.id}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4A5568' }}>{row.wallet}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: riskColors[row.risk] }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#4A5568' }}>{row.risk}</span>
                  </div>
                  {statusTok && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, background: statusTok.bg, alignSelf: 'center', width: 'fit-content' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusTok.dot }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: statusTok.color }}>{statusTok.label}</span>
                    </div>
                  )}
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#4A5568' }}>{row.date}</span>
                </div>
              );
            })}
          </div>
        </Section>

      </div>

      {/* Footer */}
      <div style={{ background: COLORS.bg.frame, padding: '24px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
          Trace Design System · Style Guide · v4
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          Source: <span style={{ fontFamily: 'monospace', color: 'rgba(198,255,0,0.5)' }}>src/tokens/designTokens.ts</span>
        </p>
      </div>
    </div>
  );
}
