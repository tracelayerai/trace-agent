import { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { INPUT } from '@/tokens/designTokens';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options?: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: CSSProperties;
}

export function CustomSelect({ options = [], value, onChange, placeholder = 'Select…', style: _style }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const sel = INPUT.select as unknown as {
    border: string; minWidth: number; height: number; padding: string;
    borderRadius: number; bg: string; fontSize: number; color: string;
    hover: { border: string; shadow: string };
    focus: { border: string; shadow: string };
  };

  const triggerBorder = open ? sel.focus.border : hov ? sel.hover.border : sel.border;
  const triggerShadow = open ? sel.focus.shadow : hov ? sel.hover.shadow : 'none';


  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: sel.minWidth }}>
      <style>{`@keyframes csSlide{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: sel.height,
          padding: sel.padding,
          borderRadius: sel.borderRadius,
          border: triggerBorder,
          background: sel.bg,
          fontSize: sel.fontSize,
          color: selected ? sel.color : '#9CA3AF',
          boxShadow: triggerShadow,
          outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
          transition: (INPUT as unknown as { transition: string }).transition,
          boxSizing: 'border-box',
          textAlign: 'left',
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ flexShrink: 0, color: '#9CA3AF', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.18s ease' }}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
          zIndex: 9999, overflow: 'hidden',
          animation: 'csSlide 0.16s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{
            padding: '10px 14px 8px',
            background: '#F9FAFB',
            borderBottom: '1px solid #F3F4F6',
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: '#B0B8C8',
          }}>
            Select option
          </div>

          <div style={{ padding: 6, maxHeight: 240, overflowY: 'auto' }}>
            {options.map(opt => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); onChange?.(opt.value); setOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 12px', borderRadius: 8,
                    background: isSelected ? '#DBEAFE' : 'none',
                    border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? '#2D3142' : '#4A5568',
                    fontFamily: 'inherit', textAlign: 'left',
                    transition: 'all 0.12s', marginBottom: 2,
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = '#F5F7FA'; e.currentTarget.style.transform = 'translateX(2px)'; }}}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'translateX(0)'; }}}
                >
                  {opt.label}
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: '#4B7AC7', flexShrink: 0 }}>
                      <path d="M2.5 7l3.5 3.5 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
