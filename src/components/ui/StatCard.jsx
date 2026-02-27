import { Card } from './Card';

export const StatCard = ({ label, value, icon: Icon, sublabel, className = '' }) => {
  return (
    <Card className={className}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-500 text-text-secondary uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={20} className="text-text-secondary" />}
      </div>
      <div className="mb-3">
        <div className="text-3xl font-700 text-text-primary">{value}</div>
        {sublabel && <div className="text-xs text-text-secondary mt-1">{sublabel}</div>}
      </div>
    </Card>
  );
};
