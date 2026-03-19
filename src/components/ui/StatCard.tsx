import type { ElementType } from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

// ── Numeric value — integer / decimal / unit rendered with scale ──────────────
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
      {decimal && (
        <span style={{ fontSize: decFz }} className="font-medium text-[#9CA3AF] tracking-normal">
          {decimal}
        </span>
      )}
      {unit && (
        <span style={{ fontSize: unitFz }} className="font-semibold text-[#B0B8C8] tracking-[0.04em] ml-[3px]">
          {unit.trim()}
        </span>
      )}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ElementType;
  sublabel?: string;
  accent?: string;
  onClick?: () => void;
  active?: boolean;
  compact?: boolean;
  className?: string;
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  sublabel,
  accent,
  onClick,
  active = false,
  compact = false,
  className = '',
}: StatCardProps) => {
  const numFz = compact ? 24 : 30;

  return (
    <Card
      className={cn(active ? 'opacity-50' : 'opacity-100', 'transition-opacity duration-[180ms]', className)}
      padding={compact ? 'sm' : 'md'}
      onClick={onClick}
      active={active}
    >
      <div className="flex gap-[12px] items-start">
        {accent && (
          <div
            className="self-stretch shrink-0 rounded-full"
            style={{ width: 4, background: accent }}
          />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <span className={cn('text-[11px] font-bold uppercase tracking-[0.07em] text-trace-icon-rest', compact ? 'mb-[4px]' : 'mb-[6px]', 'block')}>
              {label}
            </span>
            {Icon && <Icon size={14} className="text-trace-icon-rest" />}
          </div>
          <div
            className="font-bold leading-none text-[#1A1F35] font-display"
            style={{ fontSize: numFz }}
          >
            <NumericValue value={value} fontSize={numFz} />
          </div>
          {!compact && sublabel && (
            <div className="text-[12px] text-trace-icon-rest mt-[5px]">{sublabel}</div>
          )}
        </div>
      </div>
    </Card>
  );
};
