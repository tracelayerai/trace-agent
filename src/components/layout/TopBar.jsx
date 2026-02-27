import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';

export const TopBar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="fixed top-0 left-16 right-0 h-14 bg-surface border-b border-border flex items-center px-6 z-30">
      <div className="w-full relative">
        <SearchIcon
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search wallet address or Case ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm bg-page text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20 transition-colors"
        />
      </div>
    </header>
  );
}
