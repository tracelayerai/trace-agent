export const Badge = ({ children, variant = 'default', type = 'default' }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-1 rounded text-xs font-500 whitespace-nowrap';

  const variantStyles = {
    // Risk levels
    'risk-critical': 'bg-risk-critical text-white',
    'risk-high': 'bg-risk-high text-white',
    'risk-medium': 'bg-risk-medium text-white',
    'risk-low': 'bg-risk-low text-white',
    'risk-clear': 'bg-risk-clear text-white',
    
    // Status
    'status-open': 'bg-status-open text-white',
    'status-closed': 'bg-status-closed text-white',
    'status-reopened': 'bg-status-reopened text-white',
    
    // Compliance
    'compliance-flagged': 'bg-compliance-flagged text-white',
    'compliance-clear': 'bg-compliance-clear text-text-secondary',
    
    // Default
    'default': 'bg-border text-text-secondary',
  };

  const styles = variantStyles[variant] || variantStyles['default'];

  return (
    <span className={`${baseStyles} ${styles}`}>
      {children}
    </span>
  );
};
