import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  className?: string;
  blocking?: boolean;
}

export const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  footer,
  className = '',
  blocking = false,
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen || !blocking) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [isOpen, blocking]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={blocking ? undefined : onClose}
      />
      <div className={`relative bg-surface rounded-[12px] shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-600 text-text-primary">{title}</h2>
          {!blocking && (
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="px-6 py-4">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
