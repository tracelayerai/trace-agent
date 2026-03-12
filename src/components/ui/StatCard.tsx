import type { ElementType } from 'react';
import { Card } from './Card';
import { STAT_CARD } from '@/tokens/designTokens';

interface NumericValueProps {
  value: string | number;
  fontSize: number;
}

function NumericValue({ value, fontSize }: NumericValueProps) {
  if (typeof value !== 'string') {
    return <span>{value}</span>;
  }
  const m = value.match(/^([+-]?\d[\d,]*)(\.\d+)?(\s*[A-Za-z%]+)?$/);
  if (!m || (!m[2] && !m[3])) {
    return <span>{value}</span>;
  }
  const [, integer, decimal, unit] = m;
  const decFz  = Math.round(fontSize * 0.55);
  const unitFz = Math.round(fontSize * 0.42);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
      <span>{integer}</span>
      {decimal && (
        <span style={{ fontSize: decFz, fontWeight: 500, color: '#9CA3AF', letterSpacing: 0 }}>
          {decimal}
        </span>
      )}
      {unit && (
        <span style={{ fontSize: unitFz, fontWeight: 600, color: '#B0B8C8', letterSpacing: '0.04em', marginLeft: 3 }}>
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
  const numFz = compact ? 24 : STAT_CARD.number.fontSize;
  return (
    <Card
      className={className}
      padding={compact ? 'sm' : 'md'}
      onClick={onClick}
      active={active}
      accentColor={accent}
      style={{ opacity: active ? 0.5 : 1, transition: 'opacity 0.18s ease' }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {accent && (
          <div style={{
            width: STAT_CARD.bar.width,
            alignSelf: 'stretch',
            flexShrink: 0,
            background: accent,
            borderRadius: STAT_CARD.bar.borderRadius,
          }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ ...STAT_CARD.label, marginBottom: compact ? 4 : STAT_CARD.label.marginBottom }}>{label}</span>
            {Icon && <Icon size={14} className="text-text-secondary" />}
          </div>
          <div style={{ ...STAT_CARD.number, fontSize: numFz }}>
            <NumericValue value={value} fontSize={numFz} />
          </div>
          {!compact && sublabel && <div style={{ fontSize: 12, color: '#717A8C', marginTop: 5 }}>{sublabel}</div>}
        </div>
      </div>
    </Card>
  );
};
