import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ExternalLink, AlertTriangle } from 'lucide-react';
import { CaseHeader, TabBtn } from './CaseHeader';
import { Table } from './Table';
import { StatusChip } from './StatusChip';
import { StatCard } from '../ui';
import { SURFACE, TABLE, COLORS, TYPOGRAPHY, CALLOUT } from '@/tokens/designTokens';
import { mockTransactions } from '@/data/mock/transactions';
import type { Transaction } from '@/data/mock/transactions';

type SurfaceFrame = { bg: string; padding: number | string; borderRadius: number };
type SurfaceNav = { paddingX: number; height: number; border: string };
type SurfaceContent = { bg: string; borderRadius: number | string; shadow: string; bodyBg: string; padding: number | string };
type SurfacePanel = { bg: string; border: string; borderRadius: number | string };
type SurfaceHeader = { bg: string; borderBottom: string; paddingX: number };
type TypographyToken = { size: { sm: number }; weight: { medium: number }; fontMono: string };
type ColorsToken = { text: { white: string }; accent: { teal: string } };
type TableToken = { cell: { mono: React.CSSProperties; numeric: React.CSSProperties } };

const SF  = SURFACE.frame   as unknown as SurfaceFrame;
const SN  = SURFACE.nav     as unknown as SurfaceNav;
const SC  = SURFACE.content as unknown as SurfaceContent;
const SP  = SURFACE.panel   as unknown as SurfacePanel;
const SH  = SURFACE.header  as unknown as SurfaceHeader;
const TY  = TYPOGRAPHY      as unknown as TypographyToken;
const CL  = COLORS          as unknown as ColorsToken;
const TBL = TABLE           as unknown as TableToken;

const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
const truncateHash    = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-8)}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

const txColumns = [
  {
    key: 'type', label: 'Type',
    render: (v: unknown): ReactNode => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
        {v === 'Receive'
          ? <ArrowDownRight size={14} style={{ color: '#10B981' }} />
          : <ArrowUpRight   size={14} style={{ color: '#7C3AED' }} />}
        {String(v)}
      </span>
    ),
  },
  {
    key: 'hash', label: 'Hash',
    render: (v: unknown): ReactNode => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={TBL.cell.mono}>{truncateHash(String(v))}</span>
        <a href={`https://etherscan.io/tx/${v}`} target="_blank" rel="noopener noreferrer" style={{ color: '#9CA3AF' }}>
          <ExternalLink size={12} />
        </a>
      </span>
    ),
  },
  { key: 'dateTime',   label: 'Date',       render: (v: unknown): ReactNode => <span style={TBL.cell.mono}>{formatDate(String(v))}</span> },
  { key: 'from',       label: 'From',       render: (v: unknown): ReactNode => <span style={TBL.cell.mono}>{truncateAddress(String(v))}</span> },
  { key: 'to',         label: 'To',         render: (v: unknown): ReactNode => <span style={TBL.cell.mono}>{truncateAddress(String(v))}</span> },
  {
    key: 'amount', label: 'Amount',
    render: (v: unknown, row: Record<string, unknown>): ReactNode => {
      const color = row.type === 'Receive' ? '#10B981' : '#7C3AED';
      const sign  = row.type === 'Receive' ? '+' : '-';
      return <span style={{ ...TBL.cell.numeric, color, fontSize: 13 }}>{sign}{String(v)} ETH</span>;
    },
  },
  { key: 'status',     label: 'Status',     render: (v: unknown): ReactNode => <StatusChip status={v === 'Confirmed' ? 'approved' : 'open'} label={String(v)} size="sm" /> },
  { key: 'compliance', label: 'Compliance', render: (v: unknown): ReactNode => <StatusChip status={v === 'clear' ? 'approved' : 'returned'} label={v === 'clear' ? 'Clear' : 'Flagged'} size="sm" /> },
];

interface WalletOverlayProps {
  walletAddress: string;
  caseId?: string;
  onClose: () => void;
}

export function WalletOverlay({ walletAddress, caseId, onClose }: WalletOverlayProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [alertClosed, setAlertClosed] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const flagged  = mockTransactions.filter((t: Transaction) => t.compliance === 'flagged');
  const receives = mockTransactions.filter((t: Transaction) => t.type === 'Receive');
  const sends    = mockTransactions.filter((t: Transaction) => t.type === 'Send');
  const inflow   = receives.reduce((s: number, t: Transaction) => s + parseFloat(t.amount), 0);
  const outflow  = sends.reduce((s: number, t: Transaction) => s + parseFloat(t.amount), 0);

  const getFiltered = () => {
    if (activeTab === 1) return receives;
    if (activeTab === 2) return sends;
    if (activeTab === 3) return flagged;
    return mockTransactions;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: SF.bg,
      display: 'flex', flexDirection: 'column',
      padding: SF.padding,
      boxSizing: 'border-box',
    }}>

      {/* Context bar */}
      <div style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `0 ${SN.paddingX}px`,
        height: SN.height,
        background: 'transparent',
        marginBottom: SF.padding,
      }}>
        <span style={{ fontSize: TY.size.sm, color: CL.text.white, opacity: 0.45, fontWeight: TY.weight.medium }}>
          Wallet Explorer
          {caseId && (
            <>
              <span style={{ margin: '0 8px', opacity: 0.5 }}>·</span>
              <span style={{ opacity: 1 }}>
                from{' '}
                <span style={{ fontFamily: TY.fontMono, fontWeight: TY.weight.medium, color: CL.text.white, opacity: 0.85 }}>
                  {caseId}
                </span>
              </span>
            </>
          )}
        </span>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.08)', border: SN.border,
            borderRadius: SF.borderRadius / 2,
            padding: '4px 10px',
            color: CL.text.white, opacity: 0.75,
            fontSize: TY.size.sm, fontWeight: TY.weight.medium,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'opacity 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        >
          <X size={13} />
          Close
        </button>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <main style={{
          height: '100%',
          background: SC.bg,
          borderRadius: SC.borderRadius,
          boxShadow: SC.shadow,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>

            {/* Identity header — white */}
            <div style={{ background: SH.bg, borderBottom: SH.borderBottom }}>
              <CaseHeader
                title={`${walletAddress.slice(0, 10)}…${walletAddress.slice(-6)}`}
                copyText={walletAddress}
                chips={[
                  { chain: 'ethereum' },
                  { label: 'First seen Jan 3, 2024' },
                  { label: 'Last active Feb 18, 2026' },
                ]}
                showStatusRow={false}
              />
            </div>

            {/* Body — all on white: alert, KPI cards, tabs, table */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: SC.bodyBg }}>

              {/* Alert + KPI */}
              <div style={{ padding: SC.padding, paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {!alertClosed && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '10px 12px',
                  background: CALLOUT.variants.warning.bg,
                  border: CALLOUT.variants.warning.border,
                  borderLeft: `3px solid ${CALLOUT.variants.warning.accent}`,
                  borderRadius: 8,
                }}>
                  <AlertTriangle size={14} style={{ color: CALLOUT.variants.warning.accent, flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: CALLOUT.variants.warning.labelColor }}>
                      {flagged.length} compliance flags detected
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 400, color: CALLOUT.variants.warning.labelColor }}>
                      {' '}across {mockTransactions.length} transactions
                    </span>
                    <div style={{ fontSize: 11, color: CALLOUT.variants.warning.textColor, marginTop: 2 }}>
                      Review the highlighted rows in the Flags tab below
                    </div>
                  </div>
                  <button
                    onClick={() => setAlertClosed(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: CALLOUT.variants.warning.textColor, flexShrink: 0, display: 'flex' }}
                  >
                    <X size={13} />
                  </button>
                </div>
                )}

                <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                  {[
                    { label: 'All Transactions', value: mockTransactions.length, accent: '#2563EB',  tab: 0 },
                    { label: 'Total Inflow',      value: `${inflow.toFixed(2)} ETH`,  accent: '#10B981', tab: 1 },
                    { label: 'Total Outflow',     value: `${outflow.toFixed(2)} ETH`, accent: '#7C3AED', tab: 2 },
                    { label: 'Flags',             value: flagged.length,              accent: '#F59E0B', tab: 3 },
                  ].map(({ label, value, accent, tab }) => (
                    <div key={label} style={{ flex: 1 }}>
                      <StatCard label={label} value={value} accent={accent} compact onClick={() => setActiveTab(tab)} active={activeTab === tab} />
                    </div>
                  ))}
                  <div style={{ width: 1, alignSelf: 'stretch', background: COLORS.bg.lighter, flexShrink: 0, marginLeft: 4, marginRight: 4 }} />
                  <div style={{ flex: 1 }}>
                    <StatCard label="Net Balance" value={`${(inflow - outflow).toFixed(2)} ETH`} accent="#6B7280" compact />
                  </div>
                </div>
              </div>

              {/* Tab strip */}
              <div style={{ display: 'flex', borderBottom: SH.borderBottom, padding: `0 ${SH.paddingX}px`, background: 'transparent' }}>
                {[
                  `All Transactions (${mockTransactions.length})`,
                  `Inflows (${receives.length})`,
                  `Outflows (${sends.length})`,
                  `Flags (${flagged.length})`,
                  'Customer Info',
                ].map((tab, i) => (
                  <TabBtn key={tab} label={tab} active={activeTab === i} onClick={() => setActiveTab(i)} />
                ))}
              </div>

              {/* Table / content */}
              <div style={{ padding: SC.padding, paddingTop: 16, paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeTab < 4 && (
                  <Table
                    density="relaxed"
                    columns={txColumns}
                    data={getFiltered() as unknown as Record<string, unknown>[]}
                    flaggedRowIds={flagged.map((t: Transaction) => t.id)}
                  />
                )}

                {activeTab === 4 && (
                  <div style={{ background: SP.bg, border: SP.border, borderRadius: SP.borderRadius, padding: 20 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0F', marginBottom: 16 }}>Entity Profile</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      {[
                        ['Entity Name',      'Unknown'],
                        ['Entity Type',      'Individual (Unverified)'],
                        ['Jurisdiction',     'Unknown'],
                        ['First Seen',       'January 3, 2024'],
                        ['Last Active',      'February 18, 2026'],
                        ['Total Volume',     '$847,234 USD equivalent'],
                        ['Associated VASPs', 'None identified'],
                        ['KYT Status',       'Under Review'],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
                          <p style={{ fontSize: 13, color: '#374151' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid #ECEEF2', marginTop: 20, paddingTop: 16 }}>
                      <p style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Notes</p>
                      <p style={{ fontSize: 13, color: '#6B7280' }}>No verified identity. High transaction frequency flagged for review.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>{/* end body section */}
          </div>
        </main>
      </div>
    </div>
  );
}
