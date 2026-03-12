import { useState } from 'react';
import type { ReactNode } from 'react';

interface Tab {
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: number;
  onChange?: (index: number) => void;
  className?: string;
}

export const Tabs = ({ tabs, defaultTab = 0, onChange, className = '' }: TabsProps) => {
  const [active, setActive] = useState(defaultTab);

  const handleChange = (index: number) => {
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
