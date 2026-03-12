import type { CSSProperties } from 'react';
import { CHIP } from '@/tokens/designTokens';

interface StatusChipProps {
  status?: string;
  risk?: string;
  dot?: boolean;
  size?: 'md' | 'sm';
  label?: string;
  style?: CSSProperties;
}

export function StatusChip({ status, risk, dot = true, size = 'md', label, style }: StatusChipProps) {
  const chipRisk = CHIP.risk as unknown as Record<string, { bg: string; color: string; dot: string } | undefined>;
  const chipStatus = CHIP.status as unknown as Record<string, { bg: string; color: string; dot: string; label: string } | undefined>;
  const chipSize = CHIP.size as unknown as Record<string, { gap: number; padding: string; fontSize: number; fontWeight: number; dotSize: number } | undefined>;

  const tokens = risk ? chipRisk[risk] : chipStatus[status ?? ''];
  const s      = chipSize[size] ?? chipSize['md']!;

  const displayLabel = label
    ?? (risk ? risk : (chipStatus[status ?? '']?.label ?? status ?? '—'));

  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          dot ? s.gap : 0,
      padding:      s.padding,
      borderRadius: CHIP.borderRadius,
      background:   tokens?.bg    ?? '#F3F4F6',
      color:        tokens?.color ?? '#6B7280',
      fontSize:     s.fontSize,
      fontWeight:   s.fontWeight,
      whiteSpace:   'nowrap',
      lineHeight:   1,
      ...style,
    }}>
      {dot && (
        <span style={{
          width:        s.dotSize,
          height:       s.dotSize,
          borderRadius: '50%',
          background:   tokens?.dot ?? '#9CA3AF',
          flexShrink:   0,
        }} />
      )}
      {displayLabel}
    </span>
  );
}
