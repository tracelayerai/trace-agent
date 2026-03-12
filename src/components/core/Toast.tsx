import { useState, useCallback } from 'react';
import type { ElementType } from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';
import { RADIUS } from '@/tokens/designTokens';

type ToastVariant = 'success' | 'error' | 'info';

interface VariantConfig {
  bg: string;
  color: string;
  Icon: ElementType;
}

const VARIANTS: Record<ToastVariant, VariantConfig> = {
  success: { bg: '#22C55E', color: '#fff', Icon: Check },
  error:   { bg: '#EF4444', color: '#fff', Icon: AlertCircle },
  info:    { bg: '#2D3142', color: '#fff', Icon: Info },
};

interface ToastProps {
  message?: string;
  variant?: ToastVariant;
}

export function Toast({ message, variant = 'success' }: ToastProps) {
  if (!message) return null;
  const { bg, color, Icon } = VARIANTS[variant] ?? VARIANTS.success;
  return (
    <>
      <style>{`@keyframes _toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        background: bg, color,
        padding: '12px 20px',
        borderRadius: RADIUS.md,
        fontSize: 13, fontWeight: 500,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', gap: 8,
        animation: '_toastIn 0.22s cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: 'none',
      }}>
        <Icon size={14} strokeWidth={2.5} />
        {message}
      </div>
    </>
  );
}

export interface ToastState {
  message: string;
  variant: ToastVariant;
}

type ShowToast = (message: string, variant?: ToastVariant, duration?: number) => void;

export function useToast(): [ToastState, ShowToast] {
  const [state, setState] = useState<ToastState>({ message: '', variant: 'success' });

  const show = useCallback<ShowToast>((message, variant = 'success', duration = 4000) => {
    setState({ message, variant });
    setTimeout(() => setState({ message: '', variant: 'success' }), duration);
  }, []);

  return [state, show];
}
