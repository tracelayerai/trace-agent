import { useState } from 'react';
import type { CSSProperties, ReactNode, ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { INPUT } from '@/tokens/designTokens';

const LABEL_STYLE: CSSProperties = {
  fontSize:      12,
  fontWeight:    600,
  color:         '#717A8C',
  letterSpacing: '0.04em',
  whiteSpace:    'nowrap',
  flexShrink:    0,
  userSelect:    'none',
};

interface FormFieldProps {
  label?: string;
  labelLayout?: 'top' | 'left';
  children: ReactNode;
  style?: CSSProperties;
}

export function FormField({ label, labelLayout = 'top', children, style }: FormFieldProps) {
  if (labelLayout === 'left') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, ...style }}>
        {label && <span style={LABEL_STYLE}>{label}</span>}
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <span style={LABEL_STYLE}>{label}</span>}
      {children}
    </div>
  );
}

interface FilterSearchInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  mono?: boolean;
  width?: number | string;
  style?: CSSProperties;
}

export function FilterSearchInput({ value, onChange, placeholder = 'Search...', mono = false, width, style }: FilterSearchInputProps) {
  const [focused,  setFocused]  = useState(false);
  const [hovered, setHovered] = useState(false);

  const inp = INPUT as unknown as { border: string; shadow: string; hover: { border: string; shadow: string }; focus: { border: string; shadow: string } };
  const border = focused ? inp.focus.border : hovered ? inp.hover.border : inp.border;
  const shadow = focused ? inp.focus.shadow : hovered ? inp.hover.shadow : inp.shadow;

  return (
    <div style={{ position: 'relative', flex: width ? undefined : 1, width, ...style }}>
      <span style={{
        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', color: '#C4C9D4', display: 'flex',
      }}>
        <Search size={13} />
      </span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          height: (INPUT as unknown as { height: number }).height,
          background: (INPUT as unknown as { bg: string }).bg,
          border,
          borderRadius: (INPUT as unknown as { borderRadius: number }).borderRadius,
          padding: (INPUT as unknown as { padding: string }).padding,
          paddingLeft: 30,
          fontSize: (INPUT as unknown as { fontSize: number }).fontSize,
          color: (INPUT as unknown as { color: string }).color,
          boxShadow: shadow,
          outline: 'none',
          transition: (INPUT as unknown as { transition: string }).transition,
          boxSizing: 'border-box',
          fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
        }}
      />
    </div>
  );
}
