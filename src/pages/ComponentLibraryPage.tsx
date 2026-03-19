// Component Library — Trace Design System
// Accessible at /component-library (no auth required)
// Shows every reusable UI component at 1440px for Figma capture

import { useState } from 'react';
import { Plus, Search, Download, Trash2, Edit2, Bell, User, AlertTriangle, Check, Info, X, ArrowLeft, FileText, Filter, RotateCcw, Archive, Eye, Lock } from 'lucide-react';
import { StatusChip }   from '@/components/core/StatusChip';
import { Btn, GhostIcon } from '@/components/core/CaseHeader';
// Token values inlined — no longer importing from designTokens.ts
const TYPOGRAPHY = {
  fontSans:    "Inter, system-ui, -apple-system, sans-serif",
  fontMono:    "'JetBrains Mono', monospace",
  fontDisplay: "'Sora', sans-serif",
};
const RADIUS = { sm: 6, md: 10, lg: 16, xl: 20, xxl: 28, pill: 50 };
const COLORS = {
  bg: { frame: '#070D1F' },
  role: {
    analyst: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
    lead:    { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
    admin:   { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  },
};
const CHIP = {
  status: {
    'open': {}, 'under-review': {}, 'pending-approval': {}, 'returned': {},
    'approved': {}, 'escalated': {}, 'closed': {}, 'archived': {}, 'reopened': {},
  },
};
const INPUT = {
  bg: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: 10, padding: '9px 14px',
  height: 38, fontSize: 14, color: '#111827',
  shadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
  focus: { border: '1px solid #4B7AC7', shadow: '0 0 0 3px rgba(37,99,235,0.10), 0 1px 4px rgba(0,0,0,0.05)' },
};
const CARD = { background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, shadow: '0 1px 3px rgba(0,0,0,0.05)' };
const TABLE = {
  bg: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: 12,
  header: { bg: '#FAFBFC', borderBottom: '1px solid #ECEEF2', fontSize: 11, fontWeight: 500, color: '#717A8C', letterSpacing: '0.06em' },
  row: { borderBottom: '1px solid #F3F4F6' },
  density: { relaxed: { headerPadding: '13px 20px', rowPadding: '14px 20px' } },
};
const CALLOUT = {
  borderRadius: 12, accentWidth: 4, padding: '14px 16px',
  variants: {
    info:     { bg: '#EEF2FF', border: '1px solid #C7D2FE', accent: '#6366F1', labelColor: '#6366F1', textColor: '#3730A3' },
    success:  { bg: '#F0FDF4', border: '1px solid #BBF7D0', accent: '#10B981', labelColor: '#065F46', textColor: '#064E3B' },
    warning:  { bg: '#FFFBEB', border: '1px solid #FDE68A', accent: '#F59E0B', labelColor: '#92400E', textColor: '#78350F' },
    critical: { bg: '#FEF2F2', border: '1px solid #FECACA', accent: '#EF4444', labelColor: '#B91C1C', textColor: '#7F1D1D' },
  },
};
const SURFACE = {
  frame:   { bg: 'linear-gradient(160deg, #060C1A 0%, #0C1D3C 55%, #091630 100%)' },
  nav:     { bg: '#0F1C3A', height: 44, paddingX: 20, gap: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', shadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.04)' },
  sidebar: { bg: '#0A1528', borderRadius: 16, width: 64, widthExpanded: 240, paddingY: 12, paddingX: 8, iconColor: 'rgba(255,255,255,0.4)', iconColorActive: '#C6FF00', iconBgActive: 'rgba(198,255,0,0.08)', border: '1px solid rgba(255,255,255,0.07)' },
  overlay: {
    width: 360, bg: '#FFFFFF', borderLeft: '1px solid #ECEEF2', shadow: '-6px 0 28px rgba(0,0,0,0.09), -1px 0 4px rgba(0,0,0,0.04)',
    header: { padding: '16px 20px', titleSize: 14, titleWeight: 700, titleColor: '#0A0A0F', subtitleSize: 12, subtitleColor: '#9CA3AF' },
    body:   { padding: '14px 20px' },
    footer: { padding: '12px 16px', bg: '#F8F9FB' },
  },
};

// ─── Layout helpers ───────────────────────────────────────────────────────────
const Page = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minWidth: 1440, background: '#F5F7FA', fontFamily: TYPOGRAPHY.fontSans }}>
    {children}
  </div>
);

const Section = ({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) => (
  <section id={id} style={{ marginBottom: 72 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36, paddingBottom: 14, borderBottom: '2px solid #ECEEF2' }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1A1F35', fontFamily: "'Sora', sans-serif" }}>{title}</h2>
    </div>
    {children}
  </section>
);

const Row = ({ label, children, wrap = false }: { label?: string; children: React.ReactNode; wrap?: boolean }) => (
  <div style={{ marginBottom: 28 }}>
    {label && <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>{label}</p>}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: wrap ? 'wrap' : 'nowrap' }}>{children}</div>
  </div>
);

// ─── BUTTONS ──────────────────────────────────────────────────────────────────
function ButtonsSection() {
  return (
    <Section title="01 — Buttons" id="buttons">
      <Row label="Primary">
        <Btn variant="primary" size="lg" icon={Plus}>New Case</Btn>
        <Btn variant="primary" size="md" icon={Plus}>New Case</Btn>
        <Btn variant="primary" size="sm" icon={Plus}>New Case</Btn>
        <Btn variant="primary" size="md">Label only</Btn>
        <Btn variant="primary" size="md" disabled>Disabled</Btn>
      </Row>
      <Row label="Dark (nav context)">
        <Btn variant="dark" size="lg" icon={Download}>Export</Btn>
        <Btn variant="dark" size="md" icon={Download}>Export</Btn>
        <Btn variant="dark" size="sm">Action</Btn>
      </Row>
      <Row label="Outline / Secondary">
        <Btn variant="outline" size="lg" icon={Filter}>Filter</Btn>
        <Btn variant="outline" size="md" icon={Edit2}>Edit</Btn>
        <Btn variant="outline" size="sm">Cancel</Btn>
        <Btn variant="secondary" size="md">Secondary</Btn>
        <Btn variant="outline" size="md" disabled>Disabled</Btn>
      </Row>
      <Row label="Danger">
        <Btn variant="danger" size="lg" icon={Trash2}>Delete Case</Btn>
        <Btn variant="danger" size="md" icon={Trash2}>Delete</Btn>
        <Btn variant="danger" size="sm">Remove</Btn>
      </Row>
      <Row label="Ghost">
        <Btn variant="ghost" size="lg" icon={Archive}>Archive</Btn>
        <Btn variant="ghost" size="md" icon={Eye}>View</Btn>
        <Btn variant="ghost" size="sm" icon={RotateCcw}>Reset</Btn>
        <Btn variant="ghost" size="md">Ghost</Btn>
        <Btn variant="ghost" size="md" active>Active state</Btn>
      </Row>
      <Row label="Icon-only Ghost Buttons">
        <GhostIcon icon={Plus} size="lg" />
        <GhostIcon icon={Plus} size="md" />
        <GhostIcon icon={Edit2} size="sm" />
        <GhostIcon icon={Trash2} size="xs" />
        <GhostIcon icon={Download} size="md" />
        <GhostIcon icon={Bell} size="md" />
        <GhostIcon icon={User} size="md" />
        <GhostIcon icon={User} size="md" />
        <GhostIcon icon={FileText} size="md" />
      </Row>
      <Row label="Segment / Chip Buttons">
        <Btn variant="segment" size="sm" active>All</Btn>
        <Btn variant="segment" size="sm">Open</Btn>
        <Btn variant="segment" size="sm">Closed</Btn>
        <Btn variant="chip" size="sm">Ethereum</Btn>
        <Btn variant="chip" size="sm">Arbitrum</Btn>
        <Btn variant="chip" size="sm">Polygon</Btn>
      </Row>
    </Section>
  );
}

// ─── STATUS & RISK CHIPS ──────────────────────────────────────────────────────
function ChipsSection() {
  return (
    <Section title="02 — Status & Risk Chips" id="chips">
      <Row label="Status — size md (default)">
        {Object.keys(CHIP.status).map(s => <StatusChip key={s} status={s} size="md" />)}
      </Row>
      <Row label="Status — size sm">
        {Object.keys(CHIP.status).map(s => <StatusChip key={s} status={s} size="sm" />)}
      </Row>
      <Row label="Status — no dot">
        {['open','under-review','pending-approval','closed'].map(s => <StatusChip key={s} status={s} dot={false} size="md" />)}
      </Row>
      <Row label="Risk — size md">
        {['Critical','High','Medium','Low'].map(r => <StatusChip key={r} risk={r} size="md" />)}
      </Row>
      <Row label="Risk — size sm">
        {['Critical','High','Medium','Low'].map(r => <StatusChip key={r} risk={r} size="sm" />)}
      </Row>

      <Row label="Chain Chips (Tag variant)">
        {[
          { label: 'Ethereum', bg: '#EEF2FF', color: '#4F46E5' },
          { label: 'Arbitrum', bg: '#FEF3C7', color: '#92400E' },
          { label: 'Polygon',  bg: '#F0FDF4', color: '#166534' },
          { label: 'Tron',     bg: '#FFF7ED', color: '#C2410C' },
          { label: 'BSC',      bg: '#FEFCE8', color: '#A16207' },
        ].map(c => (
          <span key={c.label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: RADIUS.pill,
            background: c.bg, color: c.color,
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
          }}>{c.label}</span>
        ))}
      </Row>

      <Row label="Role Badges">
        {[
          { role: 'Analyst', color: COLORS.role.analyst.color, bg: COLORS.role.analyst.bg },
          { role: 'Lead',    color: COLORS.role.lead.color,    bg: COLORS.role.lead.bg    },
          { role: 'Admin',   color: COLORS.role.admin.color,   bg: COLORS.role.admin.bg   },
        ].map(r => (
          <span key={r.role} style={{ padding: '4px 12px', borderRadius: 20, background: r.bg, color: r.color, fontSize: 12, fontWeight: 600 }}>{r.role}</span>
        ))}
      </Row>
    </Section>
  );
}

// ─── INPUTS ───────────────────────────────────────────────────────────────────
function InputsSection() {
  return (
    <Section title="03 — Form Inputs" id="inputs">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Text Input — resting</p>
          <input
            type="text"
            placeholder="Wallet address or Case ID..."
            defaultValue=""
            style={{
              width: '100%', boxSizing: 'border-box',
              background: INPUT.bg,
              border: INPUT.border,
              borderRadius: INPUT.borderRadius,
              padding: INPUT.padding,
              height: INPUT.height,
              fontSize: INPUT.fontSize,
              color: INPUT.color,
              boxShadow: INPUT.shadow,
              outline: 'none', fontFamily: TYPOGRAPHY.fontSans,
            }}
          />
        </div>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Text Input — focused</p>
          <input
            type="text"
            defaultValue="0x7a3d4f8e9b2c1a5d"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: INPUT.bg,
              border: INPUT.focus.border,
              borderRadius: INPUT.borderRadius,
              padding: INPUT.padding,
              height: INPUT.height,
              fontSize: INPUT.fontSize,
              color: INPUT.color,
              boxShadow: INPUT.focus.shadow,
              outline: 'none', fontFamily: "'JetBrains Mono', monospace",
            }}
          />
        </div>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Text Input — disabled</p>
          <input
            type="text"
            defaultValue="Read only value"
            disabled
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#F9FAFB',
              border: INPUT.border,
              borderRadius: INPUT.borderRadius,
              padding: INPUT.padding,
              height: INPUT.height,
              fontSize: INPUT.fontSize,
              color: '#9CA3AF',
              boxShadow: 'none',
              outline: 'none', fontFamily: TYPOGRAPHY.fontSans,
              cursor: 'not-allowed', opacity: 0.7,
            }}
          />
        </div>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Select — resting</p>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: INPUT.bg, border: INPUT.border,
            borderRadius: INPUT.borderRadius,
            padding: INPUT.padding, height: INPUT.height,
            fontSize: INPUT.fontSize, color: '#9CA3AF',
            boxSizing: 'border-box', cursor: 'pointer',
          }}>
            <span>Select status…</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
        </div>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Select — with value</p>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: INPUT.bg, border: INPUT.focus.border,
            borderRadius: INPUT.borderRadius,
            padding: INPUT.padding, height: INPUT.height,
            fontSize: INPUT.fontSize, color: INPUT.color,
            boxSizing: 'border-box', cursor: 'pointer',
            boxShadow: INPUT.focus.shadow,
          }}>
            <span>Open</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 9l4-4 4 4" stroke="#4B7AC7" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
        </div>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Textarea</p>
          <textarea
            placeholder="Add investigation notes..."
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: INPUT.bg, border: INPUT.border,
              borderRadius: INPUT.borderRadius,
              padding: INPUT.padding,
              fontSize: 13, color: INPUT.color,
              boxShadow: INPUT.shadow,
              outline: 'none', resize: 'none',
              fontFamily: TYPOGRAPHY.fontSans, lineHeight: 1.5,
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' }}>Search Bar — nav variant (dark)</p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '10px 20px', borderRadius: 999,
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,255,255,0.18)',
          minWidth: 360,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
            <path d="M3 6.75C3 5.505 4.005 4.5 5.25 4.5H18.75C19.995 4.5 21 5.505 21 6.75V17.25C21 18.495 19.995 19.5 18.75 19.5H5.25C4.005 19.5 3 18.495 3 17.25V6.75Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M15.75 13.5C15.75 12.257 16.757 11.25 18 11.25H21V15.75H18C16.757 15.75 15.75 14.743 15.75 13.5Z" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="18" cy="13.5" r="1.1" fill="currentColor"/>
            <path d="M3 9.75H21" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', fontFamily: TYPOGRAPHY.fontSans, letterSpacing: '0.05em', flex: 1 }}>Search wallet addresses...</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>⌘K</span>
        </div>
      </div>
    </Section>
  );
}

// ─── CARDS ────────────────────────────────────────────────────────────────────
function CardsSection() {
  return (
    <Section title="04 — Cards" id="cards">
      <Row label="Stat Cards">
        {[
          { label: 'All Cases', value: 1248, accent: '#003C7E' },
          { label: 'My Open Cases', value: 23, accent: '#3B82F6' },
          { label: 'Pending Approval', value: 8, accent: '#F59E0B' },
          { label: 'Due (SLA)', value: 3, accent: '#DC2626' },
          { label: 'Returned to Me', value: 5, accent: '#EF4444' },
          { label: 'Closed This Month', value: 47, accent: '#9CA3AF' },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{
            background: CARD.background, border: CARD.border,
            borderRadius: CARD.borderRadius,
            padding: CARD.padding,
            boxShadow: CARD.shadow,
            minWidth: 130, flex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 4, height: 16, borderRadius: 999, background: accent }} />
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#717A8C' }}>{label}</p>
            </div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1A1F35', fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </Row>

      <Row label="Info / Detail Cards" wrap>
        {[
          { title: 'Risk Score', value: '87', sub: 'Critical', accent: '#EF4444' },
          { title: 'Total Transactions', value: '1,284', sub: 'last 90 days', accent: '#2563EB' },
          { title: 'Counterparties', value: '342', sub: 'unique wallets', accent: '#10B981' },
          { title: 'Case Age', value: '14d', sub: 'days open', accent: '#F59E0B' },
        ].map(({ title, value, sub, accent }) => (
          <div key={title} style={{
            background: '#FFFFFF', border: '1px solid #E5E7EB',
            borderRadius: 12, padding: '16px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            minWidth: 160, flex: 1,
          }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#717A8C' }}>{title}</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: accent, fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{value}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9CA3AF' }}>{sub}</p>
          </div>
        ))}
      </Row>

      <Row label="Case Detail Card">
        <div style={{
          background: '#FFFFFF', border: '1px solid #ECEEF2',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          width: 480,
        }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #ECEEF2', background: '#FAFBFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4B5563' }}>Case Details</p>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Case ID',       value: 'TRC-2024-00847',          mono: true },
              { label: 'Wallet',        value: '0x7a3d4f8e...6c7d',       mono: true },
              { label: 'Typology',      value: 'Mixer / Layering',        mono: false },
              { label: 'Analyst',       value: 'Sarah Johnson',           mono: false },
              { label: 'Lead',          value: 'Marcus Chen',             mono: false },
            ].map(({ label, value, mono }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#717A8C' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: mono ? 500 : 400, fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit', color: '#1A1F35' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </Row>
    </Section>
  );
}

// ─── TABLE ────────────────────────────────────────────────────────────────────
function TableSection() {
  const rows = [
    { id: 'TRC-2024-00847', wallet: '0x7a3d...6c7d', risk: 'Critical', score: 95, typology: 'Mixer / Layering',  status: 'open',             analyst: 'Sarah Johnson', date: '2024-12-01' },
    { id: 'TRC-2024-00846', wallet: '0x5d3c...c9d',  risk: 'High',     score: 78, typology: 'Structuring',       status: 'under-review',     analyst: 'Mike Peters',   date: '2024-11-30' },
    { id: 'TRC-2024-00844', wallet: '0x8a7f...1f',   risk: 'Medium',   score: 56, typology: 'Sanctions',         status: 'pending-approval', analyst: 'Emma Davis',    date: '2024-11-28' },
    { id: 'TRC-2024-00839', wallet: '0x4c1b...2c',   risk: 'Low',      score: 28, typology: 'Unusual Activity',  status: 'closed',           analyst: 'Tom Liu',       date: '2024-11-25' },
    { id: 'TRC-2024-00831', wallet: '0x9f4e...7d',   risk: 'Critical', score: 91, typology: 'Darknet Market',    status: 'returned',         analyst: 'Sarah Johnson', date: '2024-11-22' },
  ];
  const riskDot: Record<string, string> = { Critical: '#EF4444', High: '#F97316', Medium: '#F59E0B', Low: '#22C55E' };
  const riskText: Record<string, string> = { Critical: '#B91C1C', High: '#C2410C', Medium: '#92400E', Low: '#166534' };
  const cols = ['Case ID', 'Wallet', 'Risk', 'Score', 'Typology', 'Status', 'Analyst', 'Date'];
  const colWidths = [170, 130, 90, 70, 160, 160, 140, 110];

  return (
    <Section title="05 — Table" id="table">
      <div style={{ background: TABLE.bg, border: TABLE.border, borderRadius: TABLE.borderRadius, overflow: 'hidden' }}>
        <div style={{ display: 'flex', background: TABLE.header.bg, borderBottom: TABLE.header.borderBottom, padding: TABLE.density.relaxed.headerPadding }}>
          {cols.map((c, i) => (
            <div key={c} style={{ width: colWidths[i], flexShrink: 0, fontSize: TABLE.header.fontSize, fontWeight: TABLE.header.fontWeight, color: TABLE.header.color, letterSpacing: TABLE.header.letterSpacing, textTransform: 'uppercase' as const }}>
              {c}
            </div>
          ))}
        </div>
        {rows.map((row, ri) => (
          <div key={row.id} style={{ display: 'flex', alignItems: 'center', padding: TABLE.density.relaxed.rowPadding, borderBottom: ri < rows.length - 1 ? TABLE.row.borderBottom : 'none', background: '#FFFFFF', cursor: 'pointer' }}>
            <div style={{ width: colWidths[0], flexShrink: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: '#2D3142' }}>{row.id}</span>
            </div>
            <div style={{ width: colWidths[1], flexShrink: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#4A5568' }}>{row.wallet}</span>
            </div>
            <div style={{ width: colWidths[2], flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: riskDot[row.risk] }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: riskText[row.risk] }}>{row.risk}</span>
            </div>
            <div style={{ width: colWidths[3], flexShrink: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: riskDot[row.risk] }}>{row.score}</span>
            </div>
            <div style={{ width: colWidths[4], flexShrink: 0 }}>
              <span style={{ fontSize: 13, color: '#374151' }}>{row.typology}</span>
            </div>
            <div style={{ width: colWidths[5], flexShrink: 0 }}>
              <StatusChip status={row.status} size="sm" />
            </div>
            <div style={{ width: colWidths[6], flexShrink: 0 }}>
              <span style={{ fontSize: 13, color: '#374151' }}>{row.analyst}</span>
            </div>
            <div style={{ width: colWidths[7], flexShrink: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#4A5568' }}>{row.date}</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── CALLOUTS ─────────────────────────────────────────────────────────────────
function CalloutsSection() {
  const icons: Record<string, typeof Info> = { info: Info, success: Check, warning: AlertTriangle, critical: AlertTriangle };
  return (
    <Section title="06 — Callouts & Alerts" id="callouts">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
        {Object.entries(CALLOUT.variants).map(([k, v]) => {
          const Icon = icons[k] || Info;
          return (
            <div key={k} style={{
              borderRadius: CALLOUT.borderRadius,
              background: v.bg, border: v.border,
              borderLeft: `${CALLOUT.accentWidth}px solid ${v.accent}`,
              padding: CALLOUT.padding,
              display: 'flex', gap: 12,
            }}>
              <Icon size={16} color={v.accent} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: v.labelColor }}>{k}</p>
                <p style={{ margin: 0, fontSize: 13, color: v.textColor, lineHeight: 1.55 }}>
                  {k === 'info' && 'AI analysis detected patterns consistent with mixer/tumbler usage across 12 transactions.'}
                  {k === 'success' && 'Wallet cleared — no matches found in sanctions lists or known threat actor databases.'}
                  {k === 'warning' && 'Risk score elevated due to proximity to flagged counterparties. Manual review recommended.'}
                  {k === 'critical' && 'Direct exposure to OFAC-sanctioned address detected. Immediate escalation required.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Row label="Toast Notifications">
        {[
          { type: 'success', label: 'Case submitted for approval', bg: '#22C55E' },
          { type: 'error',   label: 'Failed to save — please retry', bg: '#EF4444' },
          { type: 'info',    label: 'AI analysis queued (est. 30s)', bg: '#2D3142' },
        ].map(({ type, label, bg }) => (
          <div key={type} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 20px', borderRadius: RADIUS.md,
            background: bg, boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}>
            {type === 'success' && <Check size={16} color="#fff" />}
            {type === 'error' && <X size={16} color="#fff" />}
            {type === 'info' && <Info size={16} color="#fff" />}
            <span style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>{label}</span>
          </div>
        ))}
      </Row>
    </Section>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function ModalsSection() {
  return (
    <Section title="07 — Modals & Overlays" id="modals">
      <Row label="Modal Sizes">
        {[
          { size: 'sm  400px', w: 400,  title: 'Confirm Delete', desc: 'Compact confirm — destructive action' },
          { size: 'md  480px', w: 480,  title: 'Change Lead',    desc: 'Standard form modal — default size'  },
          { size: 'lg  580px', w: 580,  title: 'Reassign Case',  desc: 'Multi-column form fields'            },
        ].map(({ size, w, title, desc }) => (
          <div key={size} style={{
            background: '#FFFFFF', borderRadius: 16,
            boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)',
            width: w, overflow: 'hidden', border: '1px solid #ECEEF2',
          }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #ECEEF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A1F35', fontFamily: "'Sora', sans-serif" }}>{title}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9CA3AF' }}>{size}</p>
              </div>
              <button style={{ width: 28, height: 28, borderRadius: '50%', background: '#F3F4F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} color="#717A8C" />
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{desc}</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Btn variant="outline" size="sm">Cancel</Btn>
                <Btn variant="primary" size="sm">Confirm</Btn>
              </div>
            </div>
          </div>
        ))}
      </Row>

      <Row label="Destructive Confirm Dialog">
        <div style={{
          background: '#FFFFFF', borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          width: 420, overflow: 'hidden', border: '1px solid #ECEEF2',
        }}>
          <div style={{ padding: '24px 24px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trash2 size={20} color="#EF4444" />
            </div>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Delete Case</p>
              <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.55 }}>This action cannot be undone. TRC-2024-00847 and all associated notes will be permanently removed.</p>
            </div>
          </div>
          <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 8, justifyContent: 'flex-end', background: '#FAFBFC' }}>
            <Btn variant="outline" size="sm">Cancel</Btn>
            <Btn variant="danger" size="sm" icon={Trash2}>Delete permanently</Btn>
          </div>
        </div>
      </Row>
    </Section>
  );
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
function NavigationSection() {
  const navItems = [
    { label: 'Dashboard', icon: '⊞', active: false },
    { label: 'Cases',     icon: '⊡', active: true  },
    { label: 'Search',    icon: '○', active: false  },
    { label: 'Reports',   icon: '⊟', active: false  },
  ];

  return (
    <Section title="08 — Navigation" id="navigation">
      <Row label="Top Navigation Bar">
        <div style={{
          width: '100%', height: 44,
          background: SURFACE.nav.bg,
          borderRadius: SURFACE.nav.borderRadius,
          border: SURFACE.nav.border,
          boxShadow: SURFACE.nav.shadow,
          display: 'flex', alignItems: 'center',
          padding: `0 ${SURFACE.nav.paddingX}px`,
          gap: SURFACE.nav.gap,
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#C6FF00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke="#070D1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', fontFamily: "'Sora', sans-serif" }}>TraceAgent</span>
          </div>
          {/* Search bar placeholder */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.18)',
            flex: 1, maxWidth: 400,
          }}>
            <Search size={14} color="rgba(255,255,255,0.4)" />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', flex: 1 }}>Search wallets...</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>⌘K</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <GhostIcon icon={Bell} size="sm" />
            <GhostIcon icon={User} size="sm" />
          </div>
        </div>
      </Row>

      <Row label="Sidebar — collapsed & expanded">
        {/* Collapsed */}
        <div style={{
          width: SURFACE.sidebar.width,
          background: SURFACE.sidebar.bg,
          borderRadius: SURFACE.sidebar.borderRadius,
          border: SURFACE.sidebar.border,
          padding: `${SURFACE.sidebar.paddingY}px ${SURFACE.sidebar.paddingX}px`,
          display: 'flex', flexDirection: 'column', gap: 4,
          boxSizing: 'border-box',
        }}>
          {navItems.map(item => (
            <div key={item.label} style={{
              width: 48, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10,
              background: item.active ? SURFACE.sidebar.iconBgActive : 'transparent',
            }}>
              <span style={{ fontSize: 16, color: item.active ? SURFACE.sidebar.iconColorActive : SURFACE.sidebar.iconColor }}>{item.icon}</span>
            </div>
          ))}
        </div>

        {/* Expanded */}
        <div style={{
          width: SURFACE.sidebar.widthExpanded,
          background: SURFACE.sidebar.bg,
          borderRadius: SURFACE.sidebar.borderRadius,
          border: SURFACE.sidebar.border,
          padding: `${SURFACE.sidebar.paddingY}px ${SURFACE.sidebar.paddingX}px`,
          display: 'flex', flexDirection: 'column', gap: 4,
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#C6FF00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke="#070D1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', fontFamily: "'Sora', sans-serif" }}>TraceAgent</span>
          </div>
          {navItems.map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: item.active ? SURFACE.sidebar.iconBgActive : 'transparent',
            }}>
              <span style={{ fontSize: 16, color: item.active ? SURFACE.sidebar.iconColorActive : SURFACE.sidebar.iconColor, width: 20, textAlign: 'center' }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: item.active ? 600 : 400, color: item.active ? '#FFFFFF' : 'rgba(255,255,255,0.55)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Page header */}
        <div style={{
          background: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
          border: '1px solid #ECEEF2',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)', flex: 1,
        }}>
          <div style={{ padding: '14px 32px', borderBottom: '1px solid #ECEEF2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button style={{ width: 32, height: 32, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={16} color="#717A8C" />
              </button>
              <div>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1A1F35', fontFamily: "'Sora', sans-serif" }}>Cases</p>
              </div>
            </div>
            <Btn variant="primary" size="sm" icon={Plus}>New Case</Btn>
          </div>
          <div style={{ padding: '12px 32px', background: '#F8F9FB', borderBottom: '1px solid #ECEEF2', display: 'flex', alignItems: 'center', gap: 8 }}>
            {['Overview', 'Transactions', 'Analysis', 'Report'].map((tab, i) => (
              <div key={tab} style={{
                padding: '9px 20px', borderRadius: '6px 6px 0 0',
                fontSize: 13, fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? '#1A1F35' : '#717A8C',
                borderBottom: i === 0 ? '2px solid #003C7E' : '2px solid transparent',
                cursor: 'pointer',
              }}>{tab}</div>
            ))}
          </div>
        </div>
      </Row>
    </Section>
  );
}

// ─── EMPTY STATES ─────────────────────────────────────────────────────────────
function EmptyStatesSection() {
  return (
    <Section title="09 — Empty States" id="empty">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { icon: Search,  title: 'No results found',         sub: 'Try adjusting your search query or filters' },
          { icon: FileText, title: 'No cases yet',            sub: 'New cases will appear here once created'    },
          { icon: Lock,     title: 'Access restricted',       sub: 'You don\'t have permission to view this'    },
        ].map(({ icon: Icon, title, sub }) => (
          <div key={title} style={{
            padding: '48px 24px', background: '#FFFFFF',
            border: '1px solid #ECEEF2', borderRadius: 12,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon size={28} color="#D1D5DB" />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#9CA3AF', textAlign: 'center' }}>{title}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#B0B8C8', textAlign: 'center' }}>{sub}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── RIGHT-SIDE PANELS ────────────────────────────────────────────────────────
function PanelsSection() {
  return (
    <Section title="10 — Side Panels & Overlays" id="panels">
      <Row label="Right-side overlay panel (360px width)">
        <div style={{
          width: SURFACE.overlay.width,
          background: SURFACE.overlay.bg,
          borderLeft: SURFACE.overlay.borderLeft,
          boxShadow: SURFACE.overlay.shadow,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #ECEEF2',
        }}>
          <div style={{ padding: SURFACE.overlay.header.padding, borderBottom: '1px solid #ECEEF2', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, fontSize: SURFACE.overlay.header.titleSize, fontWeight: SURFACE.overlay.header.titleWeight, color: SURFACE.overlay.header.titleColor }}>Investigation Notes</p>
              <p style={{ margin: '2px 0 0', fontSize: SURFACE.overlay.header.subtitleSize, color: SURFACE.overlay.header.subtitleColor }}>3 notes · last updated 2h ago</p>
            </div>
            <GhostIcon icon={X} size="xs" />
          </div>
          <div style={{ padding: SURFACE.overlay.body.padding, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { author: 'Sarah J.', time: '2h ago', text: 'Mixer transactions confirmed via chainalysis trace. Requesting escalation.' },
              { author: 'Marcus C.', time: '5h ago', text: 'Assigned to Sarah for deep-dive analysis. High priority.' },
            ].map(note => (
              <div key={note.author} style={{ padding: '12px 14px', background: '#F8F9FB', borderRadius: 8, border: '1px solid #ECEEF2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{note.author}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>{note.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.45 }}>{note.text}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: SURFACE.overlay.footer.padding, borderTop: '1px solid #ECEEF2', background: SURFACE.overlay.footer.bg }}>
            <textarea
              placeholder="Add a note..."
              rows={2}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#FFFFFF', border: '1px solid #E5E7EB',
                borderRadius: 8, padding: '8px 12px',
                fontSize: 13, fontFamily: TYPOGRAPHY.fontSans, resize: 'none', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <Btn variant="primary" size="sm">Add Note</Btn>
            </div>
          </div>
        </div>

        {/* Dark side panel (notifications/AI queue style) */}
        <div style={{
          width: SURFACE.overlay.width,
          background: '#0F1C3A',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Notifications</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>3 unread</p>
            </div>
            <GhostIcon icon={X} size="xs" />
          </div>
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { title: 'Case TRC-2024-00847 returned', sub: 'Lead requested amendments · 2m ago', dot: '#EF4444' },
              { title: 'New case assigned to you',     sub: 'TRC-2024-00851 · High risk · 15m ago', dot: '#F59E0B' },
              { title: 'AI analysis complete',         sub: 'TRC-2024-00839 scored 91 · 1h ago',   dot: '#C6FF00' },
            ].map(n => (
              <div key={n.title} style={{ display: 'flex', gap: 10, padding: '10px 8px', borderRadius: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.dot, flexShrink: 0, marginTop: 4 }} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>{n.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{n.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Row>
    </Section>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function ComponentLibraryPage() {
  const [activeSection, setActiveSection] = useState('buttons');
  const sections = [
    { id: 'buttons',    label: '01 Buttons'       },
    { id: 'chips',      label: '02 Chips'         },
    { id: 'inputs',     label: '03 Inputs'        },
    { id: 'cards',      label: '04 Cards'         },
    { id: 'table',      label: '05 Table'         },
    { id: 'callouts',   label: '06 Callouts'      },
    { id: 'modals',     label: '07 Modals'        },
    { id: 'navigation', label: '08 Navigation'    },
    { id: 'empty',      label: '09 Empty States'  },
    { id: 'panels',     label: '10 Side Panels'   },
  ];

  return (
    <Page>
      {/* ── Hero ── */}
      <div style={{ background: SURFACE.frame.bg, padding: '48px 80px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#C6FF00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke="#070D1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Trace Design System</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 48, fontWeight: 800, color: '#FFFFFF', fontFamily: "'Sora', sans-serif", letterSpacing: '-1px', lineHeight: 1.1 }}>Component Library</h1>
            <p style={{ margin: '12px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 500 }}>
              Every reusable UI element — buttons, chips, inputs, cards, tables, modals, panels.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[{ n: 10, l: 'Categories' }, { n: 60, l: 'Components' }, { n: 3, l: 'Fonts' }].map(({ n, l }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#C6FF00', fontFamily: "'Sora', sans-serif" }}>{n}+</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky Nav ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#FFFFFF', borderBottom: '1px solid #ECEEF2', padding: '0 80px', display: 'flex', gap: 0 }}>
        {sections.map(s => (
          <a key={s.id} href={`#${s.id}`} onClick={() => setActiveSection(s.id)} style={{
            display: 'inline-block', padding: '12px 16px',
            fontSize: 12, fontWeight: activeSection === s.id ? 600 : 400,
            color: activeSection === s.id ? '#1A1F35' : '#717A8C',
            borderBottom: activeSection === s.id ? '2px solid #003C7E' : '2px solid transparent',
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>{s.label}</a>
        ))}
      </div>

      {/* ── Sections ── */}
      <div style={{ padding: '64px 80px', maxWidth: 1440, boxSizing: 'border-box' }}>
        <ButtonsSection />
        <ChipsSection />
        <InputsSection />
        <CardsSection />
        <TableSection />
        <CalloutsSection />
        <ModalsSection />
        <NavigationSection />
        <EmptyStatesSection />
        <PanelsSection />
      </div>

      {/* Footer */}
      <div style={{ background: COLORS.bg.frame, padding: '24px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>Trace Design System · Component Library · v4</p>
        <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>10 categories · 60+ components</p>
      </div>
    </Page>
  );
}
