import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────
function truncateAddress(addr: string): string {
  if (!addr) return '';
  if (addr.length <= 16) return addr;
  return addr.slice(0, 10) + '...' + addr.slice(-6);
}

function timeAgo(ts: string | undefined): string {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Mock data ─────────────────────────────────────────────────────────────────
interface SearchEntry {
  wallet: string; chain: string; riskLevel: string | null;
  compliance: string | null; timestamp: string; isMock: boolean;
}

const MOCK_HISTORY: SearchEntry[] = [
  { wallet: '0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f4a5b6c7d', chain: 'Ethereum', riskLevel: 'Critical', compliance: 'Flagged', timestamp: new Date(Date.now() - 5*60000).toISOString(),       isMock: true },
  { wallet: '0x5d3c8f2a9b1e4c7d6e3f2a1b0c9d8e7f6a5b4c9d', chain: 'Arbitrum', riskLevel: 'High',     compliance: 'Flagged', timestamp: new Date(Date.now() - 37*60000).toISOString(),      isMock: true },
  { wallet: '0x8a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e2a1f', chain: 'Ethereum', riskLevel: 'Medium',   compliance: 'Flagged', timestamp: new Date(Date.now() - 2*3600000).toISOString(),     isMock: true },
  { wallet: '0x4c1b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f1b2c3d', chain: 'Tron',     riskLevel: 'High',     compliance: 'Flagged', timestamp: new Date(Date.now() - 4*3600000).toISOString(),     isMock: true },
  { wallet: '0x9f4e5d6c7b8a9b0c1d2e3f4a5b6c7d8e9f4e6c7d', chain: 'Ethereum', riskLevel: 'Critical', compliance: 'Flagged', timestamp: new Date(Date.now() - 5*3600000).toISOString(),     isMock: true },
  { wallet: '0x1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b1d4e7a', chain: 'Polygon',  riskLevel: 'Low',      compliance: 'Clear',   timestamp: new Date(Date.now() - 86400000).toISOString(),        isMock: true },
  { wallet: '0x3b6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b3b7e0b', chain: 'Ethereum', riskLevel: 'Medium',   compliance: 'Flagged', timestamp: new Date(Date.now() - 86400000).toISOString(),        isMock: true },
  { wallet: '0x2a5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a2a6a9d', chain: 'BSC',      riskLevel: 'High',     compliance: 'Flagged', timestamp: new Date(Date.now() - 2*86400000).toISOString(),      isMock: true },
  { wallet: '0x6c9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b6c9f0f3c', chain: 'Arbitrum', riskLevel: 'Low',      compliance: 'Clear',   timestamp: new Date(Date.now() - 3*86400000).toISOString(),     isMock: true },
];

function getSearches(): SearchEntry[] {
  try {
    const real: SearchEntry[] = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    return [...real, ...MOCK_HISTORY].slice(0, 10);
  } catch { return MOCK_HISTORY; }
}

// ── Colour maps ───────────────────────────────────────────────────────────────
const CHAIN_C: Record<string, { bg: string; text: string }> = {
  Ethereum: { bg: '#EEF2FF', text: '#4F46E5' },
  Arbitrum: { bg: '#FEF3C7', text: '#92400E' },
  Polygon:  { bg: '#F0FDF4', text: '#166634' },
  Tron:     { bg: '#FFF7ED', text: '#C2410C' },
  BSC:      { bg: '#FEFCE8', text: '#A16207' },
};
const RISK_C: Record<string, { bg: string; text: string }> = {
  Critical: { bg: '#FEE2E2', text: '#B91C1C' },
  High:     { bg: '#FFEDD5', text: '#C2410C' },
  Medium:   { bg: '#FEF9C3', text: '#A16207' },
  Low:      { bg: '#DCFCE7', text: '#15803D' },
};
const COMP_C: Record<string, { bg: string; text: string }> = {
  Flagged: { bg: '#FFEDD5', text: '#C2410C' },
  Clear:   { bg: '#F3F4F6', text: '#6B7280' },
};

// ── MiniChip ──────────────────────────────────────────────────────────────────
function MiniChip({ label, colours }: { label: string | null; colours?: { bg: string; text: string } }) {
  if (!label) return null;
  const c = colours || { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <span
      className="px-[6px] py-[2px] text-[10px] font-semibold rounded-full whitespace-nowrap leading-[1.4]"
      style={{ background: c.bg, color: c.text }}
    >
      {label}
    </span>
  );
}

// ── NoMatchDropdown ───────────────────────────────────────────────────────────
function NoMatchDropdown({ light }: { light: boolean }) {
  return (
    <div
      className={cn(
        'absolute top-[calc(100%+8px)] left-0 right-0 z-[9999] overflow-hidden rounded-[20px]',
        'flex flex-col items-center gap-[8px] p-[20px_24px]',
        light
          ? 'bg-white border border-[#E4EAF0] shadow-[0_12px_40px_rgba(0,0,0,0.12)]'
          : 'bg-[#111827] border border-[rgba(255,255,255,0.10)] shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
      )}
      style={{ animation: 'sbSlide 0.18s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className={light ? 'text-[#D1D5DB]' : 'text-[rgba(255,255,255,0.18)]'}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M15 9L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <p className={cn('text-[13px] font-semibold m-0 text-center', light ? 'text-[#9CA3AF]' : 'text-[rgba(255,255,255,0.4)]')}>
        Enter a valid wallet address
      </p>
      <p className={cn('text-[12px] m-0 text-center', light ? 'text-[#B0B8C8]' : 'text-[rgba(255,255,255,0.25)]')}>
        Must start with <span className="font-mono">0x</span> followed by 40 hex characters
      </p>
    </div>
  );
}

// ── Dropdown ──────────────────────────────────────────────────────────────────
interface DropdownProps {
  searches: SearchEntry[];
  onSelect: (s: SearchEntry) => void;
  onClear: () => void;
  visible: boolean;
  light: boolean;
}

function Dropdown({ searches, onSelect, onClear, visible, light }: DropdownProps) {
  if (!visible || !searches.length) return null;

  return (
    <div
      className={cn(
        'absolute top-[calc(100%+8px)] left-0 right-0 z-[9999] overflow-hidden rounded-[20px]',
        light
          ? 'bg-white border border-[#E4EAF0] shadow-[0_12px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]'
          : 'bg-[#111827] border border-[rgba(255,255,255,0.10)] shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
      )}
      style={{ animation: 'sbSlide 0.18s cubic-bezier(0.16,1,0.3,1)' }}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-[20px] py-[14px]',
          light ? 'bg-[#F8F9FB] border-b border-[#ECEEF2]' : 'bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.07)]',
        )}
      >
        <div className="flex items-center gap-[8px]">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className={light ? 'text-[#B0B8C8]' : 'text-[rgba(255,255,255,0.35)]'}>
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className={cn('text-[11px] font-bold uppercase tracking-[0.1em]', light ? 'text-[#B0B8C8]' : 'text-[rgba(255,255,255,0.3)]')}>
            Recent Searches
          </span>
        </div>
        <button
          onMouseDown={e => { e.preventDefault(); onClear(); }}
          className={cn(
            'text-[12px] bg-transparent border-none cursor-pointer font-sans px-[8px] py-[3px] rounded-[6px] transition-all duration-150',
            light
              ? 'text-[#9CA3AF] hover:bg-[#F0F2F7] hover:text-[#374151]'
              : 'text-[rgba(255,255,255,0.35)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[rgba(255,255,255,0.7)]',
          )}
        >
          Clear all
        </button>
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto p-[8px]">
        {searches.map((s, i) => (
          <button
            key={i}
            onMouseDown={e => { e.preventDefault(); if (!s.isMock) onSelect(s); }}
            disabled={s.isMock}
            className={cn(
              'w-full flex items-center gap-[14px] px-[14px] py-[11px] rounded-[10px] mb-[2px]',
              'bg-transparent border-none text-left font-sans transition-[background,transform] duration-[120ms]',
              i < searches.length - 1 && (light ? 'border-b border-[#ECEEF2]' : 'border-b border-[rgba(255,255,255,0.07)]'),
              s.isMock
                ? 'cursor-not-allowed opacity-40'
                : cn(
                    'cursor-pointer',
                    light
                      ? 'hover:bg-[#F5F7FA] hover:translate-x-[2px]'
                      : 'hover:bg-[rgba(255,255,255,0.05)] hover:translate-x-[2px]',
                  ),
            )}
          >
            <div
              className="w-[8px] h-[8px] rounded-full shrink-0"
              style={{
                background: CHAIN_C[s.chain]?.text || '#9CA3AF',
                boxShadow: `0 0 6px ${CHAIN_C[s.chain]?.text || '#9CA3AF'}88`,
              }}
            />
            <code
              className={cn(
                'text-[14px] font-mono font-semibold shrink-0 min-w-[148px]',
                light ? 'text-[#1A1F35]' : 'text-[rgba(255,255,255,0.9)]',
              )}
            >
              {truncateAddress(s.wallet)}
            </code>
            <div className="flex items-center gap-[6px] flex-1">
              <MiniChip label={s.chain}      colours={CHAIN_C[s.chain]} />
              <MiniChip label={s.riskLevel}  colours={s.riskLevel ? RISK_C[s.riskLevel] : undefined} />
              <MiniChip label={s.compliance} colours={s.compliance ? COMP_C[s.compliance] : undefined} />
            </div>
            <span className={cn('text-[11px] shrink-0 whitespace-nowrap font-mono', light ? 'text-[#9CA3AF]' : 'text-[rgba(255,255,255,0.3)]')}>
              {timeAgo(s.timestamp)}
            </span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div
        className={cn(
          'px-[20px] py-[10px] text-center',
          light ? 'border-t border-[#ECEEF2] bg-[#F8F9FB]' : 'border-t border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]',
        )}
      >
        <span className={cn('text-[11px] italic', light ? 'text-[#9CA3AF]' : 'text-[rgba(255,255,255,0.2)]')}>
          * Historical searches shown for demo
        </span>
      </div>
    </div>
  );
}

// ── SearchBar ─────────────────────────────────────────────────────────────────
interface SearchBarProps {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  variant?: 'nav' | 'light';
  initialValue?: string;
  compact?: boolean;
  pill?: boolean;
}

export default function SearchBar({
  onSearch, onClear, onValueChange,
  placeholder = 'Search wallet addresses...',
  variant = 'nav', initialValue = '', compact = false, pill = false,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { setValue(initialValue); }, [initialValue]);

  const [focused, setFocused] = useState(false);
  const [searches, setSearches] = useState<SearchEntry[]>(getSearches);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  const light = variant === 'light';

  useEffect(() => { if (focused) setSearches(getSearches()); }, [focused]);

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const h = (e: KeyboardEvent) => {
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const submit = useCallback((val?: string) => {
    const q = (val ?? value).trim();
    if (!q) return;
    try {
      const prev: SearchEntry[] = JSON.parse(localStorage.getItem('recentSearches') || '[]').filter((h: SearchEntry) => h.wallet !== q);
      localStorage.setItem('recentSearches', JSON.stringify([
        { wallet: q, chain: 'Ethereum', riskLevel: null, compliance: null, timestamp: new Date().toISOString(), isMock: false },
        ...prev,
      ].slice(0, 5)));
    } catch { /* ignore */ }
    onSearch?.(q);
    setValue('');
    setFocused(false);
    inputRef.current?.blur();
  }, [value, onSearch]);

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
  const trimmed     = value.trim();
  const showDrop    = focused && !trimmed;
  const showNoMatch = focused && trimmed.length > 2 && !trimmed.toLowerCase().startsWith('0x');

  return (
    <>
      <style>{`
        @keyframes sbSlide { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }
        .sb-input::placeholder { color: rgba(255,255,255,0.25); }
        .sb-input-light::placeholder { color: #B0B8C8; font-size: 13px; }
      `}</style>

      <div ref={wrapRef} className="relative flex-1 h-full box-border">
        {/* Container pill */}
        <div
          className={cn(
            'flex items-center gap-[10px] h-full box-border cursor-text',
            'transition-all duration-200',
            light
              ? cn(
                  'rounded-[10px] bg-white',
                  pill ? 'rounded-full border-none shadow-none' : cn(
                    'border',
                    focused
                      ? 'border-[#2563EB] shadow-[0_0_0_3px_rgba(37,99,235,0.12),0_1px_3px_rgba(0,0,0,0.08)]'
                      : 'border-[#D1D5DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#B8BCC6] hover:shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
                  ),
                )
              : cn(
                  'rounded-full px-[14px]',
                  focused
                    ? 'bg-[rgba(0,0,0,0.50)] border border-[rgba(255,255,255,0.35)]'
                    : 'bg-[rgba(0,0,0,0.55)] border border-[rgba(255,255,255,0.18)] hover:bg-[rgba(0,0,0,0.65)] hover:border-[rgba(255,255,255,0.25)]',
                ),
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Wallet icon */}
          <svg
            width="24" height="24" viewBox="0 0 24 24" fill="none"
            className={cn(
              'shrink-0 transition-colors duration-200',
              light
                ? focused ? 'text-[#2563EB]' : 'text-[#9CA3AF]'
                : focused ? 'text-[#C6FF00]' : 'text-[rgba(255,255,255,0.5)]',
            )}
          >
            <path d="M3 6.75C3 5.505 4.005 4.5 5.25 4.5H18.75C19.995 4.5 21 5.505 21 6.75V17.25C21 18.495 19.995 19.5 18.75 19.5H5.25C4.005 19.5 3 18.495 3 17.25V6.75Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M15.75 13.5C15.75 12.257 16.757 11.25 18 11.25H21V15.75H18C16.757 15.75 15.75 14.743 15.75 13.5Z" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="18" cy="13.5" r="1.1" fill="currentColor"/>
            <path d="M3 9.75H21" stroke="currentColor" strokeWidth="1.5"/>
          </svg>

          <input
            ref={inputRef}
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setValue(e.target.value); onValueChange?.(e.target.value); }}
            onFocus={() => setFocused(true)}
            onKeyDown={e => {
              if (e.key === 'Enter') submit();
              if (e.key === 'Escape') { inputRef.current?.blur(); setFocused(false); }
            }}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            placeholder={placeholder}
            className={cn(
              'flex-1 h-full bg-transparent border-none outline-none min-w-0',
              'font-mono tracking-[0.02em]',
              light
                ? cn('sb-input-light text-[#1A1F35]', compact ? 'text-[11px]' : 'text-[13px]')
                : 'sb-input text-[rgba(255,255,255,0.9)] text-[14px] font-semibold tracking-[0.06em]',
            )}
          />

          {/* Keyboard shortcut hint */}
          {!focused && !value && (
            <span
              className={cn(
                'text-[11px] font-mono px-[6px] py-[3px] rounded-[5px] whitespace-nowrap shrink-0',
                light
                  ? 'text-[#9CA3AF] bg-[#F3F4F6] border border-[#E5E7EB]'
                  : 'text-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.10)]',
              )}
            >
              {isMac ? '⌘K' : 'Ctrl+K'}
            </span>
          )}

          {/* Paste button */}
          {!value && (
            <button
              onMouseDown={e => {
                e.preventDefault();
                navigator.clipboard.readText().then(text => {
                  const clean = text.trim();
                  if (clean) { setValue(clean); inputRef.current?.focus(); }
                }).catch(() => {});
              }}
              title="Paste from clipboard"
              className={cn(
                'inline-flex items-center justify-center gap-[4px] shrink-0 px-[8px] py-[3px] rounded-[6px]',
                'text-[11px] font-mono cursor-pointer border transition-all duration-150',
                light
                  ? 'bg-[#F5F7FA] border-[#E5E7EB] text-[#9CA3AF] hover:bg-[#EEF2FF] hover:border-[#C7D2FE] hover:text-[#4F46E5]'
                  : 'bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.10)] text-[rgba(255,255,255,0.35)] hover:bg-[rgba(198,255,0,0.08)] hover:border-[rgba(198,255,0,0.3)] hover:text-[#C6FF00]',
              )}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <rect x="4" y="1" width="7" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="1" y="3" width="7" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
              </svg>
              paste
            </button>
          )}

          {/* Clear button */}
          {value && (
            <button
              onMouseDown={e => { e.preventDefault(); setValue(''); onValueChange?.(''); onClear ? onClear() : inputRef.current?.focus(); }}
              className={cn(
                'inline-flex items-center justify-center w-[22px] h-[22px] rounded-full shrink-0',
                'border-none cursor-pointer transition-all duration-150',
                light
                  ? 'bg-[#E5E7EB] text-[#6B7280] hover:bg-[#D1D9E0] hover:text-[#374151]'
                  : 'bg-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.2)] hover:text-white',
              )}
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        <Dropdown
          searches={searches}
          onSelect={s => submit(s.wallet)}
          onClear={() => { localStorage.removeItem('recentSearches'); setSearches(getSearches()); }}
          visible={showDrop}
          light={light}
        />
        {showNoMatch && <NoMatchDropdown light={light} />}
      </div>
    </>
  );
}
