export const Input = ({ 
  label, 
  error, 
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-500 text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border border-border rounded-xl text-base bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20 focus:border-accent transition-colors ${
          error ? 'border-risk-critical focus:ring-risk-critical' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="block text-xs text-risk-critical mt-1">{error}</span>
      )}
    </div>
  );
};
