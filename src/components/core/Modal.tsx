import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { RADIUS, MODAL_SIZE } from '@/tokens/designTokens';
import { GhostIcon } from '@/components/core/CaseHeader';

type ModalTheme = 'light' | 'dark';
type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ThemeConfig {
  overlay: string; card: string; border: string; shadow: string;
  titleColor: string; closeColor: string; closeHoverBg: string;
  closeHoverColor: string; divider: string; titleBorder: string;
}

const THEMES: Record<ModalTheme, ThemeConfig> = {
  light: {
    overlay:      'rgba(0,0,0,0.50)',
    card:         '#FFFFFF',
    border:       '1px solid #E5E7EB',
    shadow:       '0 8px 40px rgba(0,0,0,0.18)',
    titleColor:   '#1A1F35',
    closeColor:   '#9CA3AF',
    closeHoverBg: '#F3F4F6',
    closeHoverColor: '#374151',
    divider:      '1px solid #F3F4F6',
    titleBorder:  '1px solid #F0F1F3',
  },
  dark: {
    overlay:      'rgba(0,0,0,0.72)',
    card:         '#111827',
    border:       '1px solid rgba(255,255,255,0.10)',
    shadow:       '0 12px 48px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)',
    titleColor:   '#FFFFFF',
    closeColor:   'rgba(255,255,255,0.4)',
    closeHoverBg: 'rgba(255,255,255,0.08)',
    closeHoverColor: 'rgba(255,255,255,0.85)',
    divider:      '1px solid rgba(255,255,255,0.07)',
    titleBorder:  '1px solid rgba(255,255,255,0.07)',
  },
};

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  size?: ModalSize;
  width?: number;
  theme?: ModalTheme;
  children?: ReactNode;
}

export function Modal({ open, onClose, title, size = 'md', width, theme = 'dark', children }: ModalProps) {
  const t = THEMES[theme] ?? THEMES.dark;
  const modalSizes = MODAL_SIZE as unknown as Record<string, number>;
  const resolvedWidth = width ?? modalSizes[size] ?? modalSizes['md'];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: t.overlay,
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: resolvedWidth, maxWidth: '90vw',
          background: t.card,
          borderRadius: RADIUS.xl,
          border: t.border,
          boxShadow: t.shadow,
          boxSizing: 'border-box',
          overflow: 'visible',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: t.titleBorder }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: t.titleColor, letterSpacing: '-0.2px' }}>{title}</span>
            <GhostIcon icon={X} size="sm" onClick={onClose} />
          </div>
        )}
        <div style={{ padding: '24px 28px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
