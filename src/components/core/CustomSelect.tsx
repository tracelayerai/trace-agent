import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectPrimitive,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options?: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  className,
}: CustomSelectProps) {
  return (
    <Select value={value ?? ''} onValueChange={(v) => { if (v !== null) onChange?.(v); }}>
      <SelectTrigger
        className={cn(
          'flex-1 min-w-[140px] w-full !h-[38px] py-0 px-[12px]',
          'bg-white rounded-[8px] font-sans text-[13px] text-left',
          'border-trace-border-light hover:border-[#B8BCC6] hover:shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
          'data-[popup-open]:border-[#2563EB] data-[popup-open]:shadow-[0_0_0_3px_rgba(37,99,235,0.12),0_1px_3px_rgba(0,0,0,0.08)]',
          className,
        )}
      >
        <SelectValue
          placeholder={<span className="text-[#9CA3AF]">{placeholder}</span>}
          className="text-trace-text-dark"
        />
      </SelectTrigger>

      <SelectContent className="bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden p-[6px] ring-0">
        {options.map((opt) => (
          <SelectPrimitive.Item
            key={opt.value}
            value={opt.value}
            className={cn(
              'w-full flex items-center justify-between px-[12px] py-[9px] rounded-[8px] mb-[2px]',
              'cursor-pointer text-[13px] font-sans text-left outline-none select-none',
              'transition-[background,transform] duration-[120ms]',
              'text-[#4A5568] hover:bg-[#F5F7FA]',
              'data-[selected]:bg-[#DBEAFE] data-[selected]:text-[#2D3142] data-[selected]:font-semibold',
              'data-[highlighted]:bg-[#F5F7FA]',
            )}
          >
            <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
            <SelectPrimitive.ItemIndicator className="text-[#4B7AC7]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7l3.5 3.5 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </SelectPrimitive.ItemIndicator>
          </SelectPrimitive.Item>
        ))}
      </SelectContent>
    </Select>
  );
}
