import { useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import GaugeMetric from '@/components/GaugeMetric';
import SearchBar from '@/components/SearchBar';
import { Callout } from '@/components/core/MetricCard';
import { SURFACE, COLORS, RADIUS, INPUT, TABLE, CALLOUT, SEARCHBAR, TOAST, DASH_WIDGET, STAT_CARD, EMPTY_STATE, TYPOGRAPHY } from '@/tokens/designTokens';
import { Table } from '@/components/core/Table';
import { CaseHeader, Btn, GhostIcon, Tag, ActionLink, Pipe } from '@/components/core/CaseHeader';
import { StatusChip } from '@/components/core/StatusChip';
import { FormField, FilterSearchInput } from '@/components/core/FormField';
import { CustomSelect } from '@/components/core/CustomSelect';
import {
  ChevronLeft, ChevronRight,
  Plus, Search, MoreHorizontal, RotateCcw, X,
  SendHorizonal, MessageSquare, Pencil, User,
  Users, AlertTriangle, Clock,
  Filter, Download, Printer, ExternalLink, Bell, Archive,
  CheckCircle, TrendingUp, UserPlus, Settings, Activity,
} from 'lucide-react';

// ── Tokens ────────────────────────────────────────────────────────────────────
const T = {
  lime:      '#C6FF00',
  limeHvr:  '#B8E600',
  limeRing: 'rgba(198,255,0,0.25)',
  orange:   '#F59E0B',
  red:      '#EF4444',
  green:    '#10B981',
  blue:     '#2563EB',
  darkTxt:  '#1A1F35',
  bodyTxt:  '#4A5568',
  lightTxt: '#717A8C',
  border:   '#E5E7EB',
  borderMd: '#D1D5DB',
  bgLight:  '#F5F7FA',
  bgCard:   '#FAFBFC',
  white:    '#FFFFFF',
  dark:     '#111827',
};

const CARD_H = 176;

const cardStyle = {
  background: SURFACE.card.bg,
  padding: SURFACE.card.padding,
  borderRadius: SURFACE.card.borderRadius,
  border: SURFACE.card.border,
  boxShadow: SURFACE.card.shadow,
};

const sectionLabelStyle = SURFACE.sectionLabel;

// ── Prop interfaces ───────────────────────────────────────────────────────────
interface SwatchProps { hex: string; name: string; usage?: string }
interface GradientSwatchProps { gradient: string; stops: string[]; name: string; usage?: string }
interface ChipProps { label: string; color: string }
interface CardProps { children: ReactNode; style?: React.CSSProperties }
interface StatCardProps { label: string; value: string | number; sub?: string; accent?: string }
interface MetricCardVisual { total?: number; current?: number; badges?: Array<{ label: string; bg: string }> }
interface MetricCardProps { label: string; value: number; type?: string; color?: string; max?: number; displayValue?: string | number; visual?: MetricCardVisual; onClick?: () => void; active?: boolean }
interface InfoCardProps { icon: React.ComponentType<{ size?: number; color?: string }>; value: string | number; label: string; iconBg?: string; iconColor?: string }
interface DetailsItem { label: string; type?: string; value?: string | number; badge?: string; badgeBg?: string; badgeColor?: string; progress?: number; chips?: Array<{ label: string; color: string }> }
interface DetailsCardProps { title?: string; items: DetailsItem[]; layout?: string }
interface ItemValueProps { item: DetailsItem }
interface BtnRowProps { title: string; token?: string; usage?: string; children: ReactNode }
interface StateBoxProps { label: string; bg: string; color?: string; border?: string }

type SCard = { bg: string; border: string; borderHover: string; borderRadius: number; shadow: string; shadowHover: string; shadowPress: string; padding: string | number };

// ── Colour swatch ─────────────────────────────────────────────────────────────
function Swatch({ hex, name, usage }: SwatchProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10, background: hex, flexShrink: 0,
        border: hex === '#FFFFFF' || hex === '#F5F7FA' ? `1px solid ${T.border}` : '1px solid transparent',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }} />
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: T.darkTxt }}>{hex}</div>
        <div style={{ fontSize: 12, color: T.bodyTxt, marginTop: 1 }}>{name}</div>
        {usage && <div style={{ fontSize: 11, color: '#B0B8C8', marginTop: 1, fontStyle: 'italic' }}>{usage}</div>}
      </div>
    </div>
  );
}

function GradientSwatch({ gradient, stops, name, usage }: GradientSwatchProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10, background: gradient, flexShrink: 0,
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }} />
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: T.darkTxt, lineHeight: 1.5 }}>
          {stops.map((s, i) => <span key={i} style={{ display: 'block' }}>{s}</span>)}
        </div>
        <div style={{ fontSize: 12, color: T.bodyTxt, marginTop: 2 }}>{name}</div>
        {usage && <div style={{ fontSize: 11, color: '#B0B8C8', marginTop: 1, fontStyle: 'italic' }}>{usage}</div>}
      </div>
    </div>
  );
}


// ── Chip — solid pill badge, white text (shared across MetricCard + DetailsCard)
function Chip({ label, color }: ChipProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '8px 14px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      background: color, color: '#fff',
    }}>
      {label}
    </span>
  );
}

// ── Card — baseline wrapper ────────────────────────────────────────────────────
function Card({ children, style }: CardProps) {
  return (
    <div style={{
      background: SURFACE.card.bg,
      borderRadius: 12, padding: 20,
      border: '1px solid #E2E5EB',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03), 0 1px 4px rgba(0,0,0,0.05)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── StatCard — label + big number + left accent bar ────────────────────────────
function StatCard({ label, value, sub, accent = '#9CA3AF' }: StatCardProps) {
  return (
    <Card>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 3, alignSelf: 'stretch', flexShrink: 0, background: accent, borderRadius: 2 }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.lightTxt, marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: T.darkTxt, lineHeight: 1, fontFamily: "'Sora', sans-serif" }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: 12, color: T.lightTxt, marginTop: 5 }}>{sub}</div>}
        </div>
      </div>
    </Card>
  );
}

// ── MetricCard — label + number + 5 visualization variants ───────────────────
// type: 'gradient-bar' | 'gauge' | 'vertical-bar' | 'dots' | 'badges'
function MetricCard({ label, value, type = 'gauge', color = '#10B981', max = 100, displayValue, visual, onClick, active = false }: MetricCardProps) {
  const pct      = Math.min(value / max, 1);
  const cardRef  = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const SC = SURFACE.card as unknown as SCard;
  const handleEnter = () => {
    if (!cardRef.current) return;
    cardRef.current.style.border    = active ? `1.5px solid ${color}` : SC.borderHover;
    cardRef.current.style.boxShadow = SC.shadowHover;
  };
  const handleLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.border    = active ? `1.5px solid ${color}` : SC.border;
    cardRef.current.style.boxShadow = active ? SC.shadowHover : SC.shadow;
  };
  const handleDown = () => { if (cardRef.current) cardRef.current.style.boxShadow = SC.shadowPress; };
  const handleUp   = () => { if (cardRef.current) cardRef.current.style.boxShadow = SC.shadowHover; };

  let viz;
  switch (type) {
    case 'gradient-bar': {
      viz = (
        <div style={{ marginTop: 'auto' }}>
          <div style={{ position: 'relative', paddingTop: 8, paddingBottom: 8 }}>
            {/* Grey track */}
            <div style={{ height: 6, borderRadius: 3, background: '#E5E7EB' }} />
            {/* Colored fill up to value */}
            <div style={{
              position: 'absolute', top: 8, left: 0,
              height: 6, borderRadius: 3,
              width: `${pct * 100}%`,
              background: 'linear-gradient(to right, #10B981 0%, #F59E0B 50%, #EF4444 100%)',
            }} />
            {/* Indicator dot */}
            <div style={{
              position: 'absolute', top: '50%', left: `${pct * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: 14, height: 14, borderRadius: '50%',
              background: '#fff', border: '2.5px solid #374151',
              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.lightTxt }}>
            <span>0 · Low</span><span>50 · Med</span><span>100 · High</span>
          </div>
        </div>
      );
      break;
    }
    case 'gauge': {
      // Arc center (50,48) r=40 → endpoints (10,48)(90,48), top y=8
      // strokeWidth 10 → caps ±5px → viewBox "4 2 92 80" gives clearance on all sides
      // POOR/EXCELLENT inside SVG so full flex height goes to arc
      const gpct = Math.min(Math.max(value / max, 0), 1);
      const gr = 40, cx = 50, cy = 48;
      const gangle = Math.PI * (1 - gpct);
      const gex = (cx + gr * Math.cos(gangle)).toFixed(2);
      const gey = (cy - gr * Math.sin(gangle)).toFixed(2);
      const gLargeArc = gpct > 0.5 ? 1 : 0;
      viz = (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* centered flex wrapper — SVG fills container height with breathing room */}
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
            <svg
              viewBox="4 -4 92 72"
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', maxWidth: '90%', maxHeight: '90%', display: 'block' }}
            >
              <defs>
                <linearGradient id="gaugeGrad" x1="10" y1="48" x2="90" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#EF4444" />
                  <stop offset="50%"  stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <path d="M 10 48 A 40 40 0 0 1 90 48"
                fill="none" stroke="#E5E7EB" strokeWidth="10" strokeLinecap="round" />
              {gpct > 0.01 && (
                <path d={`M 10 48 A 40 40 0 ${gLargeArc} 1 ${gex} ${gey}`}
                  fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round" />
              )}
              <text x="50" y="62" textAnchor="middle"
                style={{ fontSize: 14, fontWeight: 700, fill: T.darkTxt, fontFamily: "'Sora', sans-serif" }}>
                {displayValue ?? value}
              </text>
            </svg>
          </div>
          {/* HTML labels — fixed size, never scale with arc */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2, fontSize: 10, color: '#9CA3AF', flexShrink: 0 }}>
            <span>POOR</span><span>EXCELLENT</span>
          </div>
        </div>
      );

      break;
    }
    case 'vertical-bar':
      viz = (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch', gap: 6 }}>
          {/* High / Low labels left of bar */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 10, color: T.lightTxt }}>High</span>
            <span style={{ fontSize: 10, color: T.lightTxt }}>Low</span>
          </div>
          {/* Bar */}
          <div style={{ position: 'relative', width: 14 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 6, background: '#E5E7EB' }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: `${pct * 100}%`, borderRadius: 6,
              background: 'linear-gradient(to top, #10B981, #F59E0B 50%, #EF4444)',
            }} />
          </div>
        </div>
      );
      break;
    case 'dots': {
      const total = visual?.total ?? 7;
      const current = visual?.current ?? value;
      // Connected dots: ●—●—●—●—●—●—●
      viz = (
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center' }}>
          {Array.from({ length: total * 2 - 1 }, (_, i) => {
            if (i % 2 === 0) {
              const di = i / 2;
              return (
                <div key={i} style={{
                  width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                  background: di < current ? color : '#D1D5DB',
                  boxShadow: di < current ? `0 0 0 2px ${color}33` : 'none',
                }} />
              );
            }
            const li = Math.floor(i / 2);
            return (
              <div key={i} style={{
                flex: 1, height: 2,
                background: li < current - 1 ? color : '#D1D5DB',
              }} />
            );
          })}
        </div>
      );
      break;
    }
    case 'badges':
      viz = (
        <div style={{ marginTop: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(visual?.badges || []).map(({ label: bl, bg: bc }) => (
            <Chip key={bl} label={bl} color={bc} />
          ))}
        </div>
      );
      break;
    default:
      viz = null;
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', height: CARD_H,
        padding: 16, boxSizing: 'border-box',
        background: SURFACE.card.bg,
        border:       active ? `1.5px solid ${color}` : SC.border,
        borderRadius: SC.borderRadius,
        boxShadow:    active ? SC.shadowHover : SC.shadow,
        transition: 'border 0.15s ease, box-shadow 0.15s ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div ref={labelRef} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: active ? color : T.lightTxt, marginBottom: 8 }}>
        {label}
      </div>
      {type !== 'gauge' && (
        <div style={{ fontSize: 32, fontWeight: 700, color: T.darkTxt, lineHeight: 1, fontFamily: "'Sora', sans-serif", marginBottom: 14 }}>
          {displayValue ?? value}
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {viz}
      </div>
    </div>
  );
}

// ── InfoCard — icon chip + big number + label ──────────────────────────────────
function InfoCard({ icon: Icon, value, label, iconBg = '#F3F4F6', iconColor = '#4A5568' }: InfoCardProps) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={iconColor} />
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: T.darkTxt, lineHeight: 1, fontFamily: "'Sora', sans-serif" }}>
            {value}
          </div>
          <div style={{ fontSize: 12, color: T.lightTxt, marginTop: 3 }}>{label}</div>
        </div>
      </div>
    </Card>
  );
}

// ── DetailsCard — title + flexible items (badge | text | progress) ────────────
// layout: 'vertical' (label above value) | 'horizontal' (label left, value right)
function DetailsCard({ title, items, layout = 'vertical' }: DetailsCardProps) {
  const isH = layout === 'horizontal';

  const ItemValue = ({ item }: ItemValueProps): ReactNode => {
    if (item.type === 'badge') return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '3px 10px', borderRadius: 20,
        fontSize: 12, fontWeight: 700,
        background: item.badgeBg || '#D1FAE5',
        color: item.badgeColor || '#065F46',
      }}>
        {item.badge}
      </span>
    );
    if (item.type === 'progress') return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: isH ? 160 : undefined }}>
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#E5E7EB', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 4, background: T.red, width: `${item.progress}%` }} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.darkTxt, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{item.value}</div>
      </div>
    );
    if (item.type === 'chips') return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: isH ? 'flex-end' : 'flex-start' }}>
        {(item.chips ?? []).map(({ label: cl, color: cc }) => (
          <Chip key={cl} label={cl} color={cc} />
        ))}
      </div>
    );
    return (
      <div style={{ fontSize: 14, fontWeight: 700, color: T.darkTxt, textAlign: isH ? 'right' : 'left', fontFamily: "'JetBrains Mono', monospace" }}>
        {item.value}
      </div>
    );
  };

  return (
    <Card>
      {title && (
        <div style={{ fontSize: 14, fontWeight: 600, color: T.darkTxt, marginBottom: 14 }}>
          {title}
        </div>
      )}
      <div>
        {items.map((item, i) => (
          <div key={item.label} style={{
            padding: '10px 0',
            borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : 'none',
            ...(isH ? { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 } : {}),
          }}>
            <div style={{ fontSize: 12, color: T.lightTxt, ...(isH ? {} : { marginBottom: 5 }), flexShrink: 0 }}>
              {item.label}
            </div>
            <ItemValue item={item} />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Button section helpers ─────────────────────────────────────────────────────
function BtnRow({ title, token, usage, children }: BtnRowProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.darkTxt }}>{title}</span>
        {token && <code style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: '#F0F1F4', color: T.lightTxt, padding: '1px 7px', borderRadius: 4 }}>{token}</code>}
        {usage && <span style={{ fontSize: 11, color: T.lightTxt, fontStyle: 'italic' }}>{usage}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: T.border, margin: '20px 0' }} />;
}

function StateBox({ label, bg, color = '#fff', border }: StateBoxProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 52, height: 28, borderRadius: 6, background: bg, border: border || 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color, letterSpacing: '0.02em' }}>Aa</span>
      </div>
      <span style={{ fontSize: 10, color: T.lightTxt }}>{label}</span>
    </div>
  );
}

function SegmentDemo() {
  const [active, setActive] = useState('basic');
  return (
    <div style={{ display: 'flex', border: `1px solid ${T.border}`, borderRadius: 8, padding: 3, background: '#F5F7FA', gap: 2 }}>
      {['Basic', 'Analysis', 'Full'].map(t => (
        <Btn key={t} variant="segment" size="sm" active={active === t} onClick={() => setActive(t)}>{t}</Btn>
      ))}
    </div>
  );
}

function ChipDemo() {
  const [active, setActive] = useState<string[]>([]);
  const toggle = (v: string) => setActive(a => a.includes(v) ? a.filter(x => x !== v) : [...a, v]);
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {['High Risk', 'Critical', 'Open', 'Ethereum', 'Sanctions', 'Unreviewed'].map(t => (
        <Btn key={t} variant="chip" size="sm" active={active.includes(t)} onClick={() => toggle(t)}>{t}</Btn>
      ))}
    </div>
  );
}

function ChipIconDemo() {
  const [active, setActive] = useState<string[]>([]);
  const toggle = (v: string) => setActive(a => a.includes(v) ? a.filter(x => x !== v) : [...a, v]);
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {[
        { label: 'Filter', icon: Filter },
        { label: 'Alerts', icon: Bell },
        { label: 'Archive', icon: Archive },
      ].map(({ label, icon: Icon }) => (
        <Btn key={label} variant="chip" size="sm" icon={Icon} active={active.includes(label)} onClick={() => toggle(label)}>{label}</Btn>
      ))}
    </div>
  );
}

// ── Inputs demo (needs local state) ──────────────────────────────────────────
function InputsDemo() {
  const [statusTop,  setStatusTop]  = useState('All');
  const [roleTop,    setRoleTop]    = useState('All');
  const [statusLeft, setStatusLeft] = useState('All');
  const [roleLeft,   setRoleLeft]   = useState('All');
  const [filterSearch, setFilterSearch] = useState('');
  const STATUS_OPTS = [
    { value: 'All',              label: 'All Statuses'     },
    { value: 'open',             label: 'Open'             },
    { value: 'under-review',     label: 'Under Review'     },
    { value: 'pending-approval', label: 'Pending Approval' },
    { value: 'closed',           label: 'Closed'           },
  ];
  const ROLE_OPTS = [
    { value: 'All',     label: 'All Roles' },
    { value: 'analyst', label: 'Analyst'   },
    { value: 'lead',    label: 'Lead'      },
    { value: 'admin',   label: 'Admin'     },
  ];
  const T = { lightTxt: '#717A8C', bgLight: '#F5F6FA', border: '#E5E7EB' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 32 }}>
      <div style={{ width: '100%', height: 1, background: T.border }} />
      <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>CustomSelect + FilterSearchInput — live components</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        {/* labelLayout="top" */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>labelLayout="top"</div>
          <FormField label="Status" labelLayout="top">
            <CustomSelect value={statusTop} onChange={setStatusTop} options={STATUS_OPTS} />
          </FormField>
          <FormField label="Role" labelLayout="top">
            <CustomSelect value={roleTop} onChange={setRoleTop} options={ROLE_OPTS} />
          </FormField>
          <FormField label="Search" labelLayout="top">
            <FilterSearchInput value={filterSearch} onChange={e => setFilterSearch(e.target.value)} placeholder="Case ID, typology..." />
          </FormField>
        </div>

        {/* labelLayout="left" */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>labelLayout="left"</div>
          <FormField label="Status" labelLayout="left">
            <CustomSelect value={statusLeft} onChange={setStatusLeft} options={STATUS_OPTS} />
          </FormField>
          <FormField label="Role" labelLayout="left">
            <CustomSelect value={roleLeft} onChange={setRoleLeft} options={ROLE_OPTS} />
          </FormField>
          <FormField labelLayout="left">
            <FilterSearchInput value={filterSearch} onChange={e => setFilterSearch(e.target.value)} placeholder="Search by name or email..." />
          </FormField>
        </div>
      </div>

      {/* Filter bar in-context */}
      <div>
        <div style={{ fontSize: 11, color: T.lightTxt, marginBottom: 8 }}>In-context — filter panel row</div>
        <div style={{ background: T.bgLight, borderRadius: 10, border: `1px solid ${T.border}`, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Filter size={16} style={{ color: COLORS.icon.restMuted, flexShrink: 0 }} />
            <FormField label="Status" labelLayout="left">
              <CustomSelect value={statusLeft} onChange={setStatusLeft} options={STATUS_OPTS} />
            </FormField>
            <FormField label="Role" labelLayout="left">
              <CustomSelect value={roleLeft} onChange={setRoleLeft} options={ROLE_OPTS} />
            </FormField>
            <FormField labelLayout="left" style={{ flex: 2 }}>
              <FilterSearchInput value={filterSearch} onChange={e => setFilterSearch(e.target.value)} placeholder="Search by name or email..." />
            </FormField>
            <div style={{ width: 1, alignSelf: 'stretch', background: COLORS.bg.lighter, flexShrink: 0 }} />
            <Btn variant="dark" icon={UserPlus}>Add User</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DesignConfirmation() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh', background: SURFACE.frame.bg,
      padding: 8, boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    }}>

      {/* ── Top nav ─────────────────────────────────────────────────────────── */}
      <div style={{
        height: SURFACE.nav.height, background: SURFACE.nav.bg, borderRadius: SURFACE.nav.borderRadius,
        border: SURFACE.nav.border,
        boxShadow: SURFACE.nav.shadow,
        display: 'flex', alignItems: 'center',
        paddingLeft: 20, paddingRight: 20, gap: 16,
        marginBottom: 8, boxSizing: 'border-box',
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#A0AEC0', fontSize: 13, fontFamily: 'inherit',
            padding: '6px 12px', borderRadius: 8, transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <ChevronLeft size={16} />
          Dashboard
        </button>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: T.white, letterSpacing: '-0.01em' }}>
          Design System v3 — Style Confirmation
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color: T.lime,
          background: 'rgba(198,255,0,0.1)', padding: '4px 10px',
          borderRadius: 6, letterSpacing: '0.07em', textTransform: 'uppercase',
        }}>
          Preview
        </span>
      </div>

      {/* ── Mobile optimization notice (hidden ≥ 768px via CSS) ─────────────── */}
      <div className="mobile-opt-notice">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: '#D97706', marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8v4m0 4v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p>Dashboard optimised for iPad (768px+). Best experienced on a larger screen.</p>
      </div>

      {/* ── Scrollable content ───────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, #F5F7FA 0%, #EEF1F6 100%)',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 2px 8px rgba(0,0,0,0.03), inset 0 -2px 8px rgba(0,0,0,0.02)',
        padding: SURFACE.content.padding, overflowY: 'auto', maxHeight: 'calc(100vh - 56px - 24px)',
        display: 'flex', flexDirection: 'column', gap: SURFACE.content.gap, boxSizing: 'border-box',
      }}>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1 — Case Header (exact wireframe match)
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>01 — Case Detail Page Header (Wireframe Match)</div>

          <CaseHeader
            breadcrumb={[
              { label: 'Back to Dashboard', onClick: () => {} },
              { label: 'Cases', onClick: () => {} },
              { label: 'CASE-2026-0011', active: true, mono: true },
            ]}
            title="CASE-2026-0011"
            walletAddress="0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f4a5b6c7d"
            chips={[
              { chain: 'ethereum' },
              { label: 'Sanctions Evasion & Layering' },
            ]}
            actions={[
              { variant: 'dark',    icon: SendHorizonal, label: 'Submit for Approval' },
              { variant: 'outline', icon: MessageSquare, label: 'Add Note' },
              { variant: 'danger',  icon: X,             label: 'Close Case' },
              { variant: 'ghost',   icon: MoreHorizontal },
            ]}
            showStatusRow
            status={{ key: 'open', label: 'Open' }}
            statusAction={{ label: 'Mark as Under Review' }}
            risk={{ key: 'critical', label: 'Critical' }}
            assignedTo="James Analyst"
            lead={{ name: 'Sarah Chen' }}
            openedDate="Feb 27, 2026"
            lastUpdated="Feb 27, 2026"
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2 — Typography Scale
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>02 — Typography Scale (as used in header above)</div>

          {[
            { tag: 'H1',    fz: 28, fw: 700, sample: 'CASE-2026-0011',                                       usage: 'Case ID heading',                        mono: false, sora: true },
            { tag: 'H2',    fz: 24, fw: 600, sample: 'My Investigations',                                     usage: 'Page / section headings',                mono: false },
            { tag: 'H3',    fz: 18, fw: 600, sample: 'Cases (12)',                                            usage: 'Card titles, sub-section headers',        mono: false },
            { tag: 'Body',  fz: 14, fw: 400, sample: 'Regular body text for descriptions',                    usage: 'Paragraphs, notes, form labels',          mono: false },
            { tag: 'Small', fz: 13, fw: 400, sample: 'Opened: Feb 27, 2026 · Lead: Sarah Chen',              usage: 'Metadata values, status row text',        mono: false },
            { tag: 'Label', fz: 11, fw: 700, sample: 'ASSIGNED  ·  LAST UPDATED  ·  STATUS',                  usage: 'Metadata keys, section labels (CAPS)',    mono: false },
            { tag: 'Btn',   fz: 13, fw: 500, sample: 'Submit for Approval  /  Add Review Note',               usage: 'Button labels',                          mono: false },
            { tag: 'Code',  fz: 12, fw: 400, sample: '0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f4a5b6c7d',         usage: 'Wallet addresses, hash strings',          mono: true  },
          ].map(({ tag, fz, fw, sample, usage, mono, sora }, i, arr) => (
            <div key={tag} style={{
              display: 'grid', gridTemplateColumns: '44px 86px 1fr minmax(180px,auto)',
              alignItems: 'center', gap: 16, padding: '12px 0',
              borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tag}</span>
              <span style={{ fontSize: 11, color: '#B0B8C8', fontFamily: "'JetBrains Mono', monospace" }}>{fz}px · {fw}</span>
              <span style={{
                fontSize: fz, fontWeight: fw, color: T.darkTxt,
                fontFamily: sora ? "'Sora', sans-serif" : mono ? "'JetBrains Mono', monospace" : 'inherit',
                lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {sample}
              </span>
              <span style={{ fontSize: 12, color: T.lightTxt, fontStyle: 'italic', whiteSpace: 'nowrap' }}>{usage}</span>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3 — Colour Palette
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>03 — Colour Palette (as used in header above)</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Brand</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Swatch hex="#C6FF00" name="Lime — Primary"   usage="Primary creation buttons (New Case, Save)" />
                <Swatch hex="#B8E600" name="Lime Hover"       usage="Primary button hover state" />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Action Buttons</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Swatch hex="#2D3142" name="Dark — CTA"   usage="Submit for Approval (high-priority workflow)" />
                <Swatch hex="#F59E0B" name="Orange — Warning"  usage="Revoke Submission, warning actions" />
                <Swatch hex="#EF4444" name="Red — Danger"      usage="Close Case, Delete, destructive actions" />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Status & Risk</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Swatch hex="#DBEAFE" name="Blue tint — Open"      usage="Open status badge background" />
                <Swatch hex="#1D4ED8" name="Blue — Open text"      usage="Open status badge text" />
                <Swatch hex="#FEE2E2" name="Red tint — Critical"   usage="Critical risk badge background" />
                <Swatch hex="#B91C1C" name="Red — Critical text"   usage="Critical risk badge text" />
                <Swatch hex="#FEF3C7" name="Amber tint — Pending"  usage="Pending Approval badge background" />
                <Swatch hex="#D1FAE5" name="Green tint — Closed"   usage="Closed status badge background" />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Neutrals & Dark Theme</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Swatch hex="#1A1F35" name="Dark Text"      usage="H1, headings, modal titles, gauge values — 22 uses" />
                <Swatch hex="#1B2D58" name="Dark Navy — Surface" usage="Buttons, badges, icon containers, message styling — 16 uses" />
                <Swatch hex="#003C7E" name="Navy Accent"    usage="Card accent bars, active tab indicator — 8 uses" />
                <Swatch hex="#4B5563" name="Body Text"      usage="Metadata values, body copy" />
                <Swatch hex="#717885" name="Light Grey"     usage="Breadcrumb, metadata labels, pipes" />
                <Swatch hex="#E5E7EB" name="Border"         usage="Card borders, row dividers" />
                <Swatch hex="#F5F7FA" name="Bg Light"       usage="Content panel gradient start" />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Surface Gradients</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <GradientSwatch
                  gradient="linear-gradient(160deg, #060C1A 0%, #0C1D3C 55%, #091630 100%)"
                  stops={['#060C1A → #0C1D3C → #091630', '160deg']}
                  name="Dark Navy Frame"
                  usage="Main app shell background — SURFACE.frame.bg"
                />
                <GradientSwatch
                  gradient="linear-gradient(180deg, #F5F6FA 0%, #EAEBF0 60%, #E3E4EA 100%)"
                  stops={['#F5F6FA → #EAEBF0 → #E3E4EA', '180deg']}
                  name="Light Content Surface"
                  usage="Main content body background — SURFACE.content.bodyBg"
                />
              </div>
            </div>

          </div>

          {/* Card Accent Colors — full width */}
          <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>Card Accent Colours</div>

            {/* Case / Report stat cards */}
            <div style={{ fontSize: 11, fontWeight: 600, color: T.bodyTxt, marginBottom: 12, letterSpacing: '0.03em' }}>Case &amp; Report Stat Cards</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
              <Swatch hex="#003C7E" name="All / Summary"        usage="All Cases, All Reports" />
              <Swatch hex="#3B82F6" name="Open / This Month"    usage="Open Cases, My Open Cases" />
              <Swatch hex="#60A5FA" name="My Cases — Lead"   usage="Lead role — COLORS.role.lead.color" />
              <Swatch hex="#A78BFA" name="My Cases — Admin"  usage="Admin role — COLORS.role.admin.color" />
              <Swatch hex="#F59E0B" name="Pending / Flags"      usage="Pending Approval, Flags" />
              <Swatch hex="#F97316" name="High Risk"            usage="High Risk — Reports page" />
              <Swatch hex="#EF4444" name="Critical / Returned"  usage="Critical Alerts, Returned Cases" />
              <Swatch hex="#DC2626" name="Due (SLA)"            usage="SLA breach — urgent" />
              <Swatch hex="#22C55E" name="Closed (team)"        usage="Closed This Month — team view" />
              <Swatch hex="#9CA3AF" name="Closed (analyst)"     usage="Closed This Month — analyst view" />
            </div>

            {/* Wallet / Transaction cards */}
            <div style={{ fontSize: 11, fontWeight: 600, color: T.bodyTxt, marginBottom: 12, letterSpacing: '0.03em' }}>Wallet &amp; Transaction Cards</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
              <Swatch hex="#003C7E" name="All Transactions"  usage="Summary / all tab" />
              <Swatch hex="#10B981" name="Total Inflow"      usage="Inflow tab accent" />
              <Swatch hex="#7C3AED" name="Total Outflow"     usage="Outflow tab accent" />
              <Swatch hex="#F59E0B" name="Flags"             usage="Flagged transactions tab" />
            </div>

            {/* Blockchain network accents */}
            <div style={{ fontSize: 11, fontWeight: 600, color: T.bodyTxt, marginBottom: 12, letterSpacing: '0.03em' }}>Blockchain Network Accents (CaseHeader)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              <Swatch hex="#627EEA" name="Ethereum"  usage="ETH" />
              <Swatch hex="#F7931A" name="Bitcoin"   usage="BTC" />
              <Swatch hex="#05C07A" name="Solana"    usage="SOL" />
              <Swatch hex="#8247E5" name="Polygon"   usage="POL" />
              <Swatch hex="#28A0F0" name="Arbitrum"  usage="ARB" />
              <Swatch hex="#FF0420" name="Optimism"  usage="OP" />
              <Swatch hex="#0052FF" name="Base"      usage="BASE" />
              <Swatch hex="#E84142" name="Avalanche" usage="AVAX" />
              <Swatch hex="#FF060A" name="Tron"      usage="TRX" />
              <Swatch hex="#A6A9AA" name="Litecoin"  usage="LTC" />
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4 — Button System
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>04 — Button System</div>
          <div style={{ fontSize: 12, color: T.lightTxt, marginBottom: 24, lineHeight: 1.7 }}>
            All buttons use <code style={{ fontSize: 11, background: '#F0F1F4', padding: '1px 6px', borderRadius: 4 }}>{'<Btn>'}</code> from{' '}
            <code style={{ fontSize: 11, background: '#F0F1F4', padding: '1px 6px', borderRadius: 4 }}>@/components/core/CaseHeader</code>.
            Props: <code style={{ fontSize: 11, background: '#F0F1F4', padding: '1px 6px', borderRadius: 4 }}>variant</code>{' '}
            <code style={{ fontSize: 11, background: '#F0F1F4', padding: '1px 6px', borderRadius: 4 }}>size</code>{' '}
            <code style={{ fontSize: 11, background: '#F0F1F4', padding: '1px 6px', borderRadius: 4 }}>icon</code>{' '}
            <code style={{ fontSize: 11, background: '#F0F1F4', padding: '1px 6px', borderRadius: 4 }}>active</code>{' '}
            <code style={{ fontSize: 11, background: '#F0F1F4', padding: '1px 6px', borderRadius: 4 }}>disabled</code>.
            Hover and press states are handled internally.
          </div>

          {/* ── A. Filled solid ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>A — Filled</div>

          <BtnRow title="Dark Navy" token='variant="dark"' usage="Highest-priority workflow actions — Submit for Approval, Confirm">
            <Btn variant="dark" size="lg" icon={SendHorizonal}>Submit for Approval</Btn>
            <Btn variant="dark" size="md" icon={SendHorizonal}>Submit</Btn>
            <Btn variant="dark" size="sm">Submit</Btn>
            <Btn variant="dark" disabled>Disabled</Btn>
          </BtnRow>
          <Divider />

          <BtnRow title="Primary — Lime" token='variant="primary"' usage="Positive creation actions — New Case, Save, Create">
            <Btn variant="primary" size="lg" icon={Plus}>Create Case</Btn>
            <Btn variant="primary" size="md" icon={Plus}>New Case</Btn>
            <Btn variant="primary" size="sm">Save</Btn>
            <Btn variant="primary" disabled>Disabled</Btn>
          </BtnRow>
          <Divider />

          {/* ── B. Stroke / Outline ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>B — Stroke / Outline</div>

          <BtnRow title="Outline — Grey" token='variant="outline"' usage="Secondary neutral actions — Add Note, View Details, Print">
            <Btn variant="outline" size="lg" icon={MessageSquare}>Add Review Note</Btn>
            <Btn variant="outline" size="md" icon={Printer}>Print</Btn>
            <Btn variant="outline" size="sm">View Details</Btn>
            <Btn variant="outline" disabled>Disabled</Btn>
          </BtnRow>
          <Divider />

          <BtnRow title="Danger — Red" token='variant="danger"' usage="Irreversible destructive actions — Close Case, Delete, Reject">
            <Btn variant="danger" size="lg" icon={X}>Close Case</Btn>
            <Btn variant="danger" size="md" icon={X}>Delete</Btn>
            <Btn variant="danger" size="sm">Remove</Btn>
            <Btn variant="danger" disabled>Disabled</Btn>
          </BtnRow>
          <Divider />

          <BtnRow title="Secondary — Amber" token='variant="secondary"' usage="Warning-level workflow actions — Revoke, Return, Escalate">
            <Btn variant="secondary" size="lg" icon={RotateCcw}>Revoke Submission</Btn>
            <Btn variant="secondary" size="md" icon={RotateCcw}>Return</Btn>
            <Btn variant="secondary" size="sm">Escalate</Btn>
            <Btn variant="secondary" disabled>Disabled</Btn>
          </BtnRow>
          <Divider />

          {/* ── C. Ghost ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>C — Ghost</div>

          <BtnRow title="Ghost — Label only" token='variant="ghost"' usage="Tertiary text actions — Cancel, Learn More, Dismiss">
            <Btn variant="ghost" size="lg">Cancel</Btn>
            <Btn variant="ghost" size="md">Learn More</Btn>
            <Btn variant="ghost" size="sm">Dismiss</Btn>
            <Btn variant="ghost" disabled>Disabled</Btn>
          </BtnRow>
          <Divider />

          <BtnRow title="Ghost — Icon + Label" token='variant="ghost" icon={...}' usage="Contextual utility actions with visual anchor">
            <Btn variant="ghost" size="md" icon={Search}>Search</Btn>
            <Btn variant="ghost" size="md" icon={Download}>Export</Btn>
            <Btn variant="ghost" size="md" icon={Filter}>Filter</Btn>
            <Btn variant="ghost" size="md" icon={Archive}>Archive</Btn>
          </BtnRow>
          <Divider />

          <BtnRow title="Ghost — Icon only" token='variant="ghost" icon={...}' usage="Compact utility — More options, overflow, settings">
            <Btn variant="ghost" size="lg" icon={MoreHorizontal} />
            <Btn variant="ghost" size="md" icon={MoreHorizontal} />
            <Btn variant="ghost" size="sm" icon={MoreHorizontal} />
            <Btn variant="ghost" icon={Search} />
            <Btn variant="ghost" icon={Pencil} />
            <Btn variant="ghost" icon={Bell} />
          </BtnRow>
          <Divider />

          {/* ── D. Segment ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>D — Segment (Tab Toggle)</div>

          <BtnRow title="Segment" token='variant="segment" active={bool}' usage="Pill toggle group — wrap in a bordered container, pass active prop">
            <SegmentDemo />
          </BtnRow>
          <div style={{ marginTop: 12, fontSize: 11, color: T.lightTxt, background: '#F5F7FA', borderRadius: 8, padding: '10px 14px', lineHeight: 1.6 }}>
            Wrap buttons in:{' '}
            <code style={{ fontSize: 10, background: '#E5E7EB', padding: '1px 6px', borderRadius: 4 }}>{'<div style={{ display:"flex", border:"1px solid #E5E7EB", borderRadius:8, padding:3, gap:2 }}>'}</code>
          </div>
          <Divider />

          {/* ── E. Chip ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>E — Chip (Filter / Tag)</div>

          <BtnRow title="Chip — Label only" token='variant="chip" active={bool}' usage="Toggleable filter tags — click to select/deselect">
            <ChipDemo />
          </BtnRow>
          <div style={{ marginTop: 16 }} />
          <BtnRow title="Chip — Icon + Label" token='variant="chip" icon={...} active={bool}' usage="Filter chips with icon anchor">
            <ChipIconDemo />
          </BtnRow>
          <div style={{ marginTop: 12, fontSize: 11, color: T.lightTxt, background: '#F5F7FA', borderRadius: 8, padding: '10px 14px', lineHeight: 1.6 }}>
            Chip buttons are pill-shaped (<code style={{ fontSize: 10, background: '#E5E7EB', padding: '1px 6px', borderRadius: 4 }}>borderRadius: 20</code>).
            Active state flips to dark navy fill. Use in filter bars, tag selectors, search facets.
          </div>
          <Divider />

          {/* ── F. Link (ActionLink) ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>F — Link</div>

          <BtnRow title="ActionLink" token="<ActionLink>" usage="Inline text link — View explorer, See all, contextual navigation">
            <ActionLink onClick={() => {}}>View full wallet explorer →</ActionLink>
            <ActionLink onClick={() => {}}>See all transactions</ActionLink>
            <ActionLink onClick={() => {}}>Open in new tab <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 2 }} /></ActionLink>
          </BtnRow>
          <div style={{ marginTop: 12, fontSize: 11, color: T.lightTxt, background: '#F5F7FA', borderRadius: 8, padding: '10px 14px', lineHeight: 1.6 }}>
            <code style={{ fontSize: 10, background: '#E5E7EB', padding: '1px 6px', borderRadius: 4 }}>{'<ActionLink onClick={fn}>label</ActionLink>'}</code>{' '}
            — rest: <span style={{ color: '#3B82F6' }}>#3B82F6</span>, hover/press: <span style={{ color: '#0F5A9F' }}>#0F5A9F</span> + underline.
            Use <code style={{ fontSize: 10, background: '#E5E7EB', padding: '1px 6px', borderRadius: 4 }}>GhostIcon</code> for icon-only interactive targets.
          </div>
          <Divider />

          {/* ── G. GhostIcon ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>G — GhostIcon (Icon-only interactive)</div>

          <BtnRow title="GhostIcon" token="<GhostIcon icon={X} size='sm|md|lg' />" usage="Icon-only targets — close, copy, action triggers in tight spaces">
            <GhostIcon icon={X}            size="lg" />
            <GhostIcon icon={Pencil}       size="lg" />
            <GhostIcon icon={MoreHorizontal} size="lg" />
            <GhostIcon icon={X}            size="md" />
            <GhostIcon icon={Pencil}       size="md" />
            <GhostIcon icon={Search}       size="md" />
            <GhostIcon icon={X}            size="sm" />
            <GhostIcon icon={Bell}         size="sm" />
          </BtnRow>
          <div style={{ marginTop: 12, fontSize: 11, color: T.lightTxt, background: '#F5F7FA', borderRadius: 8, padding: '10px 14px', lineHeight: 1.6 }}>
            Sizes: <code style={{ fontSize: 10, background: '#E5E7EB', padding: '1px 6px', borderRadius: 4 }}>sm=16px</code>{' '}
            <code style={{ fontSize: 10, background: '#E5E7EB', padding: '1px 6px', borderRadius: 4 }}>md=20px</code>{' '}
            <code style={{ fontSize: 10, background: '#E5E7EB', padding: '1px 6px', borderRadius: 4 }}>lg=24px</code>.
            Use <code style={{ fontSize: 10, background: '#E5E7EB', padding: '1px 6px', borderRadius: 4 }}>CopyBtn</code> for clipboard targets (handles flash + copied state internally).
          </div>
          <Divider />

          {/* ── H. Size scale ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>H — Size Scale</div>

          {[
            ['lg', '11px 28px', 14, 'Page-level CTAs, hero actions'],
            ['md', '9px 18px',  13, 'Default — header actions, modals'],
            ['sm', '7px 14px',  12, 'Inline, grid rows, compact bars'],
          ].map(([sz, pad, fz, usage]) => (
            <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{ width: 28, textAlign: 'right', fontSize: 11, fontWeight: 600, color: T.lightTxt, fontFamily: "'JetBrains Mono', monospace" }}>{sz}</div>
              <Btn variant="dark" size={sz as 'sm' | 'md' | 'lg'} icon={Plus}>Create Case</Btn>
              <Btn variant="outline" size={sz as 'sm' | 'md' | 'lg'}>View Details</Btn>
              <Btn variant="ghost" size={sz as 'sm' | 'md' | 'lg'} icon={MoreHorizontal} />
              <span style={{ fontSize: 11, color: T.lightTxt, fontStyle: 'italic' }}>pad: {pad} · fz: {fz}px · {usage}</span>
            </div>
          ))}
          <Divider />

          {/* ── I. State reference ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>I — State Reference</div>
          <div style={{ fontSize: 11, color: T.lightTxt, marginBottom: 16 }}>All states are handled internally by <code style={{ fontSize: 10, background: '#F0F1F4', padding: '1px 6px', borderRadius: 4 }}>Btn</code>. Hover the live buttons above to see them. Static reference below:</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { name: 'Dark Navy',     rest: '#1B2D58', hov: '#111F3E', press: '#152244', textColor: '#fff',     border: null },
              { name: 'Primary Lime',  rest: '#0D0D0D', hov: '#1A1A1A', press: '#000000', textColor: '#C6FF00', border: '1px solid rgba(198,255,0,0.22)' },
              { name: 'Outline',       rest: '#FAFBFC', hov: '#F3F4F6', press: '#DBEAFE', textColor: '#1A1F35', border: '1px solid #E5E7EB' },
              { name: 'Danger',        rest: '#FFFFFF', hov: '#FEE2E2', press: '#FECACA', textColor: '#EF4444', border: '1px solid #EF4444' },
              { name: 'Secondary',     rest: '#FFFFFF', hov: '#FEF3C7', press: '#FED7AA', textColor: '#B45309', border: '1px solid #F59E0B' },
              { name: 'Ghost',         rest: 'transparent', hov: 'rgba(123,144,170,0.10)', press: 'rgba(37,99,235,0.10)', textColor: '#4A5568', border: 'none' },
            ].map(v => (
              <div key={v.name} style={{ background: '#F9FAFB', borderRadius: 8, padding: '12px 14px', border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.darkTxt, marginBottom: 10 }}>{v.name}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <StateBox label="Rest"  bg={v.rest}  color={v.textColor} border={v.border ?? undefined} />
                  <StateBox label="Hover" bg={v.hov}   color={v.textColor} border={v.border ?? undefined} />
                  <StateBox label="Press" bg={v.press} color={v.textColor} border={v.border ?? undefined} />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 4, paddingBottom: 2 }}>
                    <span style={{ fontSize: 10, color: T.lightTxt, fontFamily: "'JetBrains Mono', monospace" }}>{v.rest}</span>
                    <span style={{ fontSize: 10, color: T.lightTxt, fontFamily: "'JetBrains Mono', monospace" }}>{v.hov}</span>
                    <span style={{ fontSize: 10, color: T.lightTxt, fontFamily: "'JetBrains Mono', monospace" }}>{v.press}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Divider />

          {/* ── J. In-context examples ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>J — In-Context Action Bars</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: T.lightTxt, marginBottom: 8 }}>Case header — primary workflow</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '14px 18px', background: T.bgLight, borderRadius: 10, border: `1px solid ${T.border}` }}>
                <Btn variant="dark"      icon={SendHorizonal}>Submit for Approval</Btn>
                <Btn variant="outline"   icon={MessageSquare}>Add Note</Btn>
                <Btn variant="danger"    icon={X}>Close Case</Btn>
                <Btn variant="ghost"     icon={MoreHorizontal} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.lightTxt, marginBottom: 8 }}>Report tab — document actions</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '14px 18px', background: T.bgLight, borderRadius: 10, border: `1px solid ${T.border}` }}>
                <SegmentDemo />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <Btn variant="outline" size="sm" icon={Printer}>Print</Btn>
                  <Btn variant="dark"    size="sm" icon={Download}>Export PDF</Btn>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.lightTxt, marginBottom: 8 }}>Filter bar — chip toggles + reset action</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '14px 18px', background: T.bgLight, borderRadius: 10, border: `1px solid ${T.border}`, flexWrap: 'wrap' }}>
                <Btn variant="ghost" size="sm" icon={Filter}>Filters</Btn>
                <div style={{ width: 1, height: 16, background: T.border }} />
                <ChipDemo />
                {/* Reset — dirty state (active) */}
                <button type="button" title="Reset filters (dirty)"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: COLORS.icon.dim, height: COLORS.icon.dim, borderRadius: RADIUS.md, border: 'none', background: 'none', cursor: 'pointer', color: COLORS.icon.active, opacity: 1, transition: 'background 0.15s, color 0.15s', flexShrink: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.icon.activeBg; (e.currentTarget as HTMLButtonElement).style.color = COLORS.icon.activeHover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = COLORS.icon.active; }}
                  onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.button.ghost.bgPress; (e.currentTarget as HTMLButtonElement).style.color = COLORS.icon.press; }}
                  onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.icon.activeBg; (e.currentTarget as HTMLButtonElement).style.color = COLORS.icon.activeHover; }}
                >
                  <RotateCcw size={COLORS.icon.size} />
                </button>
                {/* Reset — rest state (no active filters) */}
                <button type="button" title="Reset filters (rest)"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: COLORS.icon.dim, height: COLORS.icon.dim, borderRadius: RADIUS.md, border: 'none', background: 'none', cursor: 'pointer', color: COLORS.icon.restMuted, opacity: 0.4, transition: 'background 0.15s, color 0.15s, opacity 0.15s', flexShrink: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.icon.mutedBg; (e.currentTarget as HTMLButtonElement).style.color = COLORS.icon.hover; (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = COLORS.icon.restMuted; (e.currentTarget as HTMLButtonElement).style.opacity = '0.4'; }}
                  onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.button.ghost.bgPress; (e.currentTarget as HTMLButtonElement).style.color = COLORS.icon.press; }}
                  onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.icon.mutedBg; (e.currentTarget as HTMLButtonElement).style.color = COLORS.icon.hover; }}
                >
                  <RotateCcw size={COLORS.icon.size} />
                </button>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: T.lightTxt, background: '#F5F7FA', borderRadius: 8, padding: '8px 14px', lineHeight: 1.6 }}>
                Reset button: cobalt + full opacity when filters are <strong>dirty</strong>; muted + 40% opacity at <strong>rest</strong>. Press → <code style={{ fontSize: 10, background: '#E5E7EB', padding: '1px 6px', borderRadius: 4 }}>COLORS.button.ghost.bgPress</code> + <code style={{ fontSize: 10, background: '#E5E7EB', padding: '1px 6px', borderRadius: 4 }}>COLORS.icon.press</code>.
              </div>
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5 — Badges, Tags & Status
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>05 — Badges, Tags & Status Components</div>

          {/* Status chips — md */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 10 }}>Status — size="md" (default, with dot)</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['open','under-review','pending-approval','returned','approved','closed','archived'].map(s => (
                <StatusChip key={s} status={s} />
              ))}
            </div>
          </div>

          {/* Status chips — sm */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 10 }}>Status — size="sm" (compact, for grids &amp; search history)</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {['open','under-review','pending-approval','returned','approved','closed','archived'].map(s => (
                <StatusChip key={s} status={s} size="sm" />
              ))}
            </div>
          </div>

          {/* Status chips — sm no dot */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 10 }}>Status — size="sm" dot=&#123;false&#125; (text-only, ultra compact)</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {['open','under-review','pending-approval','returned','closed'].map(s => (
                <StatusChip key={s} status={s} size="sm" dot={false} />
              ))}
            </div>
          </div>

          {/* Risk chips */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 10 }}>Risk — md &amp; sm variants</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Critical','High','Medium','Low'].map(r => <StatusChip key={r} risk={r} />)}
              </div>
              <span style={{ color: T.border, fontSize: 14 }}>|</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Critical','High','Medium','Low'].map(r => <StatusChip key={r} risk={r} size="sm" />)}
              </div>
            </div>
          </div>

          {/* Chain tags */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 10 }}>Chain Tags (ecosystem colour + icon)</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag chain="ethereum" />
              <Tag chain="bitcoin" />
              <Tag chain="solana" />
              <Tag chain="polygon" />
              <Tag chain="arbitrum" />
              <Tag chain="optimism" />
              <Tag chain="base" />
              <Tag chain="avalanche" />
              <Tag chain="tron" />
              <Tag chain="litecoin" />
            </div>
          </div>

          {/* Typology tags */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 10 }}>Typology Tags (neutral)</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag>Structuring</Tag>
              <Tag>Sanctions Evasion &amp; Layering</Tag>
              <Tag>Mixing</Tag>
              <Tag>Exchange Hack</Tag>
              <Tag>Ransomware</Tag>
            </div>
          </div>

          {/* Status row — replica of header */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 10 }}>Status Row — single line inline (as in header)</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
              padding: '14px 16px', background: T.bgLight, borderRadius: 10, border: `1px solid ${T.border}`,
            }}>
              <StatusChip status="open" />
              <ActionLink>Mark as Under Review</ActionLink>
              <Pipe />
              <StatusChip risk="Critical" />
              <Pipe />
              <span style={{ fontSize: 13, color: T.lightTxt, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Assigned: <GhostIcon icon={User} size="sm" /><span style={{ color: T.bodyTxt, fontWeight: 600 }}>James Analyst</span>
              </span>
              <Pipe />
              <span style={{ fontSize: 13, color: T.lightTxt, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Lead: <GhostIcon icon={User} size="sm" /><span style={{ color: T.bodyTxt, fontWeight: 600 }}>Sarah Chen</span>
                <GhostIcon icon={Pencil} size="md" />
              </span>
              <Pipe />
              <span style={{ fontSize: 13, color: T.lightTxt }}>Opened: <span style={{ color: T.bodyTxt, fontFamily: TYPOGRAPHY.fontMono, fontSize: 12, fontWeight: 500 }}>Feb 27, 2026</span></span>
              <Pipe />
              <span style={{ fontSize: 13, color: T.lightTxt }}>Last Updated: <span style={{ color: T.bodyTxt, fontFamily: TYPOGRAPHY.fontMono, fontSize: 12, fontWeight: 500 }}>Feb 27, 2026</span></span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 6 — Inputs
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>06 — Inputs & Forms</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>

            {/* labelLayout="top" */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.08em' }}>labelLayout="top"</div>

              <FormField label="Case ID / Typology" labelLayout="top">
                <input
                  placeholder="e.g. CASE-2026-0011"
                  style={{ width: '100%', padding: INPUT.padding, borderRadius: INPUT.borderRadius, border: INPUT.border, background: INPUT.bg, fontSize: INPUT.fontSize, outline: 'none', color: INPUT.color, fontFamily: 'inherit', boxSizing: 'border-box', boxShadow: INPUT.shadow, transition: INPUT.transition }}
                  onMouseEnter={(e) => { e.currentTarget.style.border = INPUT.hover.border; e.currentTarget.style.boxShadow = INPUT.hover.shadow; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = INPUT.border; e.currentTarget.style.boxShadow = INPUT.shadow; }}
                  onFocus={(e) => { e.currentTarget.style.border = INPUT.focus.border; e.currentTarget.style.boxShadow = INPUT.focus.shadow; }}
                  onBlur={(e)  => { e.currentTarget.style.border = INPUT.border; e.currentTarget.style.boxShadow = INPUT.shadow; }}
                />
              </FormField>

              <FormField label="Status" labelLayout="top">
                <select style={{ width: '100%', padding: INPUT.select.padding, borderRadius: INPUT.select.borderRadius, border: INPUT.select.border, background: INPUT.select.bg, fontSize: INPUT.select.fontSize, outline: 'none', color: INPUT.select.color, fontFamily: 'inherit', boxSizing: 'border-box', transition: INPUT.transition, cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.border = INPUT.select.hover.border; e.currentTarget.style.boxShadow = INPUT.select.hover.shadow; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = INPUT.select.border; e.currentTarget.style.boxShadow = 'none'; }}
                  onFocus={(e) => { e.currentTarget.style.border = INPUT.select.focus.border; e.currentTarget.style.boxShadow = INPUT.select.focus.shadow; }}
                  onBlur={(e)  => { e.currentTarget.style.border = INPUT.select.border; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <option>All Statuses</option>
                  <option>Open</option>
                  <option>Under Review</option>
                  <option>Pending Approval</option>
                  <option>Closed</option>
                </select>
              </FormField>
            </div>

            {/* labelLayout="left" */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.lightTxt, textTransform: 'uppercase', letterSpacing: '0.08em' }}>labelLayout="left"</div>

              <FormField label="Case ID / Typology" labelLayout="left">
                <input
                  placeholder="e.g. CASE-2026-0011"
                  style={{ width: '100%', padding: INPUT.padding, borderRadius: INPUT.borderRadius, border: INPUT.border, background: INPUT.bg, fontSize: INPUT.fontSize, outline: 'none', color: INPUT.color, fontFamily: 'inherit', boxSizing: 'border-box', boxShadow: INPUT.shadow, transition: INPUT.transition }}
                  onMouseEnter={(e) => { e.currentTarget.style.border = INPUT.hover.border; e.currentTarget.style.boxShadow = INPUT.hover.shadow; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = INPUT.border; e.currentTarget.style.boxShadow = INPUT.shadow; }}
                  onFocus={(e) => { e.currentTarget.style.border = INPUT.focus.border; e.currentTarget.style.boxShadow = INPUT.focus.shadow; }}
                  onBlur={(e)  => { e.currentTarget.style.border = INPUT.border; e.currentTarget.style.boxShadow = INPUT.shadow; }}
                />
              </FormField>

              <FormField label="Status" labelLayout="left">
                <select style={{ width: '100%', padding: INPUT.select.padding, borderRadius: INPUT.select.borderRadius, border: INPUT.select.border, background: INPUT.select.bg, fontSize: INPUT.select.fontSize, outline: 'none', color: INPUT.select.color, fontFamily: 'inherit', boxSizing: 'border-box', transition: INPUT.transition, cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.border = INPUT.select.hover.border; e.currentTarget.style.boxShadow = INPUT.select.hover.shadow; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = INPUT.select.border; e.currentTarget.style.boxShadow = 'none'; }}
                  onFocus={(e) => { e.currentTarget.style.border = INPUT.select.focus.border; e.currentTarget.style.boxShadow = INPUT.select.focus.shadow; }}
                  onBlur={(e)  => { e.currentTarget.style.border = INPUT.select.border; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <option>All Statuses</option>
                  <option>Open</option>
                  <option>Under Review</option>
                  <option>Pending Approval</option>
                  <option>Closed</option>
                </select>
              </FormField>
            </div>

          </div>

          <InputsDemo />

        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 7 — Shadows · Radius · Spacing
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>07 — Shadows · Radius · Spacing</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>

            {/* Shadows */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 14 }}>Shadow Scale</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'Subtle',   shadow: '0 1px 3px rgba(0,0,0,0.05)',  usage: 'Inputs, filter bar' },
                  { name: 'Card',     shadow: '0 1px 4px rgba(0,0,0,0.06)',  usage: 'Stat cards default' },
                  { name: 'Hover',    shadow: '0 2px 6px rgba(0,0,0,0.08)',  usage: 'Card hover state' },
                  { name: 'Floating', shadow: '0 4px 12px rgba(0,0,0,0.15)', usage: 'Dark panels' },
                  { name: 'Panel',    shadow: '0 4px 24px rgba(0,0,0,0.3)',  usage: 'Content area' },
                ].map(({ name, shadow, usage }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 32, borderRadius: 8, background: T.white, border: `1px solid ${T.border}`, boxShadow: shadow, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: T.darkTxt }}>{name}</div>
                      <div style={{ fontSize: 11, color: T.lightTxt }}>{usage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radius */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 14 }}>Border Radius</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { r: 16, name: 'Panels',  usage: 'Sidebar, content, nav bars' },
                  { r: 12, name: 'Cards',   usage: 'Stat cards' },
                  { r: 10, name: 'Inputs',  usage: 'Inputs, selects' },
                  { r:  8, name: 'Buttons', usage: 'All button variants' },
                  { r:  6, name: 'Tags',    usage: 'Outlined typology tags' },
                  { r: 20, name: 'Badges',  usage: 'Status / risk pills' },
                  { r: 50, name: 'Pill',    usage: 'Wallet search input' },
                ].map(({ r, name, usage }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: r >= 20 ? 24 : 32, borderRadius: r, background: '#F3F4F6', border: `1px solid ${T.border}`, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: T.darkTxt }}>{name} — {r}px</div>
                      <div style={{ fontSize: 11, color: T.lightTxt }}>{usage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 14 }}>Spacing Scale</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { n: 4,  usage: 'Icon nudge, inline gap' },
                  { n: 8,  usage: 'Frame padding, panel gap' },
                  { n: 10, usage: 'Badge/chip padding' },
                  { n: 14, usage: 'Status row gap' },
                  { n: 18, usage: 'Breadcrumb → H1 gap' },
                  { n: 20, usage: 'Card padding, search pad' },
                  { n: 32, usage: 'Content area padding' },
                ].map(({ n, usage }) => (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: Math.min(n * 2.5, 80), height: 14, borderRadius: 3, background: T.lime, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: T.darkTxt }}>{n}px</span>
                    <span style={{ fontSize: 11, color: T.lightTxt }}>{usage}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 8 — Card Components
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>08 — Card Components</div>

          {/* StatCards */}
          <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 12 }}>
            StatCard — label + number + accent bar
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
            <StatCard label="Total Cases"   value="847" sub="all time"           accent="#9CA3AF" />
            <StatCard label="High Priority" value="23"  sub="requires attention" accent={T.orange} />
            <StatCard label="Critical Risk" value="7"   sub="immediate action"   accent={T.red} />
            <StatCard label="Resolved"      value="614" sub="this quarter"       accent={T.green} />
          </div>

          {/* MetricCards */}
          <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 12 }}>
            MetricCard — label + number + 5 visualization variants
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: 8, margin: -8, marginBottom: 20 }}>
            <MetricCard label="Risk Score"    value={76} max={100} displayValue="76"  type="gradient-bar" color={T.red} />
            <GaugeMetric label="AI Confidence" value={91} color={T.green} />
            <MetricCard label="Risk Exposure" value={76} max={100} displayValue="76%" type="vertical-bar" color={T.red} />
            <MetricCard label="Hops Traced"   value={7}            displayValue="7"   type="dots"         color={T.red}
              visual={{ total: 7, current: 7 }} />
            <MetricCard label="Chains"        value={3}            displayValue="3"   type="badges"
              visual={{ badges: [
                { label: 'ETH', bg: '#627EEA' },
                { label: 'ARB', bg: '#28A0F0' },
                { label: 'POL', bg: '#8247E5' },
              ]}} />
          </div>

          {/* InfoCards */}
          <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 12 }}>
            InfoCard — icon chip + number + label
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
            <InfoCard icon={Users}         value="12"  label="Active Analysts" iconBg="#EEF2FF" iconColor="#4F46E5" />
            <InfoCard icon={AlertTriangle} value="5"   label="Flagged Wallets" iconBg="#FEF3C7" iconColor="#D97706" />
            <InfoCard icon={Clock}         value="3.2" label="Avg Days Open"   iconBg="#E0F2FE" iconColor="#0284C7" />
          </div>

          {/* DetailsCards */}
          <div style={{ fontSize: 12, fontWeight: 600, color: T.lightTxt, letterSpacing: '0.04em', marginBottom: 12 }}>
            DetailsCard — title + key-value rows
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <DetailsCard
              layout="horizontal"
              title="Risk Indicators"
              items={[
                { label: 'Sanctions', type: 'badge',    badge: 'CLEAR', badgeBg: '#D1FAE5', badgeColor: '#065F46' },
                { label: 'Typology',  type: 'text',     value: 'Structuring'                                      },
                { label: 'Exposure',  type: 'progress', progress: 76,   value: '76%'                              },
              ]}
            />
            <DetailsCard
              layout="horizontal"
              title="On-Chain Summary"
              items={[
                { label: 'First Seen',   type: 'text', value: 'Jan 3, 2024'                   },
                { label: 'Last Active',  type: 'text', value: 'Feb 18, 2026'                  },
                { label: 'Total Volume', type: 'text', value: '284,500 USDT equivalent'        },
                { label: 'Chains', type: 'chips', chips: [
                  { label: 'ETH', color: '#627EEA' },
                  { label: 'ARB', color: '#28A0F0' },
                  { label: 'POL', color: '#8247E5' },
                ]},
              ]}
            />
          </div>
        </div>

        {/* 09 — Search Bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={sectionLabelStyle}>09 — Search Bar</div>

          {/* Dark / nav variant */}
          <div style={{ background: SURFACE.sidebar.bg, padding: '20px 24px', borderRadius: `${SURFACE.sidebar.borderRadius}px ${SURFACE.sidebar.borderRadius}px 0 0` }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>Nav — dark</div>
            <SearchBar placeholder="Search wallet addresses..." />
          </div>

          {/* Light variant */}
          <div style={{ background: SURFACE.content.bodyBg, padding: '20px 24px', borderRadius: `0 0 ${SURFACE.sidebar.borderRadius}px ${SURFACE.sidebar.borderRadius}px`, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B0B8C8', marginBottom: 12 }}>Light variant — dashboard hero &amp; search page</div>
            <div style={{ maxWidth: 676, height: 50 }}>
              <SearchBar variant="light" placeholder="Search wallet address, entity..." />
            </div>

            {/* Token table */}
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['accentColor',             SEARCHBAR.light.accentColor,             'focus stroke · caret · icon focused'],
                ['resting.border',          SEARCHBAR.light.resting.border,          'default border'],
                ['resting.shadow',          SEARCHBAR.light.resting.shadow,          'default shadow'],
                ['hover.border',            SEARCHBAR.light.hover.border,            'hover border'],
                ['hover.shadow',            SEARCHBAR.light.hover.shadow,            'hover shadow'],
                ['focus.border',            SEARCHBAR.light.focus.border,            'focus border'],
                ['focus.shadow',            SEARCHBAR.light.focus.shadow,            'focus ring'],
                ['resting.iconColor',       SEARCHBAR.light.resting.iconColor,       'icon default'],
                ['hover.iconColor',         SEARCHBAR.light.hover.iconColor,         'icon hover'],
                ['focus.iconColor',         SEARCHBAR.light.focus.iconColor,         'icon focused'],
                ['pasteBtn.bg',             SEARCHBAR.light.pasteBtn.bg,             'paste resting bg'],
                ['pasteBtn.hover.bg',       SEARCHBAR.light.pasteBtn.hover.bg,       'paste hover bg'],
                ['pasteBtn.hover.color',    SEARCHBAR.light.pasteBtn.hover.color,    'paste hover text'],
                ['shortcutHint.color',      SEARCHBAR.light.shortcutHint.color,      '⌘K hint text'],
              ].map(([key, val, note]) => {
                const TR = SURFACE.tokenRow as unknown as { bg: string; border: string; borderRadius: number; padding: string | number; labelColor: string; valueColor: string };
                return (
                <div key={key} style={{ background: TR.bg, border: TR.border, borderRadius: TR.borderRadius, padding: TR.padding, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <code style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: TR.labelColor }}>SEARCHBAR.light.{key}</code>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: TR.valueColor, wordBreak: 'break-all' }}>{val}</div>
                  <div style={{ fontSize: 10, color: '#B0B8C8', fontStyle: 'italic' }}>{note}</div>
                </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 10 — Surface Tokens */}
        <div style={{ marginBottom: 32 }}>
          <div style={sectionLabelStyle}>10 — Surface & Layout Tokens</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Frame */}
            <div style={{ background: SURFACE.frame.bg, borderRadius: SURFACE.frame.borderRadius, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>SURFACE.frame</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>bg: dark navy gradient · radius: 16px · padding: 8px</div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Outer shell · dark navy frame</div>
            </div>

            {/* Nav */}
            <div style={{ background: SURFACE.nav.bg, borderRadius: SURFACE.nav.borderRadius, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: SURFACE.nav.border }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>SURFACE.nav</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>bg: {SURFACE.nav.bg} · height: {SURFACE.nav.height}px · radius: {SURFACE.nav.borderRadius}px</div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Top search bar</div>
            </div>

            {/* Sidebar */}
            <div style={{ background: SURFACE.sidebar.bg, borderRadius: SURFACE.sidebar.borderRadius, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>SURFACE.sidebar</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>bg: #0F1628 · width: 56px expanded: 200px · radius: 16px</div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Left nav panel</div>
            </div>

            {/* Content */}
            <div style={{ background: SURFACE.content.bg, borderRadius: SURFACE.content.borderRadius, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: SURFACE.content.shadow }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.dark, marginBottom: 4 }}>SURFACE.content</div>
                <div style={{ fontSize: 12, color: COLORS.text.light, fontFamily: "'JetBrains Mono', monospace" }}>bg: F5F7FA→EEF1F6 · padding: 32px · gap: 20px · radius: 16px</div>
              </div>
              <div style={{ fontSize: 11, color: COLORS.text.light, fontStyle: 'italic' }}>Main white area</div>
            </div>

            {/* Card */}
            <div style={{ background: SURFACE.card.bg, borderRadius: SURFACE.card.borderRadius, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: SURFACE.card.border, boxShadow: SURFACE.card.shadow }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.dark, marginBottom: 4 }}>SURFACE.card</div>
                <div style={{ fontSize: 12, color: COLORS.text.light, fontFamily: "'JetBrains Mono', monospace" }}>bg: #FFFFFF · padding: 32px · gap: 24px · radius: 20px</div>
              </div>
              <div style={{ fontSize: 11, color: COLORS.text.light, fontStyle: 'italic' }}>Section cards</div>
            </div>

          </div>
        </div>

        {/* 11 — Sidebar Panel */}
        <div style={{ marginBottom: 32 }}>
          <div style={sectionLabelStyle}>11 — Sidebar Panel</div>
          <div style={{ background: SURFACE.frame.bg, borderRadius: SURFACE.frame.borderRadius, padding: 16, display: 'flex', gap: 8 }}>

            {/* Sidebar mock */}
            <div style={{ width: SURFACE.sidebar.width, background: SURFACE.sidebar.bg, borderRadius: SURFACE.sidebar.borderRadius, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${SURFACE.sidebar.paddingY}px ${SURFACE.sidebar.paddingX}px`, gap: 4, flexShrink: 0 }}>
              {/* Logo */}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#C6FF00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#0A0A0F' }}>t·</span>
              </div>
              {/* Nav icons */}
              {['⊞', '⊕', '◫', '☰'].map((icon, i) => (
                <div key={i} style={{ width: 40, height: 40, borderRadius: RADIUS.md, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: i === 0 ? SURFACE.sidebar.iconColorActive : SURFACE.sidebar.iconColor, background: i === 0 ? SURFACE.sidebar.iconBgActive : 'transparent', cursor: 'pointer' }}>{icon}</div>
              ))}
              {/* Spacer */}
              <div style={{ flex: 1 }} />
              <div style={{ width: '80%', height: 1, background: SURFACE.sidebar.divider, margin: '8px 0' }} />
              {/* Bottom icons */}
              {['🔔', '⚙', '→'].map((icon, i) => (
                <div key={i} style={{ width: 40, height: 40, borderRadius: RADIUS.md, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: SURFACE.sidebar.iconColor, cursor: 'pointer', position: 'relative' }}>
                  {icon}
                  {i === 0 && <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1.5px solid #0F1628' }} />}
                </div>
              ))}
              {/* Avatar */}
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#C6FF00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0A0A0F', marginTop: 4 }}>JA</div>
            </div>

            {/* Notification panel mock */}
            <div style={{ width: 280, background: SURFACE.frame.bg, borderRadius: SURFACE.sidebar.borderRadius, overflow: 'hidden', border: SURFACE.nav.border }}>
              <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>Notifications</span>
                <span style={{ fontSize: 12, color: '#C6FF00', cursor: 'pointer', fontWeight: 500 }}>Mark all read</span>
              </div>
              {[
                { color: '#EF4444', msg: 'Case #CASE-001 escalated to Critical', time: '5 minutes ago' },
                { color: '#F59E0B', msg: 'New compliance flag on 0x4f2a...9e1b', time: '1 hour ago' },
                { color: '#3B82F6', msg: 'Analysis complete — CASE-2026-0011', time: '2 hours ago' },
              ].map((n, i) => (
                <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, boxShadow: `0 0 8px ${n.color}88`, flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>{n.msg}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace" }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 13 — Callout / Alert Note Token
        ═══════════════════════════════════════════════════════════════════ */}
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>13 — Callout · Alert Note Variants</div>
          <p style={{ fontSize: 12, color: T.lightTxt, marginBottom: 20, lineHeight: 1.6 }}>
            Token: <code style={{ fontFamily: 'monospace', background: T.bgLight, padding: '1px 6px', borderRadius: 4 }}>CALLOUT.variants[severity]</code> — severity: <strong>info</strong> · <strong>success</strong> · <strong>warning</strong> · <strong>critical</strong>.<br />
            Severity is driven by risk score or system state — never hardcode colours.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                severity: 'info',
                label: '✦ AI Summary · info',
                usage: 'Neutral AI insight, system note — indigo',
                body: 'The wallet exhibits a sophisticated layering pattern consistent with sanctions evasion. Cross-chain bridging via Hop Protocol detected.',
              },
              {
                severity: 'success',
                label: '✔ Compliance Cleared · success',
                usage: 'Case cleared, no flags, low risk — green',
                body: 'Wallet activity is consistent with normal retail behaviour. No sanctions matches, typology flags, or unusual volume patterns detected.',
              },
              {
                severity: 'warning',
                label: '⚠ Attention Required · warning',
                usage: 'Moderate risk, review recommended — amber',
                body: 'Elevated transaction frequency detected. Some cross-chain activity noted. Manual review recommended before progressing to approval.',
              },
              {
                severity: 'critical',
                label: '✕ Critical Finding · critical',
                usage: 'High risk, immediate action needed — red',
                body: 'Direct 2-hop connection to OFAC-sanctioned address confirmed. Immediate escalation and SAR filing are required.',
              },
            ].map(({ severity, label, usage, body }, i, arr) => (
              <div key={severity}>
                <div style={{ fontSize: 12, color: T.lightTxt, marginBottom: 6 }}>
                  <code style={{ fontFamily: 'monospace', background: T.bgLight, padding: '1px 6px', borderRadius: 4, marginRight: 8 }}>severity="{severity}"</code>
                  <span style={{ fontStyle: 'italic' }}>{usage}</span>
                </div>
                <Callout severity={severity as 'info' | 'success' | 'warning' | 'critical'} label={label}>{body}</Callout>
                {i < arr.length - 1 && <div style={{ height: 1, background: T.border, marginTop: 16 }} />}
              </div>
            ))}
          </div>

          {/* Token swatches */}
          <div style={{ marginTop: 24, padding: 16, background: T.bgLight, borderRadius: 10, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.darkTxt, marginBottom: 10 }}>Token reference — CALLOUT.variants</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {(Object.entries(CALLOUT.variants) as [string, { bg: string; border: string; accent: string; labelColor: string; textColor: string }][]).map(([key, v]) => (
                <div key={key} style={{ padding: '8px 10px', background: v.bg, border: v.border, borderRadius: 8, borderLeft: `${(CALLOUT as unknown as { accentWidth: number }).accentWidth}px solid ${v.accent}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: v.labelColor, textTransform: 'uppercase' }}>{key}</div>
                  <div style={{ fontSize: 10, color: v.textColor, marginTop: 2, fontFamily: 'monospace' }}>{v.accent}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 12 — Table / Data Grid Token System
        ═══════════════════════════════════════════════════════════════════ */}
        {(() => {
          const MOCK_ROWS = [
            { id: 'CASE-2026-0011', wallet: '0x7a3d...6c7d', riskLevel: 'Critical', riskScore: 95, typology: 'Sanctions Evasion',  lead: 'Sarah Chen',  status: 'open',             updated: '2026-03-01' },
            { id: 'CASE-2026-0008', wallet: '0x3f1a...9e2b', riskLevel: 'High',     riskScore: 78, typology: 'Layering',           lead: 'James Lee',   status: 'under-review',     updated: '2026-02-28' },
            { id: 'CASE-2026-0005', wallet: '0xb2c4...1a3f', riskLevel: 'Medium',   riskScore: 54, typology: 'Structuring',        lead: null,          status: 'pending-approval', updated: '2026-02-25' },
            { id: 'CASE-2026-0002', wallet: '0x9d7e...4b8c', riskLevel: 'Low',      riskScore: 28, typology: 'Unusual Activity',   lead: 'Priya Nair',  status: 'closed',           updated: '2026-02-20' },
          ];

          const COLS = [
            { key: 'id',        label: 'Case ID',    type: 'monoId'  },
            { key: 'wallet',    label: 'Wallet',     type: 'mono'    },
            { key: 'riskLevel', label: 'Risk Level', type: 'riskDot' },
            { key: 'riskScore', label: 'Score',
              render: (v: unknown): ReactNode => {
                const n = v as number;
                const color = n >= 90 ? '#EF4444' : n >= 70 ? '#F97316' : n >= 50 ? '#F59E0B' : '#22C55E';
                return <span style={{ ...(TABLE.cell.numeric as React.CSSProperties), color }}>{String(n)}</span>;
              },
            },
            { key: 'typology',  label: 'Typology',   type: 'plain'   },
            { key: 'lead',      label: 'Lead',
              render: (v: unknown): ReactNode => v
                ? <span style={TABLE.cell.plain as React.CSSProperties}>{String(v)}</span>
                : <span style={{ ...(TABLE.cell.muted as React.CSSProperties), display: 'inline-flex', alignItems: 'center', gap: 4 }}>Unassigned</span>,
            },
            { key: 'status',    label: 'Status',    render: (v: unknown): ReactNode => <StatusChip status={String(v)} size="sm" /> },
            { key: 'updated',   label: 'Updated',    type: 'mono'    },
          ];

          return (
            <div style={cardStyle}>
              <div style={sectionLabelStyle}>12 — Data Grid · Density Variants &amp; Cell Types</div>

              {/* Cell type token reference chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {Object.keys(TABLE.cell).map((key) => (
                  <span key={key} style={{ background: '#F5F7FA', border: '1px solid #ECEEF2', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#717A8C', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    {key === 'riskDot' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />}
                    type="{key}"
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#B0B8C8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Compact (default)</div>
                  <Table columns={COLS} data={MOCK_ROWS} density="compact" />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#B0B8C8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Relaxed</div>
                  <Table columns={COLS} data={MOCK_ROWS} density="relaxed" />
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── 13 — Menu Item States ─────────────────────────────────────────── */}
        {(() => {
          const MI = SURFACE.menuItem as unknown as Record<string, unknown> & {
            default: Record<string, unknown>; hover: Record<string, unknown>; press: Record<string, unknown>;
            danger: { default: Record<string, unknown>; press: Record<string, unknown> };
            padding: string; borderRadius: number; fontSize: number; gap: number; marginBottom: number; transition: string;
          };
          interface LiveMenuItemProps { label: string; icon?: React.ComponentType<{ size?: number }>; stateOverride?: string; danger?: boolean }
          function LiveMenuItem({ label, icon: Icon, stateOverride, danger }: LiveMenuItemProps) {
            const [hov, setHov] = useState(false);
            const [pressed, setPressed] = useState(false);
            const s = stateOverride ?? (pressed ? 'press' : hov ? 'hover' : 'default');
            const bg = (s === 'press'
              ? (danger ? MI.danger.press.bg   : MI.press.bg)
              : s === 'hover' ? MI.hover.bg : MI.default.bg) as string;
            const color  = (danger ? MI.danger.default.color : s === 'press' ? MI.press.color : MI.default.color) as string;
            const weight = (s === 'press' ? MI.press.fontWeight : MI.default.fontWeight) as number;
            const shift  = (s === 'hover' ? MI.hover.transform : 'translateX(0)') as string;
            return (
              <button
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => { setHov(false); setPressed(false); }}
                onMouseDown={e => { e.preventDefault(); setPressed(true); }}
                onMouseUp={() => setPressed(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: MI.gap,
                  width: '100%', padding: MI.padding, borderRadius: MI.borderRadius, marginBottom: MI.marginBottom,
                  fontSize: MI.fontSize, fontWeight: weight, color,
                  background: stateOverride ? bg : undefined,
                  backgroundColor: !stateOverride ? bg : undefined,
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit', transform: shift, transition: MI.transition,
                }}
              >
                {Icon && <Icon size={14} />}
                {label}
              </button>
            );
          }

          const tokenRow = (key: string, val: unknown): ReactNode => (
            <div key={key} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 11 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#6B7280', minWidth: 120 }}>{key}</span>
              {typeof val === 'string' && val.startsWith('#') && (
                <span style={{ width: 14, height: 14, borderRadius: 3, background: val, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
              )}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1A1F35', fontWeight: 500 }}>{String(val)}</span>
            </div>
          );

          return (
            <div style={cardStyle}>
              <div style={sectionLabelStyle}>13 — Menu Item · States &amp; Tokens</div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Live interactive demo */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.lightTxt, marginBottom: 10 }}>Live — hover &amp; press me</div>
                  <div style={{
                    background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                  }}>
                    <div style={{ padding: '10px 14px 8px', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B0B8C8' }}>
                      Actions
                    </div>
                    <div style={{ padding: 6 }}>
                      <LiveMenuItem label="Archive Case" icon={Archive} />
                      <LiveMenuItem label="Delete Case" icon={X} danger />
                    </div>
                  </div>
                </div>

                {/* Token reference columns */}
                <div style={{ flex: 2, minWidth: 360 }}>
                  {[
                    { label: 'Default', stateKey: 'default', vals: MI.default },
                    { label: 'Hover',   stateKey: 'hover',   vals: MI.hover   },
                    { label: 'Press',   stateKey: 'press',   vals: MI.press   },
                    { label: 'Danger · default', stateKey: 'danger.default', vals: MI.danger.default },
                    { label: 'Danger · press',   stateKey: 'danger.press',   vals: MI.danger.press   },
                  ].map(({ label: _label, stateKey, vals }) => (
                    <div key={stateKey} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 6 }}>
                        SURFACE.menuItem.{stateKey}
                      </div>
                      <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {Object.entries(vals).map(([k, v]) => tokenRow(k, v))}
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 6 }}>
                      SURFACE.menuItem · layout
                    </div>
                    <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {['padding','borderRadius','fontSize','gap','marginBottom','transition'].map(k => tokenRow(k, (MI as Record<string, unknown>)[k]))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── 14 — Tab Strip States ─────────────────────────────────────────── */}
        {(() => {
          const TS = SURFACE.header.tabStrip as unknown as {
            tabPaddingX: number; tabPaddingY: number; fontSize: number; marginTop: number;
            default: Record<string, unknown>; hover: Record<string, unknown>; press: Record<string, unknown>; active: Record<string, unknown>;
          } & Record<string, unknown>;
          interface LiveTabProps { label: string; forceActive?: boolean; forceState?: string }
          function LiveTab({ label, forceActive, forceState }: LiveTabProps) {
            const [hov, setHov] = useState(false);
            const [pressed, setPressed] = useState(false);
            const isActive = forceActive;
            const s = forceState ?? (isActive ? 'active' : pressed ? 'press' : hov ? 'hover' : 'default');
            return (
              <button
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => { setHov(false); setPressed(false); }}
                onMouseDown={() => setPressed(true)}
                onMouseUp={() => setPressed(false)}
                style={{
                  padding: `${TS.tabPaddingY}px ${TS.tabPaddingX}px`,
                  fontSize: TS.fontSize,
                  fontWeight: (isActive ? TS.active.fontWeight : TS.default.fontWeight) as number,
                  color: (isActive ? TS.active.color : s === 'hover' ? TS.hover.color : TS.default.color) as string,
                  background: (s === 'press' ? TS.press.bg : s === 'hover' && !isActive ? TS.hover.bg : 'transparent') as string,
                  borderRadius: (s === 'hover' && !isActive ? TS.hover.borderRadius : 0) as number,
                  border: 'none', outline: 'none',
                  borderBottom: isActive ? `2px solid ${TS.active.indicator as string}` : '2px solid transparent',
                  marginBottom: -1, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'color 0.15s, background 0.12s, border-color 0.15s',
                }}
              >
                {label}
              </button>
            );
          }

          const states = [
            { label: 'default', vals: TS.default },
            { label: 'hover',   vals: TS.hover   },
            { label: 'press',   vals: TS.press   },
            { label: 'active',  vals: TS.active  },
          ];

          return (
            <div style={cardStyle}>
              <div style={sectionLabelStyle}>14 — Tab Strip · States &amp; Tokens</div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Live strip demo */}
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.lightTxt, marginBottom: 10 }}>Live — hover &amp; press tabs</div>
                  <div style={{ background: '#FFFFFF', borderRadius: 8, padding: '16px 20px', border: '1px solid #ECEEF2' }}>
                    <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
                      {['Overview','Transactions','Analysis','Report'].map((tab, i) => (
                        <LiveTab key={tab} label={tab} forceActive={i === 0} />
                      ))}
                    </div>
                  </div>

                  {/* Frozen state swatches */}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: T.lightTxt, marginBottom: 8 }}>Frozen states</div>
                    {states.map(({ label }) => (
                      <div key={label} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#9CA3AF', minWidth: 52 }}>{label}</span>
                        <div style={{ background: '#FFFFFF', borderRadius: 6, border: '1px solid #ECEEF2', display: 'flex', borderBottom: `1px solid ${T.border}`, overflow: 'hidden' }}>
                          <LiveTab label="Tab" forceActive={label === 'active'} forceState={label} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Token reference */}
                <div style={{ flex: 2, minWidth: 360 }}>
                  {states.map(({ label, vals }) => (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 6 }}>
                        SURFACE.header.tabStrip.{label}
                      </div>
                      <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {Object.entries(vals).map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 11 }}>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#6B7280', minWidth: 100 }}>{k}</span>
                            {typeof v === 'string' && (v.startsWith('#') || v.startsWith('rgba')) && (
                              <span style={{ width: 14, height: 14, borderRadius: 3, background: v, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
                            )}
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1A1F35', fontWeight: 500 }}>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 6 }}>
                      SURFACE.header.tabStrip · layout
                    </div>
                    <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {['marginTop','tabPaddingX','tabPaddingY','fontSize'].map(k => (
                        <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 11 }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#6B7280', minWidth: 100 }}>{k}</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1A1F35', fontWeight: 500 }}>{String((TS as Record<string, unknown>)[k])}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── 15 — Toast ────────────────────────────────────────────────────── */}
        {(() => {
          type ToastToken = { padding: string; borderRadius: number; fontSize: number; fontWeight: number; shadow: string; variants: Record<string, { bg: string; color: string }> };
          const TK = TOAST as unknown as ToastToken;
          const variants = [
            { key: 'success', icon: '✓', message: 'Case assigned successfully.' },
            { key: 'error',   icon: '✕', message: 'Failed to submit. Please try again.' },
            { key: 'info',    icon: 'ℹ', message: 'Analysis queued — results in ~2 min.' },
          ];
          return (
            <div style={{ ...cardStyle, marginBottom: 28 }}>
              <div style={{ ...sectionLabelStyle, marginBottom: 20 }}>15 — Toast</div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {/* Live demos */}
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 12 }}>
                    Live variants
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {variants.map(({ key, icon, message }) => (
                      <div key={key} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        padding: TK.padding,
                        borderRadius: TK.borderRadius,
                        fontSize: TK.fontSize,
                        fontWeight: TK.fontWeight,
                        boxShadow: TK.shadow,
                        background: TK.variants[key].bg,
                        color: TK.variants[key].color,
                        alignSelf: 'flex-start',
                      }}>
                        <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
                        <span>{message}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Token reference */}
                <div style={{ flex: 2, minWidth: 320 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 12 }}>
                    Token reference
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 6 }}>
                      TOAST · base
                    </div>
                    <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {['borderRadius','padding','fontSize','fontWeight','shadow'].map(k => (
                        <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 11 }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#6B7280', minWidth: 110 }}>{k}</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1A1F35', fontWeight: 500 }}>{String((TK as unknown as Record<string, unknown>)[k])}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {variants.map(({ key }) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 6 }}>
                        TOAST.variants.{key}
                      </div>
                      <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {Object.entries(TK.variants[key]).map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 11 }}>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#6B7280', minWidth: 50 }}>{k}</span>
                            <span style={{ width: 14, height: 14, borderRadius: 3, background: v, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1A1F35', fontWeight: 500 }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── 16 — Dashboard Widgets ─────────────────────────────────────────── */}
        {(() => {
          type DashWidgetToken = { title: React.CSSProperties; action: React.CSSProperties; actionHover: React.CSSProperties };
          type StatCardToken = { label: React.CSSProperties; number: React.CSSProperties; bar: { width: number; borderRadius: number }; accentColors: Record<string, string> };
          type EmptyStateToken = { wrapper: React.CSSProperties; icon: { size: number; color: string }; title: React.CSSProperties; subtitle: React.CSSProperties };
          const DW = DASH_WIDGET as unknown as DashWidgetToken;
          const SC = STAT_CARD as unknown as StatCardToken;
          const ES = EMPTY_STATE as unknown as EmptyStateToken;
          const RISK_COLOR: Record<string, string> = { Critical: '#EF4444', High: '#F97316', Medium: '#F59E0B', Low: '#22C55E' };
          const sep = TABLE.row.borderBottom as string;

          // Sub-component interfaces
          interface WidgetProps { title: string; actionLabel?: string; children: ReactNode }
          interface StatCardDemoProps { label: string; value: string | number; accent: string }
          interface ActivityRowDemoProps { text: string; when: string; dot?: string; last?: boolean }
          interface MetricBarDemoProps { label: string; count: number; max: number; color: string }
          interface KPIBarDemoProps { label: string; value: string; pct: number; color: string }
          interface VelocityBarDemoProps { day: string; count: number; max: number }
          interface WorkloadRowDemoProps { name: string; open: number; pending: number; returned: number; initials: string; color: string; last?: boolean }
          interface CaseRowDemoProps { id: string; typology: string; risk: string; sub?: string; last?: boolean }
          interface AuditRowDemoProps { actor: string; action: string; role: string; when: string; dotColor: string; last?: boolean }
          interface QuickActionDemoProps { IconComp: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; label: string; desc: string; color: string; bg: string; border: string }
          interface WidgetFooterProps { icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color?: string; text: string }
          interface TRProps { label: string; val: unknown }
          interface TokenBlockProps { heading: string; pairs: [string, unknown][] }

          // ── Shared shell ──────────────────────────────────────────────────────
          function Widget({ title, actionLabel, children }: WidgetProps) {
            const [hov, setHov] = useState(false);
            return (
              <div style={{ background: SURFACE.panel.bg, borderRadius: SURFACE.panel.borderRadius, border: SURFACE.panel.border, boxShadow: SURFACE.panel.shadow, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: sep, flexShrink: 0 }}>
                  <span style={DW.title}>{title}</span>
                  {actionLabel && (
                    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                      style={{ ...DW.action, ...(hov ? DW.actionHover : {}) }}>
                      {actionLabel}
                    </button>
                  )}
                </div>
                {children}
              </div>
            );
          }

          // ── Content patterns ──────────────────────────────────────────────────

          // 1. StatCard — label + number + left bar
          function StatCardDemo({ label, value, accent }: StatCardDemoProps) {
            return (
              <div style={{ flex: 1, background: '#F8F9FB', borderRadius: 10, border: '1px solid #ECEEF2', padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: SC.bar.width, alignSelf: 'stretch', flexShrink: 0, background: accent, borderRadius: SC.bar.borderRadius }} />
                  <div>
                    <div style={SC.label}>{label}</div>
                    <div style={SC.number}>{value}</div>
                  </div>
                </div>
              </div>
            );
          }

          // 2. ActivityRow — dot + text + timestamp
          function ActivityRowDemo({ text, when, dot = '#D1D5DB', last }: ActivityRowDemoProps) {
            return (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 16px', borderBottom: last ? 'none' : sep }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0, marginTop: 4 }} />
                <span style={{ fontSize: 12, color: '#4B5563', flex: 1, lineHeight: 1.5 }}>{text}</span>
                <span style={{ fontSize: 11, color: '#B0B8C8', flexShrink: 0 }}>{when}</span>
              </div>
            );
          }

          // 3. MetricBar — horizontal fill bar
          function MetricBarDemo({ label, count, max, color }: MetricBarDemoProps) {
            const w: number | string = count === 0 ? 3 : `${Math.max((count / max) * 100, 6)}%`;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color, width: 56, flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                  <div style={{ height: 8, borderRadius: 999, background: color, width: w }} />
                </div>
                <span style={{ fontSize: 12, color: '#6B7280', width: 20, textAlign: 'right', flexShrink: 0 }}>{count}</span>
              </div>
            );
          }

          // 4. Compliance KPI bar — label + value right + bar
          function KPIBarDemo({ label, value, pct, color }: KPIBarDemoProps) {
            return (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
                </div>
                <div style={{ background: '#F3F4F6', borderRadius: 999, height: 8 }}>
                  <div style={{ height: 8, borderRadius: 999, background: color, width: `${pct}%` }} />
                </div>
              </div>
            );
          }

          // 5. Case Velocity — day + mini bar
          function VelocityBarDemo({ day, count, max }: VelocityBarDemoProps) {
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                <span style={{ fontSize: 11, color: '#9CA3AF', width: 26, flexShrink: 0 }}>{day}</span>
                <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 999, height: 8 }}>
                  <div style={{ height: 8, borderRadius: 999, background: '#A5B4FC', width: count === 0 ? 3 : `${(count / max) * 100}%` }} />
                </div>
                <span style={{ fontSize: 11, color: '#6B7280', width: 14, textAlign: 'right', flexShrink: 0 }}>{count}</span>
              </div>
            );
          }

          // 6. Team Workload row — avatar + stacked bar
          function WorkloadRowDemo({ name, open, pending, returned, initials, color, last }: WorkloadRowDemoProps) {
            const total = open + pending + returned;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: last ? 'none' : sep }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${color}26`, border: `1.5px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color }}>{initials}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{name}</span>
                    <span style={{ fontSize: 10, color: '#9CA3AF' }}>{total}</span>
                  </div>
                  <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', background: '#F3F4F6' }}>
                    {open     > 0 && <div style={{ flex: open,     background: '#93C5FD' }} />}
                    {pending  > 0 && <div style={{ flex: pending,  background: '#FCD34D' }} />}
                    {returned > 0 && <div style={{ flex: returned, background: '#FCA5A5' }} />}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                    <span style={{ fontSize: 10, color: '#93C5FD' }}>{open} open</span>
                    {pending  > 0 && <span style={{ fontSize: 10, color: '#F59E0B' }}>{pending} pending</span>}
                    {returned > 0 && <span style={{ fontSize: 10, color: '#EF4444' }}>{returned} returned</span>}
                  </div>
                </div>
              </div>
            );
          }

          // 7. Case row — left border accent + id + typology + chip
          function CaseRowDemo({ id, typology, risk, sub, last }: CaseRowDemoProps) {
            const [hov, setHov] = useState(false);
            const bc = RISK_COLOR[risk] ?? '#F59E0B';
            return (
              <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px 10px 13px', borderBottom: last ? 'none' : sep, borderLeft: `3px solid ${bc}`, background: hov ? TABLE.row.hoverBg : 'none', cursor: 'pointer' }}>
                <span style={{ ...(TABLE.cell.monoId as React.CSSProperties), flexShrink: 0 }}>{id}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{typology}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: bc, background: `${bc}18`, padding: '2px 7px', borderRadius: 20 }}>{risk}</span>
                  {sub && <span style={{ fontSize: 11, color: bc }}>{sub}</span>}
                  <ChevronRight size={12} style={{ color: '#D1D5DB' }} />
                </div>
              </div>
            );
          }

          // 8. Audit Trail row — dot + actor + action + role + time
          function AuditRowDemo({ actor, action, role, when, dotColor, last }: AuditRowDemoProps) {
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 5fr 2fr 2fr', alignItems: 'center', padding: '10px 16px', borderBottom: last ? 'none' : sep }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{actor}</span>
                </div>
                <span style={{ fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{action}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{role}</span>
                <span style={{ fontSize: 11, color: '#B0B8C8', textAlign: 'right' }}>{when}</span>
              </div>
            );
          }

          // 9. Admin Quick Action card
          function QuickActionDemo({ IconComp, label, desc, color, bg, border }: QuickActionDemoProps) {
            const [hov, setHov] = useState(false);
            return (
              <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ background: SURFACE.panel.bg, border: SURFACE.panel.border, borderRadius: SURFACE.panel.borderRadius, boxShadow: hov ? '0 4px 16px rgba(0,0,0,0.10)' : SURFACE.panel.shadow, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, width: '100%', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 40, height: 40, borderRadius: RADIUS.md, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconComp size={16} style={{ color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{label}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>{desc}</p>
                </div>
                <ChevronRight size={14} style={{ color: '#D1D5DB', flexShrink: 0 }} />
              </button>
            );
          }

          // 10. EmptyState
          function EmptyStateDemo() {
            return (
              <div style={ES.wrapper}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={ES.icon.size} style={{ color: ES.icon.color.replace('#D1D5DB', '#22C55E') }} />
                </div>
                <p style={ES.title}>All clear</p>
                <p style={ES.subtitle}>No returned or critical cases right now</p>
              </div>
            );
          }

          // ── Widget widget footer ───────────────────────────────────────────────
          function WidgetFooter({ icon: IconComp, color = '#D1D5DB', text }: WidgetFooterProps) {
            return (
              <div style={{ padding: '10px 16px', borderTop: sep, display: 'flex', alignItems: 'center', gap: 6 }}>
                {IconComp && <IconComp size={11} style={{ color }} />}
                <span style={{ fontSize: 11, color: color === '#D1D5DB' ? '#9CA3AF' : color, fontWeight: color !== '#D1D5DB' ? 600 : 400 }}>{text}</span>
              </div>
            );
          }

          // ── Token row util (local) ─────────────────────────────────────────────
          function TR({ label, val }: TRProps) {
            const isColor = typeof val === 'string' && (val.startsWith('#') || val.startsWith('rgba'));
            return (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 11 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#6B7280', minWidth: 120 }}>{label}</span>
                {isColor && <span style={{ width: 14, height: 14, borderRadius: 3, background: val, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1A1F35', fontWeight: 500 }}>{String(val)}</span>
              </div>
            );
          }
          function TokenBlock({ heading, pairs }: TokenBlockProps) {
            return (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 6 }}>{heading}</div>
                <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {pairs.map(([k, v]) => <TR key={k} label={k} val={v} />)}
                </div>
              </div>
            );
          }

          // ─────────────────────────────────────────────────────────────────────
          return (
            <div style={{ ...cardStyle, marginBottom: 28 }}>
              <div style={{ ...sectionLabelStyle, marginBottom: 20 }}>16 — Dashboard Widgets</div>

              {/* ── Row 1: DashWidget shell + StatCard ────────────────────── */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 12 }}>
                A · DashWidget shell + StatCard
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <Widget title="Open Cases" actionLabel="View all">
                    <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
                      <StatCardDemo label="Open"     value={24} accent={SC.accentColors.orange} />
                      <StatCardDemo label="Critical" value={6}  accent={SC.accentColors.red}    />
                      <StatCardDemo label="Closed"   value={18} accent={SC.accentColors.grey}   />
                    </div>
                  </Widget>
                </div>
                <div style={{ flex: 2, minWidth: 320 }}>
                  <TokenBlock heading="DASH_WIDGET.title"       pairs={Object.entries(DW.title)} />
                  <TokenBlock heading="DASH_WIDGET.action"      pairs={Object.entries(DW.action).filter(([k]) => !['display','alignItems','cursor','fontFamily','outline','flexShrink'].includes(k))} />
                  <TokenBlock heading="DASH_WIDGET.actionHover" pairs={Object.entries(DW.actionHover)} />
                  <TokenBlock heading="STAT_CARD.label"         pairs={Object.entries(SC.label)} />
                  <TokenBlock heading="STAT_CARD.number"        pairs={Object.entries(SC.number)} />
                  <TokenBlock heading="STAT_CARD.accentColors"  pairs={Object.entries(SC.accentColors)} />
                </div>
              </div>

              {/* ── Row 2: ActivityRow ────────────────────────────────────── */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 12 }}>
                B · Activity Row (timeline dot)
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <Widget title="My Recent Activity">
                    <ActivityRowDemo text="Submitted CASE-006 for approval"   when="1h ago"    dot="#93C5FD" />
                    <ActivityRowDemo text="Ran AI analysis on 0x7a3d…2e3f"    when="2h ago"    dot="#D1D5DB" />
                    <ActivityRowDemo text="Updated notes on CASE-2026-0011"   when="3h ago"    dot="#D1D5DB" />
                    <ActivityRowDemo text="Generated report for CASE-005"      when="Yesterday" dot="#D1D5DB" last />
                  </Widget>
                </div>
                <div style={{ flex: 2, minWidth: 320 }}>
                  <TokenBlock heading="Pattern · ActivityRow" pairs={[
                    ['dot size',     '7px circle'],
                    ['dot color',    'latest=#93C5FD, rest=#D1D5DB'],
                    ['text size',    '12px'],
                    ['text color',   '#4B5563'],
                    ['time size',    '11px'],
                    ['time color',   '#B0B8C8'],
                    ['padding',      '12px 20px'],
                    ['separator',    'TABLE.row.borderBottom'],
                  ]} />
                </div>
              </div>

              {/* ── Row 3: MetricBar / RiskBars ──────────────────────────── */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 12 }}>
                C · MetricBar / Risk Distribution
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <Widget title="My Cases by Risk">
                    <div style={{ padding: '16px 16px 0' }}>
                      <MetricBarDemo label="Critical" count={6}  max={9} color="#EF4444" />
                      <MetricBarDemo label="High"     count={9}  max={9} color="#F97316" />
                      <MetricBarDemo label="Medium"   count={5}  max={9} color="#F59E0B" />
                      <MetricBarDemo label="Low"      count={3}  max={9} color="#22C55E" />
                    </div>
                    <WidgetFooter text="23 total cases assigned to me" />
                  </Widget>
                </div>
                <div style={{ flex: 2, minWidth: 320 }}>
                  <TokenBlock heading="Pattern · MetricBar" pairs={[
                    ['bar height',     '8px'],
                    ['bar radius',     '999px (pill)'],
                    ['track bg',       '#F3F4F6'],
                    ['label width',    '56–60px fixed'],
                    ['label size',     '12px bold'],
                    ['label color',    'matches fill color'],
                    ['count color',    '#6B7280'],
                    ['gap',            '10px'],
                    ['row mb',         '12–14px'],
                  ]} />
                </div>
              </div>

              {/* ── Row 4: Compliance KPI bars ───────────────────────────── */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 12 }}>
                D · Compliance KPI Bar
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <Widget title="Compliance KPIs">
                    <div style={{ padding: '16px 16px 0' }}>
                      <KPIBarDemo label="SLA Met (≤5d)"   value="89%" pct={89} color="#22C55E" />
                      <KPIBarDemo label="SAR Filing Rate" value="76%" pct={76} color="#3B82F6" />
                      <KPIBarDemo label="AI Assist Rate"  value="94%" pct={94} color="#8B5CF6" />
                    </div>
                    <WidgetFooter icon={Activity} color="#D1D5DB" text="42 total cases org-wide" />
                  </Widget>
                </div>
                <div style={{ flex: 2, minWidth: 320 }}>
                  <TokenBlock heading="Pattern · KPIBar" pairs={[
                    ['layout',         'label-left + value-right (flex space-between)'],
                    ['label size',     '12px, color #6B7280'],
                    ['value size',     '13px bold, color = fill'],
                    ['bar height',     '8px, pill'],
                    ['track bg',       '#F3F4F6'],
                    ['row mb',         '20px'],
                  ]} />
                </div>
              </div>

              {/* ── Row 5: Case Velocity ─────────────────────────────────── */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 12 }}>
                E · Case Velocity (mini bar chart)
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <Widget title="Case Velocity">
                    <div style={{ padding: '12px 16px 0' }}>
                      <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 12px' }}>Cases closed — last 7 days</p>
                      {[['Mon',3],['Tue',5],['Wed',2],['Thu',6],['Fri',4],['Sat',1],['Sun',0]].map(([d,c]) => (
                        <VelocityBarDemo key={d as string} day={d as string} count={c as number} max={6} />
                      ))}
                    </div>
                    <WidgetFooter icon={TrendingUp} color="#8B5CF6" text="21 cases closed this week" />
                  </Widget>
                </div>
                <div style={{ flex: 2, minWidth: 320 }}>
                  <TokenBlock heading="Pattern · VelocityBar" pairs={[
                    ['bar height',   '8px, pill'],
                    ['bar color',    '#A5B4FC (indigo-300)'],
                    ['track bg',     '#F3F4F6'],
                    ['min width',    '3px when count = 0'],
                    ['day label',    '11px, #9CA3AF, w=26px'],
                    ['count label',  '11px, #6B7280, w=14px'],
                    ['footer icon',  'TrendingUp, color #8B5CF6'],
                  ]} />
                </div>
              </div>

              {/* ── Row 6: Team Workload ─────────────────────────────────── */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 12 }}>
                F · Team Workload Row (avatar + stacked bar)
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <Widget title="Analyst Workload" actionLabel="View cases">
                    <WorkloadRowDemo name="Lily Bennett"  open={4} pending={2} returned={1} initials="LB" color="#93C5FD" />
                    <WorkloadRowDemo name="Marcus Webb"   open={3} pending={1} returned={0} initials="MW" color="#6EE7B7" />
                    <WorkloadRowDemo name="Priya Sharma"  open={5} pending={0} returned={1} initials="PS" color="#FCA5A5" />
                    <WorkloadRowDemo name="Jordan Reyes"  open={2} pending={3} returned={0} initials="JR" color="#C4B5FD" last />
                  </Widget>
                </div>
                <div style={{ flex: 2, minWidth: 320 }}>
                  <TokenBlock heading="Pattern · WorkloadRow" pairs={[
                    ['avatar size',   '30×30px circle'],
                    ['avatar bg',     'color + 26 (15% opacity)'],
                    ['avatar border', 'color + 55 (33% opacity)'],
                    ['initials size', '10px bold'],
                    ['bar height',    '8px, overflow hidden pill'],
                    ['open fill',     '#93C5FD (blue-300)'],
                    ['pending fill',  '#FCD34D (amber-300)'],
                    ['returned fill', '#FCA5A5 (red-300)'],
                    ['legend size',   '10px'],
                    ['padding',       '10–12px 16px'],
                  ]} />
                </div>
              </div>

              {/* ── Row 7: Case Row ──────────────────────────────────────── */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 12 }}>
                G · Case Row (left-border accent)
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <Widget title="Needs Attention" actionLabel="View all cases">
                    <CaseRowDemo id="CASE-003" typology="Layering"          risk="Critical" sub="7d idle" />
                    <CaseRowDemo id="CASE-009" typology="Structuring"       risk="High"     sub="5d idle" />
                    <CaseRowDemo id="CASE-011" typology="Sanctions Evasion" risk="Medium"   sub="4d idle" />
                    <CaseRowDemo id="CASE-012" typology="Mixing"            risk="Low"      sub="3d idle" last />
                  </Widget>
                </div>
                <div style={{ flex: 2, minWidth: 320 }}>
                  <TokenBlock heading="Pattern · CaseRow" pairs={[
                    ['left border',  '3px solid RISK_COLOR[risk]'],
                    ['padding',      '10–11px 16px 10px 13px'],
                    ['id style',     'TABLE.cell.monoId'],
                    ['typology',     '11px, #9CA3AF, ellipsis'],
                    ['hover bg',     'TABLE.row.hoverBg'],
                    ['risk chip bg', 'color + 18 (10% opacity)'],
                    ['chip radius',  '20px pill'],
                    ['separator',    'TABLE.row.borderBottom'],
                  ]} />
                </div>
              </div>

              {/* ── Row 8: Audit Trail ───────────────────────────────────── */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 12 }}>
                H · Audit Trail Row (grid)
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <Widget title="Org Audit Trail" actionLabel="Full trail">
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 5fr 2fr 2fr', padding: '7px 16px', background: TABLE.header.bg, borderBottom: sep }}>
                      {['User','Action','Role','Time'].map((h, i) => (
                        <span key={h} style={{ ...(TABLE.header as React.CSSProperties), fontSize: 10, textAlign: i === 3 ? 'right' : ('left' as const) }}>{h}</span>
                      ))}
                    </div>
                    <AuditRowDemo actor="Rachel Scott"  action="approved CASE-006"              role="Lead"    when="20m ago"   dotColor="#22C55E" />
                    <AuditRowDemo actor="Lily Bennett"  action="submitted CASE-013 for approval" role="Analyst" when="2h ago"    dotColor="#F59E0B" />
                    <AuditRowDemo actor="System"        action="AI analysis completed"           role="—"       when="4h ago"    dotColor="#3B82F6" />
                    <AuditRowDemo actor="Rachel Scott"  action="returned CASE-012 with notes"    role="Lead"    when="Yesterday" dotColor="#EF4444" last />
                  </Widget>
                </div>
                <div style={{ flex: 2, minWidth: 320 }}>
                  <TokenBlock heading="Pattern · AuditRow" pairs={[
                    ['grid',         '3fr 5fr 2fr 2fr'],
                    ['dot size',     '7px circle'],
                    ['actor size',   '12px 600, #374151'],
                    ['action size',  '12px, #6B7280'],
                    ['role size',    '11px, #9CA3AF'],
                    ['time',         '11px, #B0B8C8, right-aligned'],
                    ['header bg',    'TABLE.header.bg'],
                    ['header style', 'TABLE.header'],
                    ['padding',      '10–11px 16px'],
                    ['separator',    'TABLE.row.borderBottom'],
                  ]} />
                </div>
              </div>

              {/* ── Row 9: Admin Quick Action card ──────────────────────── */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 12 }}>
                I · Admin Quick Action Card
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
                <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <QuickActionDemo IconComp={UserPlus}  label="Invite User"   desc="Add a new analyst or lead"        color="#6366F1" bg="#EEF2FF" border="#C7D2FE" />
                  <QuickActionDemo IconComp={Users}     label="Manage Users"  desc="Edit roles, reassign cases"       color="#2563EB" bg="#EFF6FF" border="#BFDBFE" />
                  <QuickActionDemo IconComp={Settings}  label="System Config" desc="Escalation rules & notifications" color="#374151" bg="#F9FAFB" border="#E5E7EB" />
                </div>
                <div style={{ flex: 2, minWidth: 320 }}>
                  <TokenBlock heading="Pattern · QuickActionCard" pairs={[
                    ['shell bg',     'SURFACE.panel.bg'],
                    ['shell border', 'SURFACE.panel.border'],
                    ['shell radius', 'SURFACE.panel.borderRadius'],
                    ['shell shadow', 'SURFACE.panel.shadow'],
                    ['hover shadow', '0 4px 16px rgba(0,0,0,0.10)'],
                    ['icon dim',     '40×40px'],
                    ['icon radius',  'RADIUS.md (10px)'],
                    ['label size',   '13px 600, #111827'],
                    ['desc size',    '12px, #9CA3AF'],
                    ['chevron',      '14px, #D1D5DB'],
                    ['padding',      '16px 20px'],
                    ['gap',          '14px'],
                  ]} />
                </div>
              </div>

              {/* ── Row 10: EmptyState ───────────────────────────────────── */}
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#B0B8C8', marginBottom: 12 }}>
                J · Empty State
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <Widget title="Approval Queue">
                    <EmptyStateDemo />
                  </Widget>
                </div>
                <div style={{ flex: 2, minWidth: 320 }}>
                  <TokenBlock heading="EMPTY_STATE" pairs={[
                    ['wrapper.padding',   ES.wrapper.padding],
                    ['icon.size',         ES.icon.size],
                    ['icon.color',        ES.icon.color],
                    ['title.fontSize',    ES.title.fontSize],
                    ['title.fontWeight',  ES.title.fontWeight],
                    ['title.color',       ES.title.color],
                    ['subtitle.fontSize', ES.subtitle.fontSize],
                    ['subtitle.color',    ES.subtitle.color],
                  ]} />
                  <div style={{ marginTop: 8, background: '#FEF9C3', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#92400E' }}>
                    Note: EmptyState shown inside DashWidget uses a green CheckCircle override (#22C55E) instead of the default muted icon color.
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
