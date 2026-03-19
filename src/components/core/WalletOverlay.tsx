import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ExternalLink, AlertTriangle } from 'lucide-react';
import { CaseHeader, TabBtn } from './CaseHeader';
import { Table } from './Table';
import { StatusChip } from './StatusChip';
import { StatCard } from '../ui';
import { mockTransactions } from '@/services/transactionsService';
import type { Transaction } from '@/services/transactionsService';

const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
const truncateHash    = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-8)}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

const txColumns = [
  {
    key: 'type', label: 'Type',
    render: (v: unknown): ReactNode => (
      <span className="inline-flex items-center gap-[6px] text-[13px]">
        {v === 'Receive'
          ? <ArrowDownRight size={14} className="text-[#10B981]" />
          : <ArrowUpRight   size={14} className="text-[#7C3AED]" />}
        {String(v)}
      </span>
    ),
  },
  {
    key: 'hash', label: 'Hash',
    render: (v: unknown): ReactNode => (
      <span className="inline-flex items-center gap-[6px]">
        <span className="text-[12px] font-mono font-medium text-[#374151]">{truncateHash(String(v))}</span>
        <a href={`https://etherscan.io/tx/${v}`} target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF] hover:text-[#374151] transition-colors">
          <ExternalLink size={12} />
        </a>
      </span>
    ),
  },
  { key: 'dateTime',   label: 'Date',       render: (v: unknown): ReactNode => <span className="text-[12px] font-mono text-[#374151]">{formatDate(String(v))}</span> },
  { key: 'from',       label: 'From',       render: (v: unknown): ReactNode => <span className="text-[12px] font-mono text-[#374151]">{truncateAddress(String(v))}</span> },
  { key: 'to',         label: 'To',         render: (v: unknown): ReactNode => <span className="text-[12px] font-mono text-[#374151]">{truncateAddress(String(v))}</span> },
  {
    key: 'amount', label: 'Amount',
    render: (v: unknown, row: Record<string, unknown>): ReactNode => {
      const color = row.type === 'Receive' ? '#10B981' : '#7C3AED';
      const sign  = row.type === 'Receive' ? '+' : '-';
      return <span className="text-[13px] font-semibold font-mono" style={{ color }}>{sign}{String(v)} ETH</span>;
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
  const [activeTab,    setActiveTab]    = useState(0);
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
    <div className="fixed inset-0 z-[300] bg-[#070D1F] flex flex-col p-[16px] box-border">

      {/* Context bar */}
      <div className="shrink-0 flex items-center justify-between px-[16px] h-[48px] mb-[16px]">
        <span className="text-[12px] text-[rgba(255,255,255,0.45)] font-medium">
          Wallet Explorer
          {caseId && (
            <>
              <span className="mx-[8px] opacity-50">·</span>
              from <span className="font-mono text-[rgba(255,255,255,0.85)]">{caseId}</span>
            </>
          )}
        </span>
        <button
          onClick={onClose}
          className="flex items-center gap-[6px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-[6px] px-[10px] py-[4px] text-[12px] font-medium text-white opacity-75 cursor-pointer font-sans hover:opacity-100 hover:bg-[rgba(255,255,255,0.14)] transition-[opacity,background] duration-150"
        >
          <X size={13} />
          Close
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.28)] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">

            {/* Identity header */}
            <div className="bg-white border-b border-[#ECEEF2]">
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

            {/* Body */}
            <div className="flex flex-col flex-1 bg-white">

              {/* Alert + KPI */}
              <div className="p-[20px] pb-[16px] flex flex-col gap-[16px]">
                {!alertClosed && (
                  <div className="flex items-start gap-[8px] px-[12px] py-[10px] bg-[#FFFBEB] border border-[#FDE68A] border-l-[3px] border-l-[#F59E0B] rounded-[8px]">
                    <AlertTriangle size={14} className="text-[#F59E0B] shrink-0 mt-[1px]" />
                    <div className="flex-1">
                      <span className="text-[12px] font-semibold text-[#78350F]">
                        {flagged.length} compliance flags detected
                      </span>
                      <span className="text-[12px] text-[#78350F]"> across {mockTransactions.length} transactions</span>
                      <div className="text-[11px] text-[#92400E] mt-[2px]">
                        Review the highlighted rows in the Flags tab below
                      </div>
                    </div>
                    <button
                      onClick={() => setAlertClosed(true)}
                      className="bg-transparent border-none cursor-pointer p-[2px] text-[#92400E] shrink-0 flex hover:text-[#78350F] transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}

                <div className="flex gap-[8px] items-stretch">
                  {[
                    { label: 'All Transactions', value: mockTransactions.length,        accent: '#2563EB', tab: 0 },
                    { label: 'Total Inflow',      value: `${inflow.toFixed(2)} ETH`,    accent: '#10B981', tab: 1 },
                    { label: 'Total Outflow',     value: `${outflow.toFixed(2)} ETH`,   accent: '#7C3AED', tab: 2 },
                    { label: 'Flags',             value: flagged.length,                accent: '#F59E0B', tab: 3 },
                  ].map(({ label, value, accent, tab }) => (
                    <div key={label} className="flex-1">
                      <StatCard label={label} value={value} accent={accent} compact onClick={() => setActiveTab(tab)} active={activeTab === tab} />
                    </div>
                  ))}
                  <div className="w-px self-stretch bg-[#E5E7EB] shrink-0 mx-[4px]" />
                  <div className="flex-1">
                    <StatCard label="Net Balance" value={`${(inflow - outflow).toFixed(2)} ETH`} accent="#6B7280" compact />
                  </div>
                </div>
              </div>

              {/* Tab strip */}
              <div className="flex border-b border-[#ECEEF2] px-[20px]">
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
              <div className="p-[20px] pt-[16px] pb-[80px] flex flex-col gap-[16px]">
                {activeTab < 4 && (
                  <Table
                    density="relaxed"
                    columns={txColumns}
                    data={getFiltered() as unknown as Record<string, unknown>[]}
                    flaggedRowIds={flagged.map((t: Transaction) => t.id)}
                  />
                )}

                {activeTab === 4 && (
                  <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px]">
                    <p className="text-[14px] font-semibold text-[#0A0A0F] mb-[16px]">Entity Profile</p>
                    <div className="grid grid-cols-2 gap-[20px]">
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
                          <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-[0.06em] mb-[4px]">{label}</p>
                          <p className="text-[13px] text-[#374151] m-0">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-[#ECEEF2] mt-[20px] pt-[16px]">
                      <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-[0.06em] mb-[6px]">Notes</p>
                      <p className="text-[13px] text-[#6B7280] m-0">No verified identity. High transaction frequency flagged for review.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
