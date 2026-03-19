import { useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { StatusChip } from './StatusChip';
import { ArrowLeft, Copy, Check, User, Pencil } from 'lucide-react';

// ── Btn ───────────────────────────────────────────────────────────────────────
const btnVariants = cva(
  [
    'inline-flex items-center justify-start gap-[6px]',
    'font-medium leading-none whitespace-nowrap font-sans',
    'border outline-none cursor-pointer transition-all duration-150',
    'disabled:cursor-not-allowed disabled:opacity-60',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[#0D0D0D] text-[#C6FF00] border-[rgba(198,255,0,0.22)] shadow-[0_1px_4px_rgba(0,0,0,0.25)]',
          'font-semibold',
          'hover:bg-[#1A1A1A] hover:border-[rgba(198,255,0,0.40)] hover:shadow-[0_2px_12px_rgba(198,255,0,0.14),0_2px_8px_rgba(0,0,0,0.35)]',
          'active:bg-black active:border-[rgba(198,255,0,0.30)] active:shadow-[0_1px_2px_rgba(0,0,0,0.4)]',
        ],
        dark: [
          'bg-trace-btn-primary text-white border-[rgba(255,255,255,0.10)] shadow-[0_1px_3px_rgba(0,0,0,0.12)]',
          'hover:bg-trace-btn-primary-hover hover:border-[rgba(255,255,255,0.14)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
          'active:bg-[#152244] active:border-[rgba(255,255,255,0.06)] active:shadow-[0_1px_2px_rgba(0,0,0,0.18)]',
        ],
        outline: [
          'bg-card text-trace-text-dark border-trace-border-light shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
          'hover:bg-[#F5F6F8] hover:border-[#C9CDD6] hover:shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
          'active:bg-[#EEF0F3] active:border-[#B8BCC6] active:shadow-[0_1px_2px_rgba(0,0,0,0.06)]',
        ],
        danger: [
          'bg-card text-[#DC2626] border-[#FECACA] shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
          'hover:bg-[#FEF2F2] hover:border-[#FCA5A5] hover:shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
          'active:bg-[#FEE2E2] active:border-[#DC2626] active:shadow-[0_0_0_3px_rgba(239,68,68,0.12),0_1px_4px_rgba(0,0,0,0.05)]',
        ],
        secondary: [
          'bg-card text-[#D97706] border-[#FDE68A] shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
          'hover:bg-[#FFFBEB] hover:border-[#FCD34D] hover:shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
          'active:bg-[#FEF3C7] active:border-[#D97706] active:shadow-[0_0_0_3px_rgba(245,158,11,0.12),0_1px_4px_rgba(0,0,0,0.05)]',
        ],
        ghost: [
          'bg-transparent text-trace-icon-rest border-transparent shadow-none',
          'hover:bg-[rgba(123,144,170,0.10)] hover:text-trace-icon-hover',
          'active:bg-[rgba(37,99,235,0.10)] active:text-[#2563EB]',
          'data-[active=true]:bg-[rgba(37,99,235,0.08)] data-[active=true]:text-[#2563EB]',
        ],
        segment: [
          'bg-transparent text-trace-text-body border-transparent shadow-none',
          'hover:bg-[rgba(0,0,0,0.04)]',
          'active:bg-[rgba(0,0,0,0.08)]',
          'data-[active=true]:bg-trace-btn-primary data-[active=true]:text-white data-[active=true]:border-[rgba(255,255,255,0.10)] data-[active=true]:shadow-[0_1px_3px_rgba(0,0,0,0.12)]',
        ],
        chip: [
          'bg-[#F0F1F4] text-trace-text-body border-[#E5E7EB] shadow-none rounded-full',
          'hover:bg-[#F3F4F6]',
          'active:bg-[#E5E7EB] active:border-[#9CA3AF]',
          'data-[active=true]:bg-[#2D3142] data-[active=true]:text-white data-[active=true]:border-[#2D3142]',
        ],
      },
      size: {
        sm: 'h-[32px] px-[18px] text-[12px]',
        md: 'h-[40px] px-[28px] text-[13px]',
        lg: 'h-[46px] px-[36px] text-[14px]',
      },
      iconOnly: {
        true:  'px-0 justify-center',
        false: '',
      },
    },
    compoundVariants: [
      { iconOnly: true, size: 'sm', class: 'w-[32px]' },
      { iconOnly: true, size: 'md', class: 'w-[40px]' },
      { iconOnly: true, size: 'lg', class: 'w-[46px]' },
      { variant: 'ghost', iconOnly: true, size: 'sm', class: 'w-[24px] h-[24px]' },
      { variant: 'ghost', iconOnly: true, size: 'md', class: 'w-[38px] h-[38px]' },
      { variant: 'ghost', iconOnly: true, size: 'lg', class: 'w-[44px] h-[44px]' },
      { variant: 'chip', class: 'rounded-full px-[12px] h-auto py-[4px]' },
    ],
    defaultVariants: { variant: 'primary', size: 'md', iconOnly: false },
  }
);

const ICON_SIZE: Record<string, number> = { sm: 13, md: 15, lg: 17 };

type BtnVariant = 'primary' | 'dark' | 'outline' | 'danger' | 'secondary' | 'ghost' | 'segment' | 'chip';
type BtnSize    = 'sm' | 'md' | 'lg';

interface BtnProps extends VariantProps<typeof btnVariants> {
  children?: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  disabled?: boolean;
  icon?: ElementType;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export function Btn({
  children, variant = 'primary', size = 'md',
  disabled, icon: Icon, onClick, active, className,
}: BtnProps) {
  const isIconOnly = !!Icon && !children;
  const iconSz = ICON_SIZE[size ?? 'md'] ?? 15;

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      data-active={active ? 'true' : undefined}
      className={cn(
        btnVariants({ variant, size, iconOnly: isIconOnly }),
        'rounded-[10px]',
        variant === 'chip' ? 'rounded-full' : '',
        className,
      )}
    >
      {Icon && <Icon size={iconSz} className="shrink-0" />}
      {children}
    </button>
  );
}

// ── GhostIcon ─────────────────────────────────────────────────────────────────
const GHOST_ICON_SIZE: Record<string, number> = { xs: 14, sm: 16, md: 18, lg: 20 };
const GHOST_DIM: Record<string, string> = { xs: 'w-[24px] h-[24px]', sm: 'w-[32px] h-[32px]', md: 'w-[38px] h-[38px]', lg: 'w-[44px] h-[44px]' };

interface GhostIconProps {
  icon?: ElementType;
  size?: string;
  color?: string;
  onClick?: () => void;
  alwaysVisible?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export function GhostIcon({
  icon: Icon, size = 'md', color = '#717A8C',
  onClick, alwaysVisible = true, disabled = false, children, className,
}: GhostIconProps) {
  const [hov, setHov] = useState(false);
  const [act, setAct] = useState(false);
  const iconSz   = GHOST_ICON_SIZE[size] ?? 18;
  const iconColor = disabled ? '#C4C9D4' : act ? '#0F0F1A' : hov ? '#4A5568' : color;
  const bg        = disabled ? 'transparent' : act ? 'rgba(37,99,235,0.10)' : hov ? 'rgba(123,144,170,0.10)' : 'transparent';
  const opacity   = disabled ? 0.45 : (alwaysVisible ? (act ? 1 : hov ? 1 : 0.8) : (hov ? 1 : 0));

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => { if (!disabled) setHov(true); }}
      onMouseLeave={() => { setHov(false); setAct(false); }}
      onMouseDown={() => { if (!disabled) setAct(true); }}
      onMouseUp={() => setAct(false)}
      className={cn(
        'inline-flex items-center justify-center gap-[4px] shrink-0',
        'border-none outline-none p-0 rounded-[6px]',
        'text-[11px] font-sans whitespace-nowrap',
        'transition-[background,color,opacity] duration-150',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        GHOST_DIM[size] ?? GHOST_DIM.md,
        className,
      )}
      style={{ color: iconColor, background: bg, opacity }}
    >
      {Icon && <Icon size={iconSz} />}
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
  const color = state === 'flash' ? '#C6FF00' : state === 'copied' ? '#10B981' : '#717A8C';
  return (
    <GhostIcon icon={state === 'copied' ? Check : Copy} size={size} color={color} onClick={doClick}>
      {state === 'copied' && 'Copied'}
    </GhostIcon>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ children, bg, color }: { children: ReactNode; bg: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-full text-[12px] font-semibold"
      style={{ background: bg, color }}
    >
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
export function Tag({ children, chain, size = 'md' }: { children?: ReactNode; chain?: string; size?: string }) {
  const meta = chain ? CHAIN_META[chain.toLowerCase()] : null;
  const isSmall = size === 'sm';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        isSmall ? 'text-[11px] px-[6px] py-[2px] rounded-[20px] gap-[4px]' : 'text-[12px] px-[8px] py-[3px] rounded-[20px] gap-[5px]',
      )}
      style={{
        border: `1px solid ${meta ? meta.accent + '50' : '#E5E7EB'}`,
        color: meta ? meta.accent : '#4A5568',
        background: meta ? meta.background : '#F0F1F4',
      }}
    >
      {meta && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full shrink-0 leading-none font-bold text-white',
            isSmall ? 'w-[14px] h-[14px] text-[8px]' : 'w-[16px] h-[16px] text-[9px]',
          )}
          style={{ background: meta.iconBg }}
        >
          {meta.symbol}
        </span>
      )}
      {children || (meta ? meta.name : null)}
    </span>
  );
}

// ── ActionLink ────────────────────────────────────────────────────────────────
export function ActionLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'bg-transparent border-none outline-none p-0 cursor-pointer font-sans text-[13px]',
        'text-trace-link hover:text-trace-link-hover hover:underline underline-offset-[4px] decoration-[1px]',
        'transition-colors duration-200',
      )}
    >
      {children}
    </button>
  );
}

// ── Pipe ──────────────────────────────────────────────────────────────────────
export function Pipe() {
  return <span className="text-[#D1D5DB] text-[14px] select-none shrink-0">|</span>;
}

// ── TabBtn ────────────────────────────────────────────────────────────────────
export function TabBtn({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={cn(
        'px-[20px] py-[9px] text-[13px] outline-none cursor-pointer font-sans',
        'border-0 border-b-2 -mb-px transition-[color,background] duration-150',
        active
          ? 'border-b-[#003C7E] text-[#1A1F35] font-semibold bg-transparent'
          : pressed
            ? 'border-b-transparent text-[#2D3142] font-semibold bg-[#DBEAFE] rounded-t-[6px]'
            : hov
              ? 'border-b-transparent text-[#4A5568] font-normal bg-[#F5F7FA] rounded-t-[6px]'
              : 'border-b-transparent text-[#717A8C] font-normal bg-transparent',
      )}
    >
      {label}
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
  const isDanger = !!item.color;
  return (
    <button
      onMouseDown={e => e.preventDefault()}
      onMouseUp={() => { item.onClick?.(); onClose?.(); }}
      className={cn(
        'flex items-center gap-[8px] w-full px-[10px] py-[8px] rounded-[8px] mb-[2px]',
        'text-[13px] font-medium border-none cursor-pointer text-left font-sans',
        'transition-[background,transform] duration-150',
        isDanger
          ? 'text-[#DC2626] hover:bg-[#FEF2F2] active:bg-[#FEE2E2]'
          : 'text-trace-text-body hover:bg-[#F5F6F8] hover:translate-x-[1px] active:bg-[#EDEEF1] active:text-trace-text-dark active:font-semibold',
      )}
    >
      {item.icon && <item.icon size={14} />}
      {item.label}
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

function BreadcrumbCrumb({ item, i }: { item: BreadcrumbEntry; i: number }) {
  return (
    <span className="inline-flex items-center gap-[6px]">
      {i === 0 ? (
        <button
          onClick={item.onClick}
          className={cn(
            'inline-flex items-center gap-[4px] bg-transparent border-none outline-none p-0 font-sans',
            'text-[12px] font-medium text-trace-text-light transition-colors duration-150',
            item.onClick ? 'cursor-pointer hover:text-trace-text-body' : 'cursor-default',
          )}
        >
          <ArrowLeft size={10} />
          {item.label}
        </button>
      ) : (
        <>
          <span className="text-[#D1D5DB] text-[11px]">/</span>
          <span
            className={cn(
              'text-[12px] text-trace-text-light',
              item.active ? 'font-semibold text-trace-text-body' : 'font-medium',
              item.mono ? 'font-mono' : '',
            )}
          >
            {item.label}
          </span>
        </>
      )}
    </span>
  );
}

function BreadcrumbStrip({ items }: { items: BreadcrumbEntry[] }) {
  return (
    <div className="flex items-center gap-[6px] -mt-[14px] -mx-[32px] px-[32px] py-[8px] bg-[#F9FAFB] border-b border-[#ECEEF2] mb-[14px] rounded-t-[12px]">
      {items.map((item, i) => (
        <BreadcrumbCrumb key={i} item={item} i={i} />
      ))}
    </div>
  );
}

// ── CaseHeader ────────────────────────────────────────────────────────────────
type StatusProp    = string | { key: string; label?: string };
type RiskProp      = string | { key: string; label?: string };
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
  const hasTabs    = tabs && tabs.items && tabs.items.length > 0;
  const isTitleOnly = !showStatusRow && !hasTabs;

  const paddingClass = isTitleOnly
    ? 'p-[14px_32px]'
    : hasTabs
      ? compact ? 'p-[14px_32px_0]' : 'p-[20px_32px_0]'
      : 'p-[20px_32px_14px]';

  return (
    <div
      className={cn(
        'bg-white rounded-t-[12px]',
        paddingClass,
        hasTabs ? '' : 'border-b border-[#ECEEF2] shadow-[0_1px_0_rgba(0,0,0,0.03)]',
      )}
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <BreadcrumbStrip items={breadcrumb} />
      )}

      {(title || (actions && actions.length > 0)) && (
        <div
          className={cn(
            'flex items-center justify-between gap-[24px] min-h-[36px]',
            (walletAddress || (chips && chips.length > 0)) ? 'mb-[10px]' : showStatusRow ? 'mb-[14px]' : 'mb-0',
          )}
        >
          {title && (
            <div className="flex items-center gap-[8px] flex-1 min-w-0">
              <h1 className="m-0 text-[20px] font-semibold text-trace-text-dark leading-[1.2] tracking-[-0.3px] font-display truncate">
                {title}
              </h1>
              {copyText && <CopyBtn text={copyText} size="sm" />}
            </div>
          )}

          {actions && actions.length > 0 && (
            <div className="flex gap-[16px] items-center shrink-0 relative v3-case-header-ctas">
              {actions.flatMap((action, i) => [
                ...(action.separator ? [
                  <div key={`sep-${i}`} className="w-px h-[20px] bg-trace-border-light shrink-0 self-center" />,
                ] : []),
                action.render
                  ? <span key={i} className="inline-flex">{action.render()}</span>
                  : (
                    <Btn
                      key={i}
                      variant={action.variant}
                      icon={action.icon}
                      size={action.size}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      active={action.active}
                    >
                      {action.label}
                    </Btn>
                  ),
              ])}

              {moreMenu && moreMenu.open && (
                <>
                  <style>{`@keyframes mmSlide{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
                  <div className="fixed inset-0 z-[99]" onClick={moreMenu.onClose} />
                  <div
                    className="absolute top-[calc(100%+6px)] right-0 z-[100] bg-white border border-trace-border-light rounded-[12px] shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] min-w-[180px] overflow-hidden"
                    style={{ animation: 'mmSlide 0.16s cubic-bezier(0.16,1,0.3,1)' }}
                  >
                    <div className="px-[14px] py-[10px] bg-[#F9FAFB] border-b border-[#F3F4F6] text-[10px] font-bold uppercase tracking-[0.1em] text-[#B0B8C8]">
                      Actions
                    </div>
                    <div className="p-[6px]">
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
        <div className={cn('flex items-center gap-[8px] flex-wrap', showStatusRow ? 'mb-[14px]' : 'mb-0')}>
          {walletAddress && (
            <>
              <span
                title={walletAddress}
                className="text-[12px] font-mono font-normal text-trace-text-light tracking-[0.01em] cursor-default"
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
        <div className="flex items-center gap-[8px] flex-wrap bg-[#F9FAFB] border-t border-b border-[#ECEEF2] rounded-[6px] px-[12px] py-[8px] mt-0 text-[12px] v3-status-row v3-chips-row">
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
            const analystName     = typeof assignedTo === 'string' ? assignedTo : assignedTo.name;
            const analystEdit     = typeof assignedTo === 'object' ? assignedTo.onEdit : undefined;
            const analystShowEdit = typeof assignedTo === 'object' ? (assignedTo.showEdit ?? !!analystEdit) : false;
            return (
              <>
                <Pipe />
                <span className="text-[12px] text-trace-text-light inline-flex items-center gap-[4px]">
                  Assigned: <User size={12} className="text-trace-text-light shrink-0" />
                  <span className="text-trace-text-body font-semibold">{analystName}</span>
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
              <span className="text-[12px] text-trace-text-light inline-flex items-center gap-[4px]">
                Lead: <User size={12} className="text-trace-text-light shrink-0" />
                <span className="text-trace-text-body font-semibold">{lead.name}</span>
                {(lead.onEdit || lead.showEdit) && (
                  <GhostIcon icon={Pencil} size="xs" onClick={lead.onEdit} disabled={!lead.onEdit} />
                )}
              </span>
            </>
          )}

          {openedDate && (
            <>
              <Pipe />
              <span className="text-[12px] text-trace-text-light">
                Opened: <span className="text-trace-text-body font-mono font-medium">{openedDate}</span>
              </span>
            </>
          )}

          {lastUpdated && (
            <>
              <Pipe />
              <span className="text-[12px] text-trace-text-light">
                Last Updated: <span className="text-trace-text-body font-mono font-medium">{lastUpdated}</span>
              </span>
            </>
          )}
        </div>
      )}

      {hasTabs && (
        <div className="flex bg-white border-b border-[#ECEEF2] mt-[14px] -mx-[32px] pl-[32px]">
          {tabs!.items.map((label, i) => (
            <TabBtn key={label} label={label} active={tabs!.active === i} onClick={() => tabs!.onChange(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
