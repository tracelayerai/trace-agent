import { useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { SURFACE } from '@/tokens/designTokens';

interface CardProps {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  active?: boolean;
  accentColor?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Card = ({
  children,
  padding = 'md',
  className = '',
  style,
  onClick,
  active = false,
  accentColor: _accentColor = '#10B981',
  onMouseEnter: onEnterExtra,
  onMouseLeave: onLeaveExtra,
}: CardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const paddingStyles = { sm: 'p-3', md: 'p-4', lg: 'p-6' };
  const C = SURFACE.card;

  const onEnter = () => {
    if (!ref.current || !onClick) return;
    ref.current.style.border    = C.borderHover;
    ref.current.style.boxShadow = C.shadowHover;
    onEnterExtra?.();
  };
  const onLeave = () => {
    if (!ref.current || !onClick) return;
    ref.current.style.border    = C.border;
    ref.current.style.boxShadow = active ? C.shadowHover : C.shadow;
    onLeaveExtra?.();
  };
  const onDown = () => {
    if (!ref.current || !onClick) return;
    ref.current.style.boxShadow = C.shadowPress;
    ref.current.style.transform = 'scale(0.985)';
  };
  const onUp = () => {
    if (!ref.current || !onClick) return;
    ref.current.style.boxShadow = C.shadowHover;
    ref.current.style.transform = 'scale(1)';
  };

  return (
    <div
      ref={ref}
      className={`rounded-xl ${paddingStyles[padding]} ${className}`}
      style={{
        background: C.bg,
        border:     C.border,
        boxShadow:  active ? C.shadowHover : C.shadow,
        borderRadius: C.borderRadius,
        transition: 'border 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseDown={onDown}
      onMouseUp={onUp}
    >
      {children}
    </div>
  );
};
