import type { ReactNode, ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label?: string;
  labelLayout?: 'top' | 'left';
  children: ReactNode;
  className?: string;
}

export function FormField({ label, labelLayout = 'top', children, className }: FormFieldProps) {
  const labelEl = label && (
    <span className="text-[12px] font-semibold text-trace-icon-rest tracking-[0.04em] whitespace-nowrap shrink-0 select-none">
      {label}
    </span>
  );

  if (labelLayout === 'left') {
    return (
      <div className={cn('flex items-center gap-[10px] flex-1', className)}>
        {labelEl}
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-[6px]', className)}>
      {labelEl}
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
  className?: string;
}

export function FilterSearchInput({ value, onChange, placeholder = 'Search...', mono = false, width, className }: FilterSearchInputProps) {
  return (
    <div className={cn('relative', width ? '' : 'flex-1', className)} style={width ? { width } : undefined}>
      <span className="absolute left-[10px] top-1/2 -translate-y-1/2 pointer-events-none text-[#C4C9D4] flex">
        <Search size={13} />
      </span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          'w-full h-[38px] bg-white pl-[30px] pr-[10px] py-0',
          'border border-trace-border-light rounded-[8px]',
          'text-[13px] text-trace-text-dark',
          'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
          'outline-none transition-[border-color,box-shadow] duration-150',
          'placeholder:text-[#C4C9D4]',
          'hover:border-[#B8BCC6] hover:shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
          'focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12),0_1px_3px_rgba(0,0,0,0.08)]',
          mono ? 'font-mono' : 'font-sans',
        )}
      />
    </div>
  );
}
