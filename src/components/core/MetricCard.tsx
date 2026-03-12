import { useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { SURFACE, COLORS, TYPOGRAPHY, CALLOUT as CALLOUT_TOKEN } from '@/tokens/designTokens';

const T = {
  lightTxt: '#717A8C',
  darkTxt:  '#1A1F35',
  border:   COLORS.bg.lighter,   // #E5E7EB
  red:      '#EF4444',
};

const CARD_H = 176;

// ── Chip ─────────────────────────────────────────────────────────────────────
interface ChipProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

export function Chip({ label, color, size }: ChipProps) {
  const sm = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: sm ? '2px 7px' : '4px 10px', borderRadius: 20,
      fontSize: sm ? 10 : 12, fontWeight: sm ? 700 : 600,
      background: color, color: '#fff',
    }}>
      {label}
    </span>
  );
}

// ── NumericValue ──────────────────────────────────────────────────────────────
interface NumericValueProps {
  value: string | number;
  fontSize: number;
}

function NumericValue({ value, fontSize }: NumericValueProps) {
  if (typeof value !== 'string') return <span>{value}</span>;
  const m = value.match(/^([+-]?\d[\d,]*)(\.\d+)?(\s*[A-Za-z%]+)?$/);
  if (!m || (!m[2] && !m[3])) return <span>{value}</span>;
  const [, integer, decimal, unit] = m;
  const decFz  = Math.round(fontSize * 0.55);
  const unitFz = Math.round(fontSize * 0.42);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
      <span>{integer}</span>
      {decimal && <span style={{ fontSize: decFz, fontWeight: 500, color: '#9CA3AF', letterSpacing: 0 }}>{decimal}</span>}
      {unit && <span style={{ fontSize: unitFz, fontWeight: 600, color: '#B0B8C8', letterSpacing: '0.04em', marginLeft: 3 }}>{unit.trim()}</span>}
    </span>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────────
type MetricCardType = 'gradient-bar' | 'gauge' | 'vertical-bar' | 'dots' | 'badges';

interface DotsVisual {
  total?: number;
  current?: number;
  colors?: string[];
}

interface BadgesVisual {
  badges?: { label: string; bg: string }[];
}

interface MetricCardProps {
  label: string;
  value: number;
  type?: MetricCardType;
  color?: string;
  max?: number;
  displayValue?: string | number;
  visual?: DotsVisual & BadgesVisual;
  onClick?: () => void;
  active?: boolean;
  compact?: boolean;
}

export function MetricCard({ label, value, type = 'gauge', color = '#10B981', max = 100, displayValue, visual, onClick, active = false, compact = false }: MetricCardProps) {
  const pct     = Math.min(value / max, 1);
  const cardRef = useRef<HTMLDivElement>(null);
  const SC      = SURFACE.card as unknown as { bg: string; border: string; borderRadius: number | string; boxShadow?: string; shadow: string; shadowHover: string; shadowPress: string; padding: string; borderHover: string };
  const cardH   = compact ? 110 : CARD_H;
  const pad     = compact ? 12 : 16;
  const numFz   = compact ? 26 : 32;
  const numMb   = compact ? 6 : 14;

  const handleEnter = () => {
    if (!cardRef.current) return;
    cardRef.current.style.border    = active ? `1.5px solid ${color}` : SC.borderHover;
    cardRef.current.style.boxShadow = SC.shadowHover;
  };
  const handleLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.border    = active ? `1.5px solid ${color}` : SC.border;
    cardRef.current.style.boxShadow = active ? SC.shadowHover : SC.shadow;
  };
  const handleDown = () => { if (cardRef.current) cardRef.current.style.boxShadow = SC.shadowPress; };
  const handleUp   = () => { if (cardRef.current) cardRef.current.style.boxShadow = SC.shadowHover; };

  let viz: ReactNode;
  switch (type) {
    case 'gradient-bar':
      viz = (
        <div style={{ marginTop: 'auto' }}>
          <div style={{ position: 'relative', paddingTop: 8, paddingBottom: compact ? 2 : 8 }}>
            <div style={{ height: 6, borderRadius: 3, background: '#E5E7EB' }} />
            <div style={{ position: 'absolute', top: 8, left: 0, height: 6, borderRadius: 3, width: `${pct * 100}%`, background: 'linear-gradient(to right, #10B981 0%, #F59E0B 50%, #EF4444 100%)' }} />
            {!compact && <div style={{ position: 'absolute', top: 11, left: `${pct * 100}%`, transform: 'translate(-50%, -50%)', width: 14, height: 14, borderRadius: '50%', background: '#fff', border: '2.5px solid #374151', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />}
          </div>
          {!compact && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.lightTxt }}>
              <span>0 · Low</span><span>50 · Med</span><span>100 · High</span>
            </div>
          )}
        </div>
      );
      break;
    case 'gauge': {
      const gpct = Math.min(Math.max(value / max, 0), 1);
      const gr = 40, cx = 50, cy = 48;
      const gangle = Math.PI * (1 - gpct);
      const gex = (cx + gr * Math.cos(gangle)).toFixed(2);
      const gey = (cy - gr * Math.sin(gangle)).toFixed(2);
      const gLargeArc = gpct > 0.5 ? 1 : 0;
      viz = (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
            <svg viewBox="4 -4 92 72" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', maxWidth: '90%', maxHeight: '90%', display: 'block' }}>
              <defs>
                <linearGradient id="mcGaugeGrad" x1="10" y1="48" x2="90" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#EF4444" />
                  <stop offset="50%"  stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <path d="M 10 48 A 40 40 0 0 1 90 48" fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round" />
              {gpct > 0.01 && (
                <path d={`M 10 48 A 40 40 0 ${gLargeArc} 1 ${gex} ${gey}`} fill="none" stroke="url(#mcGaugeGrad)" strokeWidth="10" strokeLinecap="round" />
              )}
              <text x="50" y="62" textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: T.darkTxt, fontFamily: TYPOGRAPHY.fontDisplay }}>
                {displayValue ?? value}
              </text>
            </svg>
          </div>
          {!compact && (
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2, fontSize: 10, color: '#9CA3AF', flexShrink: 0 }}>
              <span>POOR</span><span>EXCELLENT</span>
            </div>
          )}
        </div>
      );
      break;
    }
    case 'vertical-bar':
      viz = compact ? (
        <div style={{ marginTop: 'auto' }}>
          <div style={{ position: 'relative', height: 6, borderRadius: 3, background: '#E5E7EB', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: '0 auto 0 0', width: `${pct * 100}%`, borderRadius: 3, background: 'linear-gradient(to right, #10B981, #F59E0B 50%, #EF4444)' }} />
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch', gap: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 10, color: T.lightTxt }}>High</span>
            <span style={{ fontSize: 10, color: T.lightTxt }}>Low</span>
          </div>
          <div style={{ position: 'relative', width: 14 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 6, background: '#E5E7EB' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${pct * 100}%`, borderRadius: 6, background: 'linear-gradient(to top, #10B981, #F59E0B 50%, #EF4444)' }} />
          </div>
        </div>
      );
      break;
    case 'dots': {
      const total   = visual?.total   ?? 7;
      const current = visual?.current ?? value;
      const colors  = visual?.colors;
      viz = (
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center' }}>
          {Array.from({ length: total * 2 - 1 }, (_, i) => {
            if (i % 2 === 0) {
              const di = i / 2;
              const dotColor = di < current ? (colors?.[di] ?? color) : '#D1D5DB';
              return (
                <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: dotColor, boxShadow: di < current ? `0 0 0 2px ${dotColor}33` : 'none' }} />
              );
            }
            return <div key={i} style={{ flex: 1, height: 2, background: '#D1D5DB' }} />;
          })}
        </div>
      );
      break;
    }
    case 'badges':
      viz = (
        <div style={{ marginTop: 'auto', display: 'flex', gap: compact ? 4 : 6, flexWrap: 'wrap' }}>
          {(visual?.badges || []).map(({ label: bl, bg: bc }) => (
            <Chip key={bl} label={bl} color={bc} size={compact ? 'sm' : undefined} />
          ))}
        </div>
      );
      break;
    default:
      viz = null;
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', height: cardH,
        padding: pad, boxSizing: 'border-box',
        background: SC.bg,
        border:       active ? `1.5px solid ${color}` : SC.border,
        borderRadius: SC.borderRadius,
        boxShadow:    active ? SC.shadowHover : SC.shadow,
        transition: 'border 0.15s ease, box-shadow 0.15s ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: active ? color : T.lightTxt, marginBottom: compact ? 4 : 8 }}>
        {label}
      </div>
      {type !== 'gauge' && (
        <div style={{ fontSize: numFz, fontWeight: 700, color: T.darkTxt, lineHeight: 1, fontFamily: TYPOGRAPHY.fontDisplay, marginBottom: numMb }}>
          <NumericValue value={String(displayValue ?? value)} fontSize={numFz} />
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {viz}
      </div>
    </div>
  );
}

// ── DetailsCard ───────────────────────────────────────────────────────────────
type DetailsItemType = 'badge' | 'progress' | 'chips' | undefined;

interface DetailsItemBase {
  label: string;
  type?: DetailsItemType;
  value?: string | number;
}

interface BadgeItem extends DetailsItemBase {
  type: 'badge';
  badge: string;
  badgeBg?: string;
  badgeColor?: string;
}

interface ProgressItem extends DetailsItemBase {
  type: 'progress';
  progress: number;
  value: string;
}

interface ChipsItem extends DetailsItemBase {
  type: 'chips';
  chips: { label: string; color: string }[];
}

interface PlainItem extends DetailsItemBase {
  type?: undefined;
  value: string | number;
}

type DetailsItem = BadgeItem | ProgressItem | ChipsItem | PlainItem;

interface DetailsCardProps {
  title?: string;
  items: DetailsItem[];
  layout?: 'vertical' | 'horizontal';
}

export function DetailsCard({ title, items, layout = 'vertical' }: DetailsCardProps) {
  const isH = layout === 'horizontal';
  const SC = SURFACE.card as unknown as { bg: string; border: string; borderRadius: number | string; shadow: string; padding: string };

  const ItemValue = ({ item }: { item: DetailsItem }) => {
    if (item.type === 'badge') return (
      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: item.badgeBg || '#D1FAE5', color: item.badgeColor || '#065F46' }}>
        {item.badge}
      </span>
    );
    if (item.type === 'progress') return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: isH ? 160 : undefined }}>
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#E5E7EB', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 4, background: T.red, width: `${item.progress}%` }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.darkTxt, fontFamily: TYPOGRAPHY.fontMono, flexShrink: 0 }}>{item.value}</div>
      </div>
    );
    if (item.type === 'chips') return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: isH ? 'flex-end' : 'flex-start' }}>
        {item.chips.map(({ label: cl, color: cc }) => (
          <Chip key={cl} label={cl} color={cc} />
        ))}
      </div>
    );
    return (
      <div style={{ fontSize: 13, fontWeight: 500, color: T.darkTxt, textAlign: isH ? 'right' : 'left' }}>
        {item.value}
      </div>
    );
  };

  return (
    <div style={{ background: SC.bg, border: SC.border, borderRadius: SC.borderRadius, boxShadow: SC.shadow, padding: SC.padding }}>
      {title && (
        <div style={{ fontSize: 14, fontWeight: 600, color: T.darkTxt, marginBottom: 14 }}>
          {title}
        </div>
      )}
      <div>
        {items.map((item, i) => (
          <div key={item.label} style={{
            padding: '10px 0',
            borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : 'none',
            ...(isH ? { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 } as CSSProperties : {}),
          }}>
            <div style={{ fontSize: 12, color: T.lightTxt, ...(isH ? {} : { marginBottom: 5 }), flexShrink: 0 }}>
              {item.label}
            </div>
            <ItemValue item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Callout ───────────────────────────────────────────────────────────────────
type CalloutSeverity = 'info' | 'success' | 'warning' | 'critical';

interface CalloutProps {
  severity?: CalloutSeverity;
  label?: string;
  children?: ReactNode;
  onDismiss?: () => void;
}

export function Callout({ severity = 'info', label, children, onDismiss }: CalloutProps) {
  const callout = CALLOUT_TOKEN as unknown as {
    variants: Record<string, { bg: string; border: string; accent: string; labelColor: string; textColor: string }>;
    borderRadius: number | string;
    accentWidth: number;
    padding: string;
    labelSize: number;
    textSize: number;
    lineHeight: number;
  };
  const v = callout.variants[severity];
  return (
    <div style={{ display: 'flex', background: v.bg, borderRadius: callout.borderRadius, border: v.border, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div style={{ width: callout.accentWidth, flexShrink: 0, background: v.accent }} />
      <div style={{ padding: callout.padding, flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          {label && (
            <div style={{ fontSize: callout.labelSize, fontWeight: 700, color: v.labelColor, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              {label}
            </div>
          )}
          <div style={{ fontSize: callout.textSize, color: v.textColor, lineHeight: callout.lineHeight }}>
            {children}
          </div>
        </div>
        {onDismiss && (
          <DismissBtn onClick={onDismiss} color={v.labelColor} />
        )}
      </div>
    </div>
  );
}

function DismissBtn({ onClick, color }: { onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color, opacity: 0.5, flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'opacity 0.15s', outline: 'none' }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </button>
  );
}
