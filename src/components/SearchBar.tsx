import { useState, useEffect, useRef, useCallback } from 'react';
import type { CSSProperties, ChangeEvent } from 'react';
import { SEARCHBAR, CHIP, TRANSITIONS } from '@/tokens/designTokens';

// ── Token helpers ─────────────────────────────────────────────────────────────
type SearchBarNavToken = {
  padding: string; borderRadius: number | string; fontSize: number;
  fontWeight: number; letterSpacing: string; brandColor: string;
  active: { bg: string; border: string; shadow: string; iconColor: string; textColor: string };
  resting: { bg: string; border: string; shadow: string; iconColor: string; textColor: string };
  shortcutHint: { fontSize: number; color: string; bg: string; border: string; padding: string; borderRadius: number };
  dropdownDark: { bg: string; border: string; headerBg: string; headerBorder: string; footerBg: string; shadow: string; rowHover: string };
};
type SearchBarLightToken = {
  borderRadius: number | string;
  resting:  { bg: string; border: string; shadow: string; iconColor: string };
  hover:    { bg: string; border: string; shadow: string; iconColor: string };
  focus:    { bg?: string; border: string; shadow: string; iconColor: string };
  textColor: string; accentColor: string; inputFontSize: number;
  shortcutHint: { color: string; bg: string; border: string };
  pasteBtn: { bg: string; border: string; color: string; hover: { bg: string; border: string; color: string } };
};
type TransitionsToken = { standard: string; fast: string };
type ChipToken = {
  colors: { red: { bg: string; text: string }; grey: { bg: string; text: string } };
  size: { xs: { padding: string; fontSize: number } };
  fontWeight: number; borderRadius: number;
};

const SB  = SEARCHBAR as unknown as SearchBarNavToken & { light: SearchBarLightToken };
const TR  = TRANSITIONS as unknown as TransitionsToken;
const CH  = CHIP as unknown as ChipToken;

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
  Critical: CH.colors.red,
  High:     { bg: '#FFEDD5', text: '#C2410C' },
  Medium:   { bg: '#FEF9C3', text: '#A16207' },
  Low:      { bg: '#DCFCE7', text: '#15803D' },
};
const COMP_C: Record<string, { bg: string; text: string }> = {
  Flagged: { bg: '#FFEDD5', text: '#C2410C' },
  Clear:   CH.colors.grey,
};

// ── MiniChip ──────────────────────────────────────────────────────────────────
function MiniChip({ label, colours }: { label: string | null; colours?: { bg: string; text: string } }) {
  if (!label) return null;
  const c = colours || CH.colors.grey;
  return (
    <span style={{
      padding: CH.size.xs.padding, fontSize: CH.size.xs.fontSize,
      fontWeight: CH.fontWeight, borderRadius: CH.borderRadius,
      background: c.bg, color: c.text, whiteSpace: 'nowrap', lineHeight: 1.4,
    }}>{label}</span>
  );
}

// ── NoMatchDropdown ───────────────────────────────────────────────────────────
function NoMatchDropdown({ light }: { light: boolean }) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
      background: light ? '#FFFFFF' : SB.dropdownDark.bg,
      border: light ? '1px solid #E4EAF0' : SB.dropdownDark.border,
      borderRadius: 20,
      boxShadow: light ? '0 12px 40px rgba(0,0,0,0.12)' : SB.dropdownDark.shadow,
      zIndex: 9999, overflow: 'hidden',
      animation: 'sbSlide 0.18s cubic-bezier(0.16,1,0.3,1)',
      padding: '20px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: light ? '#D1D5DB' : 'rgba(255,255,255,0.18)' }}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M15 9L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <p style={{ fontSize: 13, fontWeight: 600, color: light ? '#9CA3AF' : 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center' }}>
        Enter a valid wallet address
      </p>
      <p style={{ fontSize: 12, color: light ? '#B0B8C8' : 'rgba(255,255,255,0.25)', margin: 0, textAlign: 'center' }}>
        Must start with <span style={{ fontFamily: 'monospace' }}>0x</span> followed by 40 hex characters
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
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
      background: light ? '#FFFFFF' : SB.dropdownDark.bg,
      border: light ? '1px solid #E4EAF0' : SB.dropdownDark.border,
      borderRadius: 20,
      boxShadow: light ? '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' : SB.dropdownDark.shadow,
      zIndex: 9999, overflow: 'hidden',
      animation: 'sbSlide 0.18s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 12px',
        background: light ? '#F8F9FB' : SB.dropdownDark.headerBg,
        borderBottom: light ? '1px solid #ECEEF2' : SB.dropdownDark.headerBorder,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ color: light ? '#B0B8C8' : 'rgba(255,255,255,0.35)' }}>
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 3.5V6l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: light ? '#B0B8C8' : 'rgba(255,255,255,0.3)' }}>
            Recent Searches
          </span>
        </div>
        <button
          onMouseDown={e => { e.preventDefault(); onClear(); }}
          style={{ fontSize: 12, color: light ? '#9CA3AF' : 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '3px 8px', borderRadius: 6, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = light ? '#F0F2F7' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = light ? '#374151' : 'rgba(255,255,255,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = light ? '#9CA3AF' : 'rgba(255,255,255,0.35)'; }}
        >
          Clear all
        </button>
      </div>

      <div style={{ maxHeight: 420, overflowY: 'auto', padding: '8px' }}>
        {searches.map((s, i) => (
          <button
            key={i}
            onMouseDown={e => { e.preventDefault(); if (!s.isMock) onSelect(s); }}
            disabled={s.isMock}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '11px 14px',
              background: 'none', border: 'none', borderRadius: 10,
              cursor: s.isMock ? 'not-allowed' : 'pointer',
              opacity: s.isMock ? 0.4 : 1,
              transition: 'all 0.12s', textAlign: 'left', fontFamily: 'inherit',
              marginBottom: 2,
            }}
            onMouseEnter={e => { if (!s.isMock) { e.currentTarget.style.background = light ? '#F5F7FA' : SB.dropdownDark.rowHover; e.currentTarget.style.transform = 'translateX(2px)'; }}}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'translateX(0)'; }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: CHAIN_C[s.chain]?.text || '#9CA3AF',
              boxShadow: `0 0 6px ${CHAIN_C[s.chain]?.text || '#9CA3AF'}88`,
            }} />
            <code style={{
              fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
              color: light ? '#1A1F35' : 'rgba(255,255,255,0.9)', fontWeight: 600, flexShrink: 0, minWidth: 148,
            }}>
              {truncateAddress(s.wallet)}
            </code>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
              <MiniChip label={s.chain}      colours={CHAIN_C[s.chain]} />
              <MiniChip label={s.riskLevel}  colours={s.riskLevel ? RISK_C[s.riskLevel] : undefined} />
              <MiniChip label={s.compliance} colours={s.compliance ? COMP_C[s.compliance] : undefined} />
            </div>
            <span style={{
              fontSize: 11, color: light ? '#9CA3AF' : 'rgba(255,255,255,0.3)', flexShrink: 0, whiteSpace: 'nowrap',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {timeAgo(s.timestamp)}
            </span>
          </button>
        ))}
      </div>

      <div style={{
        padding: '10px 20px',
        borderTop: light ? '1px solid #ECEEF2' : SB.dropdownDark.headerBorder,
        background: light ? '#F8F9FB' : SB.dropdownDark.footerBg,
        textAlign: 'center',
      }}>
        <span style={{ fontSize: 11, color: light ? '#9CA3AF' : 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
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

export default function SearchBar({ onSearch, onClear, onValueChange, placeholder = 'Search wallet addresses...', variant = 'nav', initialValue = '', compact = false, pill = false }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { setValue(initialValue); }, [initialValue]);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [searches, setSearches] = useState<SearchEntry[]>(getSearches);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  const light = variant === 'light';
  const SBL = SB.light;

  useEffect(() => { if (focused) setSearches(getSearches()); }, [focused]);

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const h = (e: KeyboardEvent) => { if ((isMac ? e.metaKey : e.ctrlKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); }};
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const submit = useCallback((val?: string) => {
    const q = (val ?? value).trim();
    if (!q) return;
    try {
      const prev: SearchEntry[] = JSON.parse(localStorage.getItem('recentSearches') || '[]').filter((h: SearchEntry) => h.wallet !== q);
      localStorage.setItem('recentSearches', JSON.stringify([{ wallet: q, chain: 'Ethereum', riskLevel: null, compliance: null, timestamp: new Date().toISOString(), isMock: false }, ...prev].slice(0, 5)));
    } catch { /* ignore */ }
    onSearch?.(q);
    setValue(''); setFocused(false); inputRef.current?.blur();
  }, [value, onSearch]);

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
  const trimmed = value.trim();
  const showDrop = focused && !trimmed;
  const showNoMatch = focused && trimmed.length > 2 && !trimmed.toLowerCase().startsWith('0x');

  const navStyle: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: SB.padding, borderRadius: SB.borderRadius,
    background: focused ? SB.active.bg : hovered ? 'rgba(0,0,0,0.65)' : SB.resting.bg,
    border: focused ? SB.active.border : hovered ? '1px solid rgba(255,255,255,0.25)' : SB.resting.border,
    boxShadow: focused ? SB.active.shadow : SB.resting.shadow,
    transition: `all ${TR.standard}`, cursor: 'text',
  };

  const lightStyle: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: SB.padding, borderRadius: pill ? 9999 : SBL.borderRadius,
    background: hovered && !focused ? SBL.hover.bg : SBL.resting.bg,
    border:     pill ? 'none' : focused ? SBL.focus.border : hovered ? SBL.hover.border : SBL.resting.border,
    boxShadow:  pill ? 'none' : focused ? SBL.focus.shadow : hovered ? SBL.hover.shadow : SBL.resting.shadow,
    transition: `all ${TR.standard}`, cursor: 'text',
  };

  const containerStyle = light ? lightStyle : navStyle;

  return (
    <>
      <style>{`@keyframes sbSlide{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}.sb-input::placeholder{color:rgba(255,255,255,0.25);}.sb-input-light::placeholder{color:#B0B8C8;font-size:13px;letter-spacing:normal;}`}</style>
      <div ref={wrapRef} style={{ position: 'relative', flex: 1, height: '100%', boxSizing: 'border-box' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ ...containerStyle, height: '100%', boxSizing: 'border-box' }} onClick={() => inputRef.current?.focus()}>
          {/* Wallet icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, minWidth: 24, minHeight: 24, color: light ? (focused ? SBL.focus.iconColor : hovered ? SBL.hover.iconColor : SBL.resting.iconColor) : (focused ? SB.active.iconColor : SB.resting.iconColor), transition: `color ${TR.standard}` }}>
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
            onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { inputRef.current?.blur(); setFocused(false); }}}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            placeholder={placeholder}
            className={light ? 'sb-input-light' : 'sb-input'}
            style={{ flex: 1, height: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: light ? (compact ? SBL.inputFontSize - 2 : SBL.inputFontSize) : SB.fontSize, fontWeight: SB.fontWeight, letterSpacing: SB.letterSpacing, color: light ? SBL.textColor : (focused ? SB.active.textColor : SB.resting.textColor), caretColor: light ? SBL.accentColor : SB.brandColor, fontFamily: "'JetBrains Mono', monospace", minWidth: 0 }}
          />

          {!focused && !value && (
            <span style={{
              fontSize: SB.shortcutHint.fontSize,
              color:       light ? SBL.shortcutHint.color  : SB.shortcutHint.color,
              background:  light ? SBL.shortcutHint.bg     : SB.shortcutHint.bg,
              border:      light ? SBL.shortcutHint.border : SB.shortcutHint.border,
              padding: SB.shortcutHint.padding,
              borderRadius: SB.shortcutHint.borderRadius,
              fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {isMac ? '⌘K' : 'Ctrl+K'}
            </span>
          )}

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
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 4, flexShrink: 0,
                padding: '3px 8px', borderRadius: 6,
                background: light ? SBL.pasteBtn.bg    : 'rgba(255,255,255,0.06)',
                border:     light ? `1px solid ${SBL.pasteBtn.border}` : '1px solid rgba(255,255,255,0.10)',
                color:      light ? SBL.pasteBtn.color : 'rgba(255,255,255,0.35)',
                fontSize: 11, fontFamily: 'monospace',
                cursor: 'pointer', transition: `all ${TR.fast}`,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (light) {
                  e.currentTarget.style.background   = SBL.pasteBtn.hover.bg;
                  e.currentTarget.style.borderColor  = SBL.pasteBtn.hover.border;
                  e.currentTarget.style.color        = SBL.pasteBtn.hover.color;
                } else {
                  e.currentTarget.style.background = 'rgba(198,255,0,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(198,255,0,0.3)';
                  e.currentTarget.style.color = '#C6FF00';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = light ? SBL.pasteBtn.bg     : 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = light ? SBL.pasteBtn.border : 'rgba(255,255,255,0.10)';
                e.currentTarget.style.color       = light ? SBL.pasteBtn.color  : 'rgba(255,255,255,0.35)';
              }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <rect x="4" y="1" width="7" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="1" y="3" width="7" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
              </svg>
              paste
            </button>
          )}

          {value && (
            <button
              onMouseDown={e => { e.preventDefault(); setValue(''); onValueChange?.(''); onClear ? onClear() : inputRef.current?.focus(); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: light ? '#E5E7EB' : 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', flexShrink: 0, color: light ? '#6B7280' : 'rgba(255,255,255,0.6)', transition: `all ${TR.fast}` }}
              onMouseEnter={e => { e.currentTarget.style.background = light ? '#D1D9E0' : 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = light ? '#374151' : '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = light ? '#E5E7EB' : 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = light ? '#6B7280' : 'rgba(255,255,255,0.6)'; }}
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
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
