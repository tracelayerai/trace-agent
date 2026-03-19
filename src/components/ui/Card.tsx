import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

const PADDING = { sm: 'p-3', md: 'p-4', lg: 'p-6' } as const;

export const Card = ({
  children,
  padding = 'md',
  className = '',
  onClick,
  active = false,
}: CardProps) => {
  return (
    <div
      className={cn(
        'bg-white border border-[#E5E7EB] rounded-[12px]',
        'shadow-[0_1px_4px_rgba(0,0,0,0.04)]',
        'transition-[border-color,box-shadow,transform] duration-150',
        onClick && [
          'cursor-pointer',
          'hover:border-[#D1D5DB] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)]',
          'active:shadow-[0_2px_6px_rgba(0,0,0,0.08)] active:scale-[0.985]',
        ],
        active && 'shadow-[0_4px_12px_rgba(0,0,0,0.10)]',
        PADDING[padding],
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
