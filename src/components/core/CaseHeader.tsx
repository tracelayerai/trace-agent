import { useState } from 'react';
import type { CSSProperties, ElementType, ReactNode } from 'react';
import { SURFACE, CHIP, COLORS, TYPOGRAPHY, RADIUS } from '@/tokens/designTokens';
import { StatusChip } from './StatusChip';
import { ArrowLeft, Copy, Check, User, Pencil } from 'lucide-react';

const T = {
  darkTxt:  '#1A1F35',
  bodyTxt:  '#4A5568',
  lightTxt: '#717A8C',
  border:   COLORS.bg.lighter,    // #E5E7EB
  borderMd: COLORS.border.light,  // #D1D5DB
};

// ── Token helpers ─────────────────────────────────────────────────────────────
type SurfaceHeader = {
  bg: string; padding: string; paddingX: number; paddingY: number;
  paddingBottom: string; paddingTitleOnly: string;
  borderBottom: string; borderRadius: string; shadow: string;
  statusBox: { bg: string; borderTop: string; borderBottom: string; borderRadius: string; padding: string; marginTop: number; gap: number; fontSize: number };
  tabStrip: { marginTop: number; tabPaddingX: number; tabPaddingY: number; fontSize: number;
    default: { color: string; bg?: string; fontWeight: number };
    hover: { color?: string; bg?: string; transform?: string; fontWeight?: number };
    press: { color?: string; bg?: string; fontWeight?: number; borderRadius?: number };
    active: { color: string; indicator: string; fontWeight: number };
  };
  breadcrumbStrip: { bg: string; borderBottom: string; marginBottom: number; paddingY: number; fontSize: number; fontWeight: number; color: string; hoverColor: string };
  pageHeading: CSSProperties;
  pageHeadingSm: CSSProperties;
};
type SurfaceMenuItem = {
  gap: number; padding: string; borderRadius: number; marginBottom: number;
  fontSize: number; transition: string;
  default: { bg: string; color: string; fontWeight: number };
  hover: { bg: string; transform?: string };
  press: { bg: string; color: string; fontWeight: number };
  danger: { default: { color: string }; press: { bg: string } };
};
type ColorsToken = {
  text: { white: string };
  button: { secondary: { bgRest: string; bgHover: string; bgPress: string; borderRest: string; borderHover: string; borderPress: string; shadowRest: string; shadowHover: string; shadowPress: string }; ghost: { bgHover: string; bgPress: string; bgActive: string } };
  icon: { rest: string; hover: string; press: string };
  bg: { white: string };
  border: { light: string };
};

const SH  = SURFACE.header as unknown as SurfaceHeader;
const SMI = SURFACE.menuItem as unknown as SurfaceMenuItem;
const C   = COLORS as unknown as ColorsToken;

// ── Ghost icon token ──────────────────────────────────────────────────────────
export const GHOST_SIZE: Record<string, { px: number; dim: number }> = {
  xs: { px: 14, dim: 24 },
  sm: { px: 16, dim: 32 },
  md: { px: 18, dim: 38 },
  lg: { px: 20, dim: 44 },
};

// ── Btn ───────────────────────────────────────────────────────────────────────
interface BtnStyle {
  bg: string; color: string; iconColor: string;
  border: string; shadow: string;
  fontWeight?: number; height?: number;
  padding?: string; borderRadius?: number | string;
}

type BtnVariant = 'primary' | 'dark' | 'outline' | 'danger' | 'secondary' | 'ghost' | 'segment' | 'chip';
type BtnSize = 'sm' | 'md' | 'lg';

interface BtnProps {
  children?: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  disabled?: boolean;
  icon?: ElementType;
  onClick?: () => void;
  active?: boolean;
  style?: CSSProperties;
}

export function Btn({ children, variant = 'primary', size = 'md', disabled, icon: Icon, onClick, active, style: extraStyle }: BtnProps) {
  const [hov, setHov] = useState(false);
  const [act, setAct] = useState(false);

  const isIconOnly = Icon && !children;
  const isGhostIcon = variant === 'ghost' && isIconOnly;

  const padMap: Record<BtnSize, string> = { sm: '0 18px', md: '0 28px', lg: '0 36px' };
  const hMap:   Record<BtnSize, number> = { sm: 32,      md: 40,       lg: 46 };
  const fzMap:  Record<BtnSize, number> = { sm: 12,      md: 13,       lg: 14 };
  const iconSzMap: Record<BtnSize, number> = { sm: 13, md: 15, lg: 17 };

  const pad    = padMap[size] ?? '0 28px';
  const h      = hMap[size]   ?? 40;
  const fz     = fzMap[size]  ?? 13;
  const iconSz = isGhostIcon ? (GHOST_SIZE[size]?.px ?? GHOST_SIZE.md.px) : (iconSzMap[size] ?? 15);
  const btnDim = isGhostIcon ? (GHOST_SIZE[size]?.dim ?? GHOST_SIZE.md.dim) : h;
  const isDisabled = !!disabled;

  const S: BtnStyle = (() => {
    if (disabled) return { bg: '#9CA3AF', color: '#D1D5DB', iconColor: '#D1D5DB', border: 'none', shadow: 'none' };
    switch (variant) {
      case 'dark': return {
        bg:        act ? '#152244' : hov ? '#111F3E' : '#1B2D58',
        color:     C.text.white, iconColor: C.text.white,
        border:    `1px solid ${act ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)'}`,
        shadow:    act ? '0 1px 2px rgba(0,0,0,0.18)' : hov ? '0 2px 8px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.12)',
      };
      case 'primary': return {
        bg:        act ? '#000000' : hov ? '#1A1A1A' : '#0D0D0D',
        color:     '#C6FF00',
        iconColor: '#C6FF00',
        border:    `1px solid ${act ? 'rgba(198,255,0,0.30)' : hov ? 'rgba(198,255,0,0.40)' : 'rgba(198,255,0,0.22)'}`,
        shadow:    act ? '0 1px 2px rgba(0,0,0,0.4)' : hov ? '0 2px 12px rgba(198,255,0,0.14), 0 2px 8px rgba(0,0,0,0.35)' : '0 1px 4px rgba(0,0,0,0.25)',
        fontWeight: 600,
      };
      case 'outline': return {
        bg:     act ? C.button.secondary.bgPress  : hov ? C.button.secondary.bgHover  : C.button.secondary.bgRest,
        color:  T.darkTxt, iconColor: T.darkTxt,
        border: `1px solid ${act ? C.button.secondary.borderPress : hov ? C.button.secondary.borderHover : C.button.secondary.borderRest}`,
        shadow: act ? C.button.secondary.shadowPress : hov ? C.button.secondary.shadowHover : C.button.secondary.shadowRest,
      };
      case 'danger': return {
        bg:     act ? '#FEE2E2' : hov ? '#FEF2F2' : C.button.secondary.bgRest,
        color:  '#DC2626', iconColor: '#DC2626',
        border: `1px solid ${act ? '#DC2626' : hov ? '#FCA5A5' : '#FECACA'}`,
        shadow: act ? '0 0 0 3px rgba(239,68,68,0.12), 0 1px 4px rgba(0,0,0,0.05)' : hov ? C.button.secondary.shadowHover : C.button.secondary.shadowRest,
      };
      case 'secondary': return {
        bg:     act ? '#FEF3C7' : hov ? '#FFFBEB' : C.button.secondary.bgRest,
        color:  '#D97706', iconColor: '#D97706',
        border: `1px solid ${act ? '#D97706' : hov ? '#FCD34D' : '#FDE68A'}`,
        shadow: act ? '0 0 0 3px rgba(245,158,11,0.12), 0 1px 4px rgba(0,0,0,0.05)' : hov ? C.button.secondary.shadowHover : C.button.secondary.shadowRest,
      };
      case 'ghost': return {
        bg:        act ? C.button.ghost.bgPress : active ? C.button.ghost.bgActive : hov ? C.button.ghost.bgHover : 'transparent',
        color:     act ? C.icon.press : hov ? C.icon.hover : C.icon.rest,
        iconColor: act ? C.icon.press : hov ? C.icon.hover : C.icon.rest,
        border: 'none', shadow: 'none',
      };
      case 'segment': return active ? {
        bg: '#1B2D58', color: C.text.white, iconColor: C.text.white,
        border: '1px solid rgba(255,255,255,0.10)', shadow: '0 1px 3px rgba(0,0,0,0.12)',
      } : {
        bg:        act ? C.button.ghost.bgPress : hov ? C.button.ghost.bgHover : 'transparent',
        color:     T.bodyTxt, iconColor: T.bodyTxt, border: 'none', shadow: 'none',
      };
      case 'chip': return active ? {
        bg: '#2D3142', color: C.text.white, iconColor: C.text.white,
        border: '1px solid #2D3142', shadow: 'none', borderRadius: 20, padding: '4px 12px',
      } : {
        bg:     act ? '#E5E7EB' : hov ? '#F3F4F6' : '#F0F1F4',
        color:  T.bodyTxt, iconColor: T.lightTxt,
        border: `1px solid ${act ? '#9CA3AF' : '#E5E7EB'}`,
        shadow: 'none', borderRadius: 20, padding: '4px 12px',
      };
      default: return { bg: '#2D3142', color: C.text.white, iconColor: C.text.white, border: 'none', shadow: '0 1px 3px rgba(0,0,0,0.18)' };
    }
  })();

  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={() => !isDisabled && setHov(true)}
      onMouseLeave={() => { setHov(false); setAct(false); }}
      onMouseDown={() => !isDisabled && setAct(true)}
      onMouseUp={() => setAct(false)}
      style={{
        background: S.bg, color: S.color, border: S.border, boxShadow: S.shadow,
        opacity: isDisabled ? 0.6 : 1,
        padding: S.padding ?? (isIconOnly ? 0 : pad), fontSize: fz, fontWeight: S.fontWeight ?? 500,
        height: S.height ?? btnDim,
        width: isIconOnly ? btnDim : undefined,
        borderRadius: S.borderRadius ?? RADIUS.md, cursor: isDisabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: isIconOnly ? 'center' : 'flex-start', gap: 6,
        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
        outline: 'none', fontFamily: 'inherit', lineHeight: 1, whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...extraStyle,
      }}
    >
      {Icon && <span style={{ color: S.iconColor, display: 'inline-flex', flexShrink: 0 }}><Icon size={iconSz} /></span>}
      {children}
    </button>
  );
}

// ── GhostIcon ─────────────────────────────────────────────────────────────────
interface GhostIconProps {
  icon?: ElementType;
  size?: string;
  color?: string;
  onClick?: () => void;
  alwaysVisible?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export function GhostIcon({ icon: Icon, size = 'md', color: restColor = '#717A8C', onClick, alwaysVisible = true, disabled = false, children }: GhostIconProps) {
  const [hov, setHov] = useState(false);
  const [act, setAct] = useState(false);
  const { px, dim } = GHOST_SIZE[size] || GHOST_SIZE.md;
  const iconColor = disabled ? '#C4C9D4' : act ? C.icon.press : hov ? C.icon.hover : restColor;
  const bg        = disabled ? 'transparent' : act ? C.button.ghost.bgPress : hov ? C.button.ghost.bgHover : 'transparent';
  const opacity   = disabled ? 0.45 : act ? 1.0 : (alwaysVisible ? 0.8 : (hov ? 1.0 : 0));

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => { if (!disabled) setHov(true); }}
      onMouseLeave={() => { setHov(false); setAct(false); }}
      onMouseDown={() => { if (!disabled) setAct(true); }}
      onMouseUp={() => setAct(false)}
      style={{
        background: bg, border: 'none', outline: 'none', padding: 0,
        width: dim, height: dim, flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: 6,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        color: iconColor, opacity,
        transition: 'background 0.12s, color 0.15s, opacity 0.2s',
        fontSize: 11, fontFamily: 'inherit', whiteSpace: 'nowrap',
      }}
    >
      {Icon && <Icon size={px} />}
      {children}
    </button>
  );
}

// ── CopyBtn ───────────────────────────────────────────────────────────────────
export function CopyBtn({ text, size = 'md' }: { text: string; size?: string }) {
  const [state, setState] = useState<'rest' | 'flash' | 'copied'>('rest');
  const doClick = () => {
    navigator.clipboard?.writeText(text);
    setState('flash');
    setTimeout(() => setState('copied'), 100);
    setTimeout(() => setState('rest'), 2100);
  };
  const overrideColor = state === 'flash' ? '#C6FF00' : state === 'copied' ? '#10B981' : undefined;
  return (
    <GhostIcon icon={state === 'copied' ? Check : Copy} size={size} color={overrideColor || '#717A8C'} onClick={doClick} alwaysVisible>
      {state === 'copied' && 'Copied'}
    </GhostIcon>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ children, bg, color }: { children: ReactNode; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      background: bg, color,
    }}>
      {children}
    </span>
  );
}

// ── Chain metadata ────────────────────────────────────────────────────────────
interface ChainMeta {
  accent: string; background: string; iconBg: string; symbol: string; name: string;
}

const CHAIN_META: Record<string, ChainMeta> = {
  ethereum: { accent: '#627EEA', background: '#EEF1FD', iconBg: '#627EEA', symbol: 'Ξ',  name: 'Ethereum'  },
  bitcoin:  { accent: '#F7931A', background: '#FFF5E6', iconBg: '#F7931A', symbol: '₿',  name: 'Bitcoin'   },
  solana:   { accent: '#05C07A', background: '#E6FBF3', iconBg: '#05C07A', symbol: '◆',  name: 'Solana'    },
  polygon:  { accent: '#8247E5', background: '#F2EAFF', iconBg: '#8247E5', symbol: '⬟',  name: 'Polygon'   },
  arbitrum: { accent: '#28A0F0', background: '#E6F5FF', iconBg: '#28A0F0', symbol: '▶',  name: 'Arbitrum'  },
  optimism: { accent: '#FF0420', background: '#FFE8EB', iconBg: '#FF0420', symbol: '⭕', name: 'Optimism'  },
  base:     { accent: '#0052FF', background: '#E6EEFF', iconBg: '#0052FF', symbol: '⬜', name: 'Base'      },
  avalanche:{ accent: '#E84142', background: '#FFE8E8', iconBg: '#E84142', symbol: '▲',  name: 'Avalanche' },
  tron:     { accent: '#FF060A', background: '#FFE6E6', iconBg: '#FF060A', symbol: 'T',  name: 'Tron'      },
  litecoin: { accent: '#A6A9AA', background: '#F2F2F2', iconBg: '#A6A9AA', symbol: 'Ł',  name: 'Litecoin'  },
};

// ── Tag ───────────────────────────────────────────────────────────────────────
interface TagSize {
  iconDim: number; borderRadius: number; fontSize: number;
  paddingChain: string; paddingPlain: string; iconFontSize: number;
}

export function Tag({ children, chain, size = 'md' }: { children?: ReactNode; chain?: string; size?: string }) {
  const meta = chain ? CHAIN_META[chain.toLowerCase()] : null;
  const chipTag = (CHIP as unknown as { tag: Record<string, TagSize> }).tag;
  const s = chipTag[size] ?? chipTag['md'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      gap: meta ? s.iconDim * 0.35 : 0,
      padding: meta ? s.paddingChain : s.paddingPlain,
      borderRadius: s.borderRadius, fontSize: s.fontSize, fontWeight: 500,
      border: `1px solid ${meta ? meta.accent + '50' : '#E5E7EB'}`,
      color: meta ? meta.accent : '#4A5568',
      background: meta ? meta.background : '#F0F1F4',
    }}>
      {meta && (
        <span style={{
          width: s.iconDim, height: s.iconDim, borderRadius: '50%',
          background: meta.iconBg,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: s.iconFontSize, fontWeight: 700, color: C.text.white, flexShrink: 0, lineHeight: 1,
        }}>
          {meta.symbol}
        </span>
      )}
      {children || (meta ? meta.name : null)}
    </span>
  );
}

// ── ActionLink ────────────────────────────────────────────────────────────────
export function ActionLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  const [act, setAct] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setAct(false); }}
      onMouseDown={() => setAct(true)}
      onMouseUp={() => setAct(false)}
      style={{
        background: 'none', border: 'none', outline: 'none', padding: 0,
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
        color: hov || act ? '#0F5A9F' : '#3B82F6',
        textDecoration: hov || act ? 'underline' : 'none',
        textDecorationThickness: '1px', textUnderlineOffset: '4px',
        opacity: act ? 0.9 : 1,
        transition: 'color 0.2s, opacity 0.2s',
      }}
    >
      {children}
    </button>
  );
}

// ── MoreMenuItem ──────────────────────────────────────────────────────────────
interface MoreMenuItemConfig {
  label: string;
  icon?: ElementType;
  color?: string;
  onClick?: () => void;
}

function MoreMenuItem({ item, onClose }: { item: MoreMenuItemConfig; onClose?: () => void }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  const MI = SMI;
  const isDanger = !!item.color;

  const bg = pressed
    ? (isDanger ? MI.danger.press.bg : MI.press.bg)
    : hov ? MI.hover.bg : MI.default.bg;
  const color  = isDanger ? MI.danger.default.color : pressed ? MI.press.color : MI.default.color;
  const weight = pressed ? MI.press.fontWeight : MI.default.fontWeight;
  const shift  = hov && !pressed ? (MI.hover.transform ?? 'translateX(0)') : 'translateX(0)';

  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={e => { e.preventDefault(); setPressed(true); }}
      onMouseUp={() => { setPressed(false); item.onClick?.(); onClose?.(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: MI.gap,
        width: '100%', padding: MI.padding, borderRadius: MI.borderRadius, marginBottom: MI.marginBottom,
        fontSize: MI.fontSize, fontWeight: weight, color,
        background: bg, border: 'none', cursor: 'pointer', textAlign: 'left',
        fontFamily: 'inherit', transform: shift, transition: MI.transition,
      }}
    >
      {item.icon && <item.icon size={14} />}
      {item.label}
    </button>
  );
}

// ── Pipe ──────────────────────────────────────────────────────────────────────
export function Pipe() {
  return <span style={{ color: T.borderMd, fontSize: 14, userSelect: 'none', flexShrink: 0 }}>|</span>;
}

// ── TabBtn ────────────────────────────────────────────────────────────────────
export function TabBtn({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  const TS = SH.tabStrip;

  const s = active ? TS.active : pressed ? TS.press : hov ? TS.hover : TS.default;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        padding: `${TS.tabPaddingY}px ${TS.tabPaddingX}px`,
        fontSize: TS.fontSize,
        fontWeight: s.fontWeight,
        color: s.color ?? TS.default.color,
        background: active ? 'transparent' : ((s as { bg?: string }).bg ?? 'transparent'),
        borderRadius: (s as { borderRadius?: number }).borderRadius ?? 0,
        border: 'none', outline: 'none',
        borderBottom: active ? `2px solid ${TS.active.indicator}` : '2px solid transparent',
        marginBottom: -1,
        cursor: 'pointer',
        transition: 'color 0.15s, background 0.12s, border-color 0.15s',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
interface BreadcrumbEntry {
  label: string;
  onClick?: () => void;
  mono?: boolean;
  active?: boolean;
}

function BreadcrumbCrumb({ item, i, bs }: { item: BreadcrumbEntry; i: number; bs: SurfaceHeader['breadcrumbStrip'] }) {
  const [hov, setHov] = useState(false);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {i === 0 ? (
        <button
          onClick={item.onClick}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', outline: 'none',
            cursor: item.onClick ? 'pointer' : 'default',
            fontSize: bs.fontSize, fontWeight: bs.fontWeight,
            color: hov ? bs.hoverColor : bs.color,
            fontFamily: 'inherit', padding: 0,
            transition: 'color 0.15s',
          }}
        >
          <ArrowLeft size={10} />
          {item.label}
        </button>
      ) : (
        <>
          <span style={{ color: '#D1D5DB', fontSize: 11 }}>/</span>
          <span style={{
            fontSize: bs.fontSize, fontWeight: item.active ? 600 : bs.fontWeight,
            color: item.active ? '#4A5568' : bs.color,
            fontFamily: item.mono ? TYPOGRAPHY.fontMono : 'inherit',
          }}>
            {item.label}
          </span>
        </>
      )}
    </span>
  );
}

function BreadcrumbStrip({ items, paddingX, paddingY }: { items: BreadcrumbEntry[]; paddingX: number; paddingY: number }) {
  const bs = SH.breadcrumbStrip;
  const borderRadiusParts = SH.borderRadius.split(' ');
  return (
    <div style={{
      marginTop: -paddingY,
      marginLeft: -paddingX,
      marginRight: -paddingX,
      padding: `${bs.paddingY}px ${paddingX}px`,
      background: bs.bg,
      borderBottom: bs.borderBottom,
      marginBottom: bs.marginBottom,
      display: 'flex', alignItems: 'center', gap: 6,
      borderRadius: `${borderRadiusParts[0] ?? 0} ${borderRadiusParts[1] ?? 0} 0 0`,
    }}>
      {items.map((item, i) => (
        <BreadcrumbCrumb key={i} item={item} i={i} bs={bs} />
      ))}
    </div>
  );
}

// ── CaseHeader ────────────────────────────────────────────────────────────────
type StatusProp = string | { key: string; label?: string };
type RiskProp   = string | { key: string; label?: string };
type AssignedToProp = string | { name: string; onEdit?: () => void; showEdit?: boolean };

interface ActionConfig {
  variant?: BtnVariant;
  icon?: ElementType;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  size?: BtnSize;
  separator?: boolean;
  render?: () => ReactNode;
}

interface MoreMenuConfig {
  open: boolean;
  items: MoreMenuItemConfig[];
  onClose: () => void;
}

interface TabsConfig {
  items: string[];
  active: number;
  onChange: (i: number) => void;
}

interface ChipEntry {
  chain?: string;
  label?: string;
}

interface CaseHeaderProps {
  breadcrumb?: BreadcrumbEntry[];
  title?: string;
  copyText?: string;
  walletAddress?: string;
  chips?: ChipEntry[];
  actions?: ActionConfig[];
  showStatusRow?: boolean;
  status?: StatusProp;
  statusAction?: { label: string; onClick?: () => void };
  risk?: RiskProp;
  assignedTo?: AssignedToProp;
  lead?: { name: string; onEdit?: () => void; showEdit?: boolean };
  openedDate?: string;
  lastUpdated?: string;
  tabs?: TabsConfig;
  moreMenu?: MoreMenuConfig;
  compact?: boolean;
}

export function CaseHeader({
  breadcrumb, title, copyText, walletAddress, chips, actions,
  showStatusRow = true, status, statusAction, risk, assignedTo, lead,
  openedDate, lastUpdated, tabs, moreMenu, compact,
}: CaseHeaderProps) {
  const hasTabs = tabs && tabs.items && tabs.items.length > 0;
  const isTitleOnly = !showStatusRow && !hasTabs;

  return (
    <div style={{
      background: SH.bg,
      ...(isTitleOnly
        ? { padding: SH.paddingTitleOnly }
        : hasTabs
          ? { padding: compact ? SH.paddingTitleOnly : SH.padding, paddingBottom: 0 }
          : { padding: SH.padding, paddingBottom: SH.paddingBottom }),
      borderBottom:  hasTabs ? 'none' : SH.borderBottom,
      borderRadius:  SH.borderRadius,
      boxShadow:     SH.shadow,
    }}>
      {breadcrumb && breadcrumb.length > 0 && (
        <BreadcrumbStrip items={breadcrumb} paddingX={SH.paddingX} paddingY={SH.paddingY} />
      )}

      {(title || (actions && actions.length > 0)) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, minHeight: 36,
          marginBottom: (walletAddress || (chips && chips.length > 0)) ? 10 : showStatusRow ? 14 : 0,
        }}>
          {title && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              <h1 style={{ ...SH.pageHeadingSm, margin: 0 }}>{title}</h1>
              {copyText && <CopyBtn text={copyText} size="sm" />}
            </div>
          )}

          {actions && actions.length > 0 && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0, position: 'relative' }}>
              {actions.flatMap((action, i) => [
                ...(action.separator ? [
                  <div key={`sep-${i}`} style={{ width: 1, height: 20, background: '#E5E7EB', flexShrink: 0, alignSelf: 'center' }} />
                ] : []),
                action.render
                  ? <span key={i} style={{ display: 'inline-flex' }}>{action.render()}</span>
                  : <Btn key={i} variant={action.variant} icon={action.icon} size={action.size} onClick={action.onClick} disabled={action.disabled} active={action.active}>
                      {action.label}
                    </Btn>,
              ])}
              {moreMenu && moreMenu.open && (
                <>
                  <style>{`@keyframes mmSlide{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={moreMenu.onClose} />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 100,
                    background: C.bg.white, border: `1px solid ${C.border.light}`,
                    borderRadius: 12,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
                    minWidth: 180, overflow: 'hidden',
                    animation: 'mmSlide 0.16s cubic-bezier(0.16,1,0.3,1)',
                  }}>
                    <div style={{ padding: '10px 14px 8px', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B0B8C8' }}>
                      Actions
                    </div>
                    <div style={{ padding: 6 }}>
                      {moreMenu.items.map((item, i) => (
                        <MoreMenuItem key={i} item={item} onClose={moreMenu.onClose} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {(walletAddress || (chips && chips.length > 0)) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: showStatusRow ? 14 : 0 }}>
          {walletAddress && (
            <>
              <span
                title={walletAddress}
                style={{ fontSize: 12, fontFamily: TYPOGRAPHY.fontMono, fontWeight: 400, color: T.lightTxt, letterSpacing: '0.01em', cursor: 'default' }}
              >
                {walletAddress.length > 12
                  ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
                  : walletAddress}
              </span>
              <CopyBtn text={walletAddress} size="md" />
            </>
          )}
          {chips && chips.map((chip, i) => (
            <Tag key={i} chain={chip.chain} size="sm">{chip.label}</Tag>
          ))}
        </div>
      )}

      {showStatusRow && (
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: SH.statusBox.gap, flexWrap: 'wrap',
          background: SH.statusBox.bg,
          borderTop: SH.statusBox.borderTop,
          borderBottom: SH.statusBox.borderBottom,
          borderRadius: SH.statusBox.borderRadius,
          padding: SH.statusBox.padding,
          marginTop: SH.statusBox.marginTop,
          fontSize: SH.statusBox.fontSize,
        }}>
          {status && (
            <StatusChip
              status={typeof status === 'string' ? status : status.key}
              label={typeof status === 'object' ? status.label : undefined}
            />
          )}

          {statusAction && (
            <ActionLink onClick={statusAction.onClick}>{statusAction.label}</ActionLink>
          )}

          {risk && (
            <>
              <Pipe />
              <StatusChip
                risk={typeof risk === 'string' ? risk : risk.key}
                label={typeof risk === 'object' ? risk.label : undefined}
              />
            </>
          )}

          {assignedTo && (() => {
            const analystName  = typeof assignedTo === 'string' ? assignedTo : assignedTo.name;
            const analystEdit  = typeof assignedTo === 'object' ? assignedTo.onEdit : undefined;
            const analystShowEdit = typeof assignedTo === 'object' ? (assignedTo.showEdit ?? !!analystEdit) : false;
            return (
              <>
                <Pipe />
                <span style={{ fontSize: SH.statusBox.fontSize, color: T.lightTxt, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Assigned: <User size={12} style={{ color: T.lightTxt, flexShrink: 0 }} />
                  <span style={{ color: T.bodyTxt, fontWeight: 600 }}>{analystName}</span>
                  {(analystEdit || analystShowEdit) && (
                    <GhostIcon icon={Pencil} size="xs" onClick={analystEdit} disabled={!analystEdit} />
                  )}
                </span>
              </>
            );
          })()}

          {lead && (
            <>
              <Pipe />
              <span style={{ fontSize: SH.statusBox.fontSize, color: T.lightTxt, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Lead: <User size={12} style={{ color: T.lightTxt, flexShrink: 0 }} />
                <span style={{ color: T.bodyTxt, fontWeight: 600 }}>{lead.name}</span>
                {(lead.onEdit || lead.showEdit) && (
                  <GhostIcon icon={Pencil} size="xs" onClick={lead.onEdit} disabled={!lead.onEdit} />
                )}
              </span>
            </>
          )}

          {openedDate && (
            <>
              <Pipe />
              <span style={{ fontSize: SH.statusBox.fontSize, color: T.lightTxt }}>
                Opened: <span style={{ color: T.bodyTxt, fontFamily: TYPOGRAPHY.fontMono, fontWeight: 500 }}>{openedDate}</span>
              </span>
            </>
          )}

          {lastUpdated && (
            <>
              <Pipe />
              <span style={{ fontSize: SH.statusBox.fontSize, color: T.lightTxt }}>
                Last Updated: <span style={{ color: T.bodyTxt, fontFamily: TYPOGRAPHY.fontMono, fontWeight: 500 }}>{lastUpdated}</span>
              </span>
            </>
          )}
        </div>
      )}

      {hasTabs && (
        <div style={{
          display: 'flex',
          background: SH.bg,
          borderBottom: `1px solid ${T.border}`,
          marginTop: SH.tabStrip.marginTop,
          marginLeft: -SH.paddingX,
          marginRight: -SH.paddingX,
          paddingLeft: SH.paddingX,
        }}>
          {tabs!.items.map((label, i) => (
            <TabBtn key={label} label={label} active={tabs!.active === i} onClick={() => tabs!.onChange(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
