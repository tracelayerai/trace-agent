export const Card = ({ children, padding = 'md', className = '' }) => {
  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`bg-surface border border-border rounded-xl shadow-sm ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
};
