import { useState } from 'react';
import { cn } from '@/lib/utils';

interface GaugeMetricProps {
  value?: number;
  label?: string;
  color?: string;
  onClick?: () => void;
  active?: boolean;
}

const GaugeMetric = ({ value = 91, label = 'AI CONFIDENCE', color = '#10B981', onClick, active = false }: GaugeMetricProps) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn(
        'flex flex-col h-[176px] p-[16px] bg-white rounded-[12px]',
        'border transition-all duration-150',
        onClick ? 'cursor-pointer' : 'cursor-default',
        active
          ? 'shadow-[0_4px_16px_rgba(0,0,0,0.10)]'
          : (onClick && hov)
            ? 'border-[#C9CDD6] shadow-[0_4px_20px_rgba(0,0,0,0.12)]'
            : 'border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.04)]',
      )}
      style={{
        borderColor: active ? color : undefined,
        borderWidth: active ? '1.5px' : undefined,
      }}
    >
      <div
        className="text-[11px] font-bold uppercase tracking-[0.07em] mb-[4px] shrink-0"
        style={{ color: active ? color : '#717A8C' }}
      >
        {label}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <svg viewBox="0 0 200 120" className="w-full flex-1">
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

        <div className="flex justify-between text-[10px] font-bold text-[#9CA3AF] tracking-[0.06em] shrink-0">
          <span>POOR</span>
          <span>EXCELLENT</span>
        </div>
      </div>
    </div>
  );
};

export default GaugeMetric;
