import { useState } from 'react';

export const Tabs = ({ tabs, defaultTab = 0, onChange, className = '' }) => {
  const [active, setActive] = useState(defaultTab);

  const handleChange = (index) => {
    setActive(index);
    onChange?.(index);
  };

  return (
    <div className={className}>
      <div className="flex border-b border-border">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleChange(index)}
            className={`px-4 py-3 text-sm font-500 border-b-2 transition-colors ${
              active === index
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs[active]?.content}
      </div>
    </div>
  );
};
