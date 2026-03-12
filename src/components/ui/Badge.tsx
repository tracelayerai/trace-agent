import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: string;
  type?: string;
}

export const Badge = ({ children, variant = 'default' }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-1 rounded text-xs font-500 whitespace-nowrap';

  const variantStyles: Record<string, string> = {
    // Risk levels
    'risk-critical': 'bg-risk-critical text-white',
    'risk-high': 'bg-risk-high text-white',
    'risk-medium': 'bg-risk-medium text-white',
    'risk-low': 'bg-risk-low text-white',
    'risk-clear': 'bg-risk-clear text-white',
    'risk-closed': 'bg-[#6B7280] text-white',

    // Status
    'status-open': 'bg-[#3B82F6] text-white',
    'status-under-review': 'bg-[#6366F1] text-white',
    'status-pending-approval': 'bg-[#F59E0B] text-white',
    'status-approved': 'bg-[#22C55E] text-white',
    'status-returned': 'border border-[#EF4444] text-[#EF4444] bg-white',
    'status-escalated': 'bg-[#EF4444] text-white',
    'status-closed': 'bg-[#6B7280] text-white',
    'status-archived': 'bg-[#F3F4F6] text-[#6B7280]',
    'status-reopened': 'bg-[#F59E0B] text-white',

    // Compliance
    'compliance-flagged': 'bg-compliance-flagged text-white',
    'compliance-clear': 'bg-compliance-clear text-text-secondary',

    // Secondary
    'secondary': 'bg-gray-100 text-gray-700',

    // Default
    'default': 'bg-border text-text-secondary',
  };

  const iconMap: Record<string, string> = {
    'status-pending-approval': '⏱',
    'status-approved': '✓',
    'status-archived': '📦',
  };

  const styles = variantStyles[variant] ?? variantStyles['default'];
  const icon = iconMap[variant];

  return (
    <span className={`${baseStyles} ${styles}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};
