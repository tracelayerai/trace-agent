import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ── Size variants ─────────────────────────────────────────────────────────────
const chipVariants = cva(
  'inline-flex items-center whitespace-nowrap leading-none font-semibold rounded-full',
  {
    variants: {
      size: {
        md: 'gap-[5px] px-[10px] py-[4px] text-[12px]',
        sm: 'gap-[4px] px-[8px]  py-[3px] text-[11px]',
      },
    },
    defaultVariants: { size: 'md' },
  }
);

// ── Token maps (CSS variables as Tailwind arbitrary values) ───────────────────
const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  'open':             { bg: 'bg-trace-status-open-bg',     text: 'text-trace-status-open-text',     dot: 'bg-[#3B82F6]',  label: 'Open'             },
  'under-review':     { bg: 'bg-trace-status-review-bg',   text: 'text-trace-status-review-text',   dot: 'bg-[#7C3AED]',  label: 'Under Review'     },
  'pending-approval': { bg: 'bg-trace-status-pending-bg',  text: 'text-trace-status-pending-text',  dot: 'bg-[#F59E0B]',  label: 'Pending Approval' },
  'returned':         { bg: 'bg-trace-status-returned-bg', text: 'text-trace-status-returned-text', dot: 'bg-[#EF4444]',  label: 'Returned'         },
  'approved':         { bg: 'bg-trace-status-approved-bg', text: 'text-trace-status-approved-text', dot: 'bg-[#10B981]',  label: 'Approved'         },
  'escalated':        { bg: 'bg-trace-status-returned-bg', text: 'text-trace-status-returned-text', dot: 'bg-[#EF4444]',  label: 'Escalated'        },
  'closed':           { bg: 'bg-trace-status-closed-bg',   text: 'text-trace-status-closed-text',   dot: 'bg-[#9CA3AF]',  label: 'Closed'           },
  'archived':         { bg: 'bg-trace-status-closed-bg',   text: 'text-trace-status-archived-text', dot: 'bg-[#D1D5DB]',  label: 'Archived'         },
  'reopened':         { bg: 'bg-trace-status-pending-bg',  text: 'text-trace-status-pending-text',  dot: 'bg-[#F59E0B]',  label: 'Reopened'         },
};

const RISK_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Critical': { bg: 'bg-trace-risk-critical-bg', text: 'text-trace-risk-critical-text', dot: 'bg-trace-risk-critical-dot' },
  'High':     { bg: 'bg-trace-risk-high-bg',     text: 'text-trace-risk-high-text',     dot: 'bg-trace-risk-high-dot'     },
  'Medium':   { bg: 'bg-trace-risk-medium-bg',   text: 'text-trace-risk-medium-text',   dot: 'bg-trace-risk-medium-dot'   },
  'Low':      { bg: 'bg-trace-risk-low-bg',      text: 'text-trace-risk-low-text',      dot: 'bg-trace-risk-low-dot'      },
};

const DOT_SIZE: Record<string, string> = {
  md: 'w-[7px] h-[7px]',
  sm: 'w-[6px] h-[6px]',
};

// ── Component ─────────────────────────────────────────────────────────────────
interface StatusChipProps extends VariantProps<typeof chipVariants> {
  status?: string;
  risk?: string;
  dot?: boolean;
  label?: string;
  className?: string;
}

export function StatusChip({ status, risk, dot = true, size = 'md', label, className }: StatusChipProps) {
  const styles = risk
    ? RISK_STYLES[risk]   ?? { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-[#9CA3AF]' }
    : STATUS_STYLES[status ?? ''] ?? { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-[#9CA3AF]' };

  const displayLabel = label
    ?? (risk ? risk : (STATUS_STYLES[status ?? '']?.label ?? status ?? '—'));

  const resolvedSize = size ?? 'md';

  return (
    <span className={cn(chipVariants({ size }), styles.bg, styles.text, className)}>
      {dot && (
        <span className={cn('rounded-full shrink-0', DOT_SIZE[resolvedSize], styles.dot)} />
      )}
      {displayLabel}
    </span>
  );
}
