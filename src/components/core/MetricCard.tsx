import { useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ── Chip ──────────────────────────────────────────────────────────────────────
interface ChipProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

export function Chip({ label, color, size }: ChipProps) {
  const sm = size === 'sm';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold text-white',
        sm ? 'px-[7px] py-[2px] text-[10px] font-bold' : 'px-[10px] py-[4px] text-[12px]',
      )}
      style={{ background: color }}
    >
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
    <span className="inline-flex items-baseline gap-[1px]">
      <span>{integer}</span>
      {decimal && <span style={{ fontSize: decFz }} className="font-medium text-[#9CA3AF] tracking-normal">{decimal}</span>}
      {unit && <span style={{ fontSize: unitFz }} className="font-semibold text-[#B0B8C8] tracking-[0.04em] ml-[3px]">{unit.trim()}</span>}
    </span>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────────
type MetricCardType = 'gradient-bar' | 'gauge' | 'vertical-bar' | 'dots' | 'badges';

interface DotsVisual  { total?: number; current?: number; colors?: string[] }
interface BadgesVisual { badges?: { label: string; bg: string }[] }

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
  const [hov, setHov] = useState(false);
  const pct   = Math.min(value / max, 1);
  const numFz = compact ? 26 : 32;

  let viz: ReactNode;
  switch (type) {
    case 'gradient-bar':
      viz = (
        <div className="mt-auto">
          <div className={cn('relative', compact ? 'pt-[8px] pb-[2px]' : 'pt-[8px] pb-[8px]')}>
            <div className="h-[6px] rounded-[3px] bg-[#E5E7EB]" />
            <div className="absolute top-[8px] left-0 h-[6px] rounded-[3px]"
              style={{ width: `${pct * 100}%`, background: 'linear-gradient(to right, #10B981 0%, #F59E0B 50%, #EF4444 100%)' }}
            />
            {!compact && (
              <div className="absolute top-[11px] -translate-x-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-white border-[2.5px] border-[#374151] shadow-[0_1px_4px_rgba(0,0,0,0.25)]"
                style={{ left: `${pct * 100}%` }}
              />
            )}
          </div>
          {!compact && (
            <div className="flex justify-between text-[10px] text-[#717A8C]">
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
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 w-full flex items-center justify-center min-h-0">
            <svg viewBox="0 -10 100 82" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-w-[90%] max-h-[90%] block overflow-visible">
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
              {/* SVG text requires inline style — no Tailwind equivalent for SVG text attrs */}
              <text x="50" y="62" textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: '#1A1F35', fontFamily: "'Sora', sans-serif" }}>
                {displayValue ?? value}
              </text>
            </svg>
          </div>
          {!compact && (
            <div className="flex justify-between pt-[2px] text-[10px] text-[#9CA3AF] shrink-0">
              <span>POOR</span><span>EXCELLENT</span>
            </div>
          )}
        </div>
      );
      break;
    }
    case 'vertical-bar':
      viz = compact ? (
        <div className="mt-auto">
          <div className="relative h-[6px] rounded-[3px] bg-[#E5E7EB] overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-[3px]"
              style={{ width: `${pct * 100}%`, background: 'linear-gradient(to right, #10B981, #F59E0B 50%, #EF4444)' }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex justify-end items-stretch gap-[6px]">
          <div className="flex flex-col justify-between items-end">
            <span className="text-[10px] text-[#717A8C]">High</span>
            <span className="text-[10px] text-[#717A8C]">Low</span>
          </div>
          <div className="relative w-[14px]">
            <div className="absolute inset-0 rounded-[6px] bg-[#E5E7EB]" />
            <div className="absolute bottom-0 left-0 right-0 rounded-[6px]"
              style={{ height: `${pct * 100}%`, background: 'linear-gradient(to top, #10B981, #F59E0B 50%, #EF4444)' }}
            />
          </div>
        </div>
      );
      break;
    case 'dots': {
      const total   = visual?.total   ?? 7;
      const current = visual?.current ?? value;
      const colors  = visual?.colors;
      viz = (
        <div className="mt-auto flex items-center">
          {Array.from({ length: total * 2 - 1 }, (_, i) => {
            if (i % 2 === 0) {
              const di = i / 2;
              const dotColor = di < current ? (colors?.[di] ?? color) : '#D1D5DB';
              return (
                <div key={i} className="w-[9px] h-[9px] rounded-full shrink-0"
                  style={{ background: dotColor, boxShadow: di < current ? `0 0 0 2px ${dotColor}33` : 'none' }}
                />
              );
            }
            return <div key={i} className="flex-1 h-[2px] bg-[#D1D5DB]" />;
          })}
        </div>
      );
      break;
    }
    case 'badges':
      viz = (
        <div className={cn('mt-auto flex flex-wrap', compact ? 'gap-[4px]' : 'gap-[6px]')}>
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
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn(
        'flex flex-col bg-white rounded-[12px] border box-border',
        'transition-all duration-150',
        compact ? 'h-[110px] p-[12px]' : 'h-[176px] p-[16px]',
        onClick ? 'cursor-pointer' : 'cursor-default',
        active
          ? 'shadow-[0_4px_16px_rgba(0,0,0,0.10)]'
          : (onClick && hov)
            ? 'border-[#C9CDD6] shadow-[0_4px_20px_rgba(0,0,0,0.12)]'
            : 'border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)]',
      )}
      style={active ? { borderColor: color, borderWidth: '1.5px' } : undefined}
    >
      <div
        className={cn('text-[11px] font-bold uppercase tracking-[0.07em] shrink-0', compact ? 'mb-[4px]' : 'mb-[8px]')}
        style={{ color: active ? color : '#717A8C' }}
      >
        {label}
      </div>
      {type !== 'gauge' && (
        <div
          className={cn('font-bold leading-none text-[#1A1F35] font-display', compact ? 'mb-[6px]' : 'mb-[14px]')}
          style={{ fontSize: numFz }}
        >
          <NumericValue value={String(displayValue ?? value)} fontSize={numFz} />
        </div>
      )}
      <div className="flex-1 flex flex-col min-h-0">
        {viz}
      </div>
    </div>
  );
}

// ── DetailsCard ───────────────────────────────────────────────────────────────
type DetailsItemType = 'badge' | 'progress' | 'chips' | undefined;

interface DetailsItemBase { label: string; type?: DetailsItemType; value?: string | number }
interface BadgeItem    extends DetailsItemBase { type: 'badge';    badge: string; badgeBg?: string; badgeColor?: string }
interface ProgressItem extends DetailsItemBase { type: 'progress'; progress: number; value: string }
interface ChipsItem    extends DetailsItemBase { type: 'chips';    chips: { label: string; color: string }[] }
interface PlainItem    extends DetailsItemBase { type?: undefined; value: string | number }
type DetailsItem = BadgeItem | ProgressItem | ChipsItem | PlainItem;

interface DetailsCardProps {
  title?: string;
  items: DetailsItem[];
  layout?: 'vertical' | 'horizontal';
}

export function DetailsCard({ title, items, layout = 'vertical' }: DetailsCardProps) {
  const isH = layout === 'horizontal';

  const ItemValue = ({ item }: { item: DetailsItem }) => {
    if (item.type === 'badge') return (
      <span
        className="inline-flex items-center px-[10px] py-[3px] rounded-full text-[12px] font-bold"
        style={{ background: item.badgeBg || '#D1FAE5', color: item.badgeColor || '#065F46' }}
      >
        {item.badge}
      </span>
    );
    if (item.type === 'progress') return (
      <div className={cn('flex items-center gap-[10px]', isH ? 'min-w-[160px]' : '')}>
        <div className="flex-1 h-[8px] rounded-[4px] bg-[#E5E7EB] overflow-hidden">
          <div className="h-full rounded-[4px] bg-[#EF4444]" style={{ width: `${item.progress}%` }} />
        </div>
        <div className="text-[13px] font-bold text-[#1A1F35] font-mono shrink-0">{item.value}</div>
      </div>
    );
    if (item.type === 'chips') return (
      <div className={cn('flex gap-[6px] flex-wrap', isH ? 'justify-end' : '')}>
        {item.chips.map(({ label: cl, color: cc }) => (
          <Chip key={cl} label={cl} color={cc} />
        ))}
      </div>
    );
    return (
      <div className={cn('text-[13px] font-medium text-[#1A1F35]', isH ? 'text-right' : '')}>
        {item.value}
      </div>
    );
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-[16px]">
      {title && (
        <div className="text-[14px] font-semibold text-[#1A1F35] mb-[14px]">
          {title}
        </div>
      )}
      <div>
        {items.map((item, i) => (
          <div
            key={item.label}
            className={cn(
              'py-[10px]',
              i < items.length - 1 ? 'border-b border-[#E5E7EB]' : '',
              isH ? 'flex justify-between items-center gap-[16px]' : '',
            )}
          >
            <div className={cn('text-[12px] text-[#717A8C] shrink-0', isH ? '' : 'mb-[5px]')}>
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

const CALLOUT_CLS: Record<CalloutSeverity, { wrap: string; accent: string; label: string; text: string }> = {
  info:     { wrap: 'bg-[#EEF2FF] border border-[#C7D2FE]', accent: 'bg-[#6366F1]', label: 'text-[#3730A3]', text: 'text-[#3730A3]' },
  success:  { wrap: 'bg-[#F0FDF4] border border-[#BBF7D0]', accent: 'bg-[#10B981]', label: 'text-[#064E3B]', text: 'text-[#064E3B]' },
  warning:  { wrap: 'bg-[#FFFBEB] border border-[#FDE68A]', accent: 'bg-[#F59E0B]', label: 'text-[#78350F]', text: 'text-[#78350F]' },
  critical: { wrap: 'bg-[#FEF2F2] border border-[#FECACA]', accent: 'bg-[#EF4444]', label: 'text-[#7F1D1D]', text: 'text-[#7F1D1D]' },
};

interface CalloutProps {
  severity?: CalloutSeverity;
  label?: string;
  children?: ReactNode;
  onDismiss?: () => void;
}

export function Callout({ severity = 'info', label, children, onDismiss }: CalloutProps) {
  const v = CALLOUT_CLS[severity];
  return (
    <div className={cn('flex rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden', v.wrap)}>
      <div className={cn('w-[4px] shrink-0', v.accent)} />
      <div className="flex-1 p-[12px_16px] flex items-start justify-between gap-[12px]">
        <div className="flex-1">
          {label && (
            <div className={cn('text-[11px] font-bold uppercase tracking-[0.07em] mb-[8px]', v.label)}>
              {label}
            </div>
          )}
          <div className={cn('text-[13px] leading-[1.5]', v.text)}>
            {children}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn('bg-transparent border-none cursor-pointer p-[2px] opacity-50 hover:opacity-100 transition-opacity duration-150 shrink-0 flex items-center outline-none', v.label)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
