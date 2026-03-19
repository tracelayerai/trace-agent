import { useState, useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Clock } from 'lucide-react';
import { Badge } from './Badge';

interface RecentSearch {
  wallet: string;
  chain: string;
  riskLevel: string;
  compliance: string;
  timestamp?: string;
  searchedAt?: Date | string;
  isMock: boolean;
}

const MOCK_RECENT_SEARCHES = [
  { id: 1, wallet: '0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f4a5b6c7d', chain: 'Ethereum', riskLevel: 'critical', compliance: 'flagged', searchedAt: new Date(Date.now() - 5 * 60000), isMock: true },
  { id: 2, wallet: '0x5d3c8f2a1e6b4c9d0e7f8a1b2c3d4e5f6a7b8c9d', chain: 'Arbitrum', riskLevel: 'high', compliance: 'flagged', searchedAt: new Date(Date.now() - 32 * 60000), isMock: true },
  { id: 3, wallet: '0x8a7f3d0e6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f', chain: 'Ethereum', riskLevel: 'medium', compliance: 'flagged', searchedAt: new Date(Date.now() - 2 * 3600000), isMock: true },
  { id: 4, wallet: '0x4c1b5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c', chain: 'Tron', riskLevel: 'high', compliance: 'flagged', searchedAt: new Date(Date.now() - 4 * 3600000), isMock: true },
  { id: 5, wallet: '0x9f4e0c1d2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d', chain: 'Ethereum', riskLevel: 'critical', compliance: 'flagged', searchedAt: new Date(Date.now() - 5 * 3600000), isMock: true },
  { id: 6, wallet: '0x1d4e7a9b2c5f8e1d4a7b0c3f6e9d2a5b8c1f4e7a', chain: 'Polygon', riskLevel: 'low', compliance: 'clear', searchedAt: new Date(Date.now() - 24 * 3600000), isMock: true },
  { id: 7, wallet: '0x3b6e9d2a5f8c1e4b7a0d3f6c9e2b5a8d1f4c7e0b', chain: 'Ethereum', riskLevel: 'medium', compliance: 'flagged', searchedAt: new Date(Date.now() - 26 * 3600000), isMock: true },
  { id: 8, wallet: '0x2a5d8f1c4e7b0a3d6f9c2e5b8a1d4f7c0e3b6a9d', chain: 'BSC', riskLevel: 'high', compliance: 'flagged', searchedAt: new Date(Date.now() - 48 * 3600000), isMock: true },
  { id: 9, wallet: '0x6c9f2e5b8d1a4f7c0e3b6d9a2f5c8e1b4d7a0f3c', chain: 'Arbitrum', riskLevel: 'low', compliance: 'clear', searchedAt: new Date(Date.now() - 72 * 3600000), isMock: true },
  { id: 10, wallet: '0x8e1b4d7a0f3c6e9b2d5a8f1c4e7b0d3a6f9c2e5b', chain: 'Tron', riskLevel: 'medium', compliance: 'flagged', searchedAt: new Date(Date.now() - 96 * 3600000), isMock: true },
];

const getRecentSearches = (): RecentSearch[] => {
  try {
    const stored: RecentSearch[] = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const real = stored.map(s => ({ ...s, isMock: false }));
    if (real.length >= 10) return real.slice(0, 10);
    const realWallets = new Set(real.map(s => s.wallet));
    const mockFill = MOCK_RECENT_SEARCHES
      .filter(m => !realWallets.has(m.wallet))
      .slice(0, 10 - real.length)
      .map(m => ({
        wallet: m.wallet,
        chain: m.chain,
        riskLevel: m.riskLevel.charAt(0).toUpperCase() + m.riskLevel.slice(1),
        compliance: m.compliance.charAt(0).toUpperCase() + m.compliance.slice(1),
        timestamp: m.searchedAt.toISOString(),
        isMock: true,
      }));
    return [...real, ...mockFill];
  } catch {
    return MOCK_RECENT_SEARCHES.map(m => ({
      wallet: m.wallet,
      chain: m.chain,
      riskLevel: m.riskLevel.charAt(0).toUpperCase() + m.riskLevel.slice(1),
      compliance: m.compliance.charAt(0).toUpperCase() + m.compliance.slice(1),
      timestamp: m.searchedAt.toISOString(),
      isMock: true,
    }));
  }
};

const timeAgo = (ts: string | Date | undefined): string => {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const truncateAddress = (addr?: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

interface SearchWithDropdownProps {
  variant?: 'hero' | 'slim';
  observerRef?: RefObject<HTMLDivElement>;
}

export const SearchWithDropdown = ({ variant = 'hero', observerRef }: SearchWithDropdownProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => getRecentSearches());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dropdownOpen) setRecentSearches(getRecentSearches());
  }, [dropdownOpen]);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setDropdownOpen(false);
    }
  }, [query, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setDropdownOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClickRecent = (s: RecentSearch) => {
    if (s.isMock) return;
    navigate(`/search?q=${encodeURIComponent(s.wallet)}`);
    setQuery('');
    setDropdownOpen(false);
  };

  const handleClearAll = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches(getRecentSearches());
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isTyping = query.trim().length > 0;
  const hasMockItems = recentSearches.some(s => s.isMock);
  const isHero = variant === 'hero';

  return (
    <div className="relative" ref={containerRef}>
      <div ref={observerRef}>
        <SearchIcon
          size={isHero ? 22 : 18}
          className={`absolute ${isHero ? 'left-4' : 'left-3'} top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none z-10`}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search wallet address or Case ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          className={
            isHero
              ? 'w-full pl-12 pr-5 py-4 text-base border border-border rounded-2xl bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20 shadow-sm transition-colors'
              : 'w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20 transition-colors'
          }
        />
      </div>

      {dropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          {isTyping ? (
            <button
              type="button"
              onClick={handleSearch}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <SearchIcon size={16} className="text-gray-400 flex-shrink-0" />
              <span>Press Enter to search for </span>
              <span className="font-mono text-gray-700 truncate">{query.trim()}</span>
            </button>
          ) : (
            <>
              {recentSearches.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-5">No recent searches</p>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-gray-400" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Recent Searches</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {recentSearches.map((s, i) => (
                      <button
                        key={`${s.wallet}-${i}`}
                        type="button"
                        onClick={() => handleClickRecent(s)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                          s.isMock
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                        disabled={s.isMock}
                      >
                        <code className="text-sm text-gray-700 font-mono flex-shrink-0">
                          {truncateAddress(s.wallet)}
                        </code>
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <Badge variant="status-open">{s.chain}</Badge>
                          {s.riskLevel && (
                            <Badge variant={`risk-${s.riskLevel.toLowerCase()}`}>{s.riskLevel}</Badge>
                          )}
                          {s.compliance && (
                            <Badge variant={s.compliance === 'Flagged' ? 'compliance-flagged' : 'compliance-clear'}>
                              {s.compliance === 'Flagged' ? 'Flagged' : 'Clear'}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                          {timeAgo(s.timestamp ?? (s.searchedAt as string | undefined))}
                        </span>
                      </button>
                    ))}
                  </div>
                  {hasMockItems && (
                    <p className="text-xs text-gray-400 italic text-center py-2 border-t border-gray-100">
                      * Historical searches shown for demo
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
