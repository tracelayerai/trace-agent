import { useRef } from 'react';
import { SURFACE } from '@/tokens/designTokens';

interface SurfaceCard {
  bg: string; border: string; borderHover: string; borderRadius: number | string;
  shadow: string; shadowHover: string; shadowPress: string; padding: string;
}

interface GaugeMetricProps {
  value?: number;
  label?: string;
  color?: string;
  onClick?: () => void;
  active?: boolean;
}

const GaugeMetric = ({ value = 91, label = 'AI CONFIDENCE', color = '#10B981', onClick, active = false }: GaugeMetricProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const C = SURFACE.card as unknown as SurfaceCard;

  const onEnter = () => {
    if (!cardRef.current) return;
    cardRef.current.style.border    = active ? `1.5px solid ${color}` : C.borderHover;
    cardRef.current.style.boxShadow = C.shadowHover;
  };
  const onLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.border    = active ? `1.5px solid ${color}` : C.border;
    cardRef.current.style.boxShadow = active ? C.shadowHover : C.shadow;
  };
  const onDown = () => { if (cardRef.current) cardRef.current.style.boxShadow = C.shadowPress; };
  const onUp   = () => { if (cardRef.current) cardRef.current.style.boxShadow = C.shadowHover; };

  return (
    <div
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column',
        height: 176, padding: C.padding, boxSizing: 'border-box',
        background: C.bg,
        border:       active ? `1.5px solid ${color}` : C.border,
        borderRadius: C.borderRadius,
        boxShadow:    active ? C.shadowHover : C.shadow,
        transition: 'border 0.15s ease, box-shadow 0.15s ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: active ? color : '#717A8C',
        marginBottom: 4, flexShrink: 0,
      }}>
        {label}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <svg viewBox="0 0 200 120" style={{ width: '100%', flex: 1 }}>
          <defs>
            <linearGradient id="gmGrad" x1="14" y1="0" x2="186" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#EF4444" />
              <stop offset="45%"  stopColor="#F59E0B" />
              <stop offset="75%"  stopColor="#A3C94A" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <path d="M 14 108 A 86 86 0 0 1 186 108"
            fill="none" stroke="url(#gmGrad)" strokeWidth="16" strokeLinecap="round" />
          <text x="100" y="100" textAnchor="middle"
            fontSize="38" fontWeight="700" fill="#1A1F35" fontFamily="'Sora', sans-serif">
            {value}%
          </text>
        </svg>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10, fontWeight: 700, color: '#9CA3AF',
          letterSpacing: '0.06em', flexShrink: 0,
        }}>
          <span>POOR</span>
          <span>EXCELLENT</span>
        </div>
      </div>
    </div>
  );
};

export default GaugeMetric;
