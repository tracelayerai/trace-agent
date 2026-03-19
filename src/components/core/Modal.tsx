import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GhostIcon } from '@/components/core/CaseHeader';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogPopup,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

type ModalTheme = 'light' | 'dark';
type ModalSize  = 'sm' | 'md' | 'lg' | 'xl';

const MODAL_WIDTHS: Record<ModalSize, number> = {
  sm:  400,
  md:  480,
  lg:  580,
  xl:  720,
};

const THEME_CLASSES = {
  light: {
    backdrop: 'bg-black/50 backdrop-blur-[4px]',
    popup:    'bg-white border border-[#E5E7EB] shadow-[0_8px_40px_rgba(0,0,0,0.18)]',
    title:    'text-[#1A1F35] border-b border-[#F0F1F3]',
  },
  dark: {
    backdrop: 'bg-black/70 backdrop-blur-[4px]',
    popup:    'bg-[#111827] border border-white/10 shadow-[0_12px_48px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.4)]',
    title:    'text-white border-b border-white/[0.07]',
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
  const t = THEME_CLASSES[theme] ?? THEME_CLASSES.dark;
  const resolvedWidth = width ?? MODAL_WIDTHS[size] ?? MODAL_WIDTHS.md;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose?.(); }}>
      <DialogPortal>
        <DialogOverlay className={cn('z-[9998]', t.backdrop)} />
        <DialogPopup
          className={cn(
            'fixed z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'max-w-[90vw] rounded-[12px] overflow-visible box-border',
            t.popup,
          )}
          style={{ width: resolvedWidth }}
        >
          {title && (
            <div className={cn('flex items-center justify-between px-[24px] py-[14px]', t.title)}>
              <DialogTitle className="text-[15px] font-bold tracking-[-0.2px] m-0">
                {title}
              </DialogTitle>
              <DialogClose render={<span />}>
                <GhostIcon icon={X} size="sm" onClick={onClose} />
              </DialogClose>
            </div>
          )}
          <div className="px-[28px] py-[24px] pb-[28px]">
            {children}
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
