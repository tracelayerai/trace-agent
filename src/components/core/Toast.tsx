import { useState, useCallback } from 'react';
import type { ElementType } from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

interface VariantConfig {
  bg: string;
  Icon: ElementType;
}

const VARIANTS: Record<ToastVariant, VariantConfig> = {
  success: { bg: 'bg-[#22C55E]', Icon: Check },
  error:   { bg: 'bg-[#EF4444]', Icon: AlertCircle },
  info:    { bg: 'bg-[#2D3142]', Icon: Info },
};

interface ToastProps {
  message?: string;
  variant?: ToastVariant;
}

export function Toast({ message, variant = 'success' }: ToastProps) {
  if (!message) return null;
  const { bg, Icon } = VARIANTS[variant] ?? VARIANTS.success;
  return (
    <>
      <style>{`@keyframes _toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div
        className={cn(
          'fixed bottom-[24px] right-[24px] z-[9999] text-white',
          'px-[20px] py-[12px] rounded-md',
          'text-[13px] font-medium',
          'shadow-[0_4px_20px_rgba(0,0,0,0.25)]',
          'flex items-center gap-[8px]',
          'pointer-events-none',
          bg,
        )}
        style={{ animation: '_toastIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}
      >
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
