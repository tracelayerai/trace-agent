import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownRight, ArrowUpRight, ExternalLink,
  Zap, AlertTriangle, AlertOctagon, Info, X,
  FolderPlus, CheckCircle, FileText, Wallet,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { Table } from '@/components/core/Table';
import { StatusChip } from '@/components/core/StatusChip';
import { StatCard } from '@/components/ui';
import { CaseHeader, TabBtn, GhostIcon, Btn } from '@/components/core/CaseHeader';
import { Callout, MetricCard } from '@/components/core/MetricCard';
import { Modal } from '@/components/core/Modal';
import { cn } from '@/lib/utils';
import { CustomSelect } from '@/components/core/CustomSelect';
import { useAuth, MOCK_USERS, ROLES } from '@/context/AuthContext';
import type { User } from '@/context/AuthContext';
import { mockTransactions } from '@/services/transactionsService';
import type { Transaction } from '@/services/transactionsService';
import { mockAnalysisCompleted, mockAnalysisRunning } from '@/services/analysisService';
import { ReportOverlay } from '@/pages/ReportsPage';

type LogIconConfig = { bg: string; color: string; Icon: React.ElementType };
const LOG_ICON_CONFIG: Record<string, LogIconConfig> = {
  info:     { bg: '#EFF6FF', color: '#3B82F6', Icon: Info },
  warning:  { bg: '#FFFBEB', color: '#F59E0B', Icon: AlertTriangle },
  critical: { bg: '#FEF2F2', color: '#EF4444', Icon: AlertOctagon },
};

interface LogEntry {
  id: string;
  type: string;
  message: string;
}

const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
const truncateHash    = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-8)}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

const SECTION_LABEL = 'text-[11px] font-bold uppercase tracking-[0.07em] text-[#9CA3AF]';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const wallet     = searchParams.get('q') || '';
  const status     = searchParams.get('status');
  const isComplete = status === 'complete';

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab]             = useState(0);
  const [showReport, setShowReport]           = useState(false);
  const [openCaseStep, setOpenCaseStep]       = useState<'confirm' | 'success' | null>(null);
  const [initialCaseNote, setInitialCaseNote] = useState('');
  const [showAssignLeadModal, setShowAssignLeadModal] = useState(false);
  const [assignLeadSelected, setAssignLeadSelected]   = useState('');
  const [assignLeadNote, setAssignLeadNote]           = useState('');
  const [selectedLead, setSelectedLead]               = useState<User | null>(null);
  const leadUsers = Object.values(MOCK_USERS).filter(u => u.role === ROLES.LEAD);
  const [flagCalloutDismissed, setFlagCalloutDismissed] = useState(false);
  const [showQueueHint, setShowQueueHint]     = useState(false);
  const [showPanel, setShowPanel]             = useState(true);
  const [timer, setTimer]                     = useState(() => isComplete ? 83 : 47);
  const timerIvRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const logEntries = (isComplete ? mockAnalysisCompleted : mockAnalysisRunning) as LogEntry[];

  const walletDisplay = wallet
    ? `${wallet.slice(0, 10)}…${wallet.slice(-6)}`
    : '0x7a3d…6c7d';

  const isCompleteRef = useRef(isComplete);
  useEffect(() => {
    if (isCompleteRef.current) return;
    timerIvRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerIvRef.current ?? undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isComplete) return;
    const t = setTimeout(() => setShowQueueHint(true), 10000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          <span className="font-mono text-[12px] text-[#4A5568]">{truncateHash(String(v))}</span>
          <a href={`https://etherscan.io/tx/${v}`} target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF]">
            <ExternalLink size={12} />
          </a>
        </span>
      ),
    },
    { key: 'dateTime',   label: 'Date',       render: (v: unknown): ReactNode => <span className="font-mono text-[12px] text-[#4A5568]">{formatDate(String(v))}</span> },
    { key: 'from',       label: 'From',       render: (v: unknown): ReactNode => <span className="font-mono text-[12px] text-[#4A5568]">{truncateAddress(String(v))}</span> },
    { key: 'to',         label: 'To',         render: (v: unknown): ReactNode => <span className="font-mono text-[12px] text-[#4A5568]">{truncateAddress(String(v))}</span> },
    {
      key: 'amount', label: 'Amount',
      render: (v: unknown, row: Record<string, unknown>): ReactNode => {
        const color = row.type === 'Receive' ? '#10B981' : '#7C3AED';
        const sign  = row.type === 'Receive' ? '+' : '-';
        return <span className="font-mono text-[13px] font-bold" style={{ color }}>{sign}{String(v)} ETH</span>;
      },
    },
    { key: 'status',     label: 'Status',     render: (v: unknown): ReactNode => <StatusChip status={v === 'Confirmed' ? 'approved' : 'open'} label={String(v)} size="sm" /> },
    { key: 'compliance', label: 'Compliance', render: (v: unknown): ReactNode => <StatusChip status={v === 'clear' ? 'approved' : 'returned'} label={v === 'clear' ? 'Clear' : 'Flagged'} size="sm" /> },
  ];

  const TABS = [
    `All Transactions (${mockTransactions.length})`,
    `Inflows (${receives.length})`,
    `Outflows (${sends.length})`,
    `Flags (${flagged.length})`,
    'Customer Info',
  ];

  const completedData = {
    riskScore: 91, confidence: 88, typology: 'Mixer Usage / Structuring',
    findings: [
      'Tornado Cash interaction — 38 ETH routed through known mixer contract',
      'Structuring: 11 deposits of 5–8 ETH within 90-minute window',
      'Funds consolidated to Binance deposit address flagged by FinCEN',
    ],
    chains: [{ label: 'ETH', bg: '#454A75' }, { label: 'MATIC', bg: '#7B3FE4' }],
  };

  return (
  <>
    <div
      className="flex h-screen overflow-hidden p-[8px] gap-[8px] box-border bg-[linear-gradient(135deg,#070D1F_0%,#0B1628_100%)]"
    >
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div className="flex-1 flex flex-col gap-[8px] overflow-hidden">
        <main
          className="flex-1 overflow-hidden bg-white rounded-[16px] flex flex-col relative shadow-[0_4px_24px_rgba(0,0,0,0.28)]"
        >

          <div className="shrink-0">
            <CaseHeader
              title={walletDisplay}
              copyText={wallet}
              chips={[
                { chain: 'ethereum' },
                { label: 'First seen Jan 3, 2024' },
                { label: 'Last active Mar 6, 2026' },
              ]}
              showStatusRow={false}
              actions={[
                ...(!showPanel ? [(isComplete
                  ? { variant: 'primary' as const, icon: Zap, label: 'View Results', onClick: () => setShowPanel(true) }
                  : { variant: 'primary' as const, icon: Zap, label: 'Analysing…', onClick: () => setShowPanel(true) }
                )] : []),
              ]}
            />
          </div>

          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#F8FAFF_0%,#F4F6FB_100%)]"
          >

            <div className="px-[32px] py-[24px] flex flex-col gap-[16px]">
              {!flagCalloutDismissed && (
                <Callout severity="warning" onDismiss={() => setFlagCalloutDismissed(true)}>
                  <strong>{flagged.length} compliance flags detected</strong> across {mockTransactions.length} transactions<br />
                  Review the highlighted rows in the Flags tab below
                </Callout>
              )}
              <div className="grid grid-cols-[repeat(4,1fr)_1px_1fr] gap-[8px] items-stretch">
                {[
                  { label: 'All Transactions', value: mockTransactions.length, accent: '#2563EB', tab: 0 },
                  { label: 'Total Inflow',      value: `${inflow.toFixed(2)} ETH`, accent: '#10B981', tab: 1 },
                  { label: 'Total Outflow',     value: `${outflow.toFixed(2)} ETH`, accent: '#7C3AED', tab: 2 },
                  { label: 'Flags',             value: flagged.length, accent: '#F59E0B', tab: 3 },
                ].map(({ label, value, accent, tab }) => (
                  <StatCard key={label} label={label} value={value} accent={accent} compact onClick={() => setActiveTab(tab)} active={activeTab === tab} />
                ))}
                <div className="bg-[#E5E7EB] self-stretch" />
                <StatCard label="Net Balance" value={`${(inflow - outflow).toFixed(2)} ETH`} accent="#6B7280" compact />
              </div>
            </div>

            <div className="flex border-b border-[#ECEEF2] px-[32px]">
              {TABS.map((tab, i) => (
                <TabBtn key={tab} label={tab} active={activeTab === i} onClick={() => setActiveTab(i)} />
              ))}
            </div>

            <div className="px-[32px] pt-[16px] pb-[80px] flex flex-col gap-[16px]">
              {activeTab < 4 && (
                <Table
                  density="relaxed"
                  columns={txColumns}
                  data={getFiltered() as unknown as Record<string, unknown>[]}
                  flaggedRowIds={flagged.map((t: Transaction) => t.id)}
                />
              )}
              {activeTab === 4 && (
                <div className="bg-white border border-[#ECEEF2] rounded-[12px] p-[20px] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-[12px] mb-[20px]">
                    <div className="w-[44px] h-[44px] rounded-[12px] bg-[#F0F4F8] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <Wallet size={20} className="text-[#7B90AA]" />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#111827] leading-[1.3]">Entity Profile</div>
                      <div className="text-[12px] text-[#5C6578] mt-[2px]">Individual · Unverified</div>
                    </div>
                  </div>
                  {([
                    ['Entity Name',      'Unknown'],
                    ['Entity Type',      'Individual (Unverified)'],
                    ['Jurisdiction',     'Unknown'],
                    ['First Seen',       'January 3, 2024'],
                    ['Last Active',      'March 6, 2026'],
                    ['Total Volume',     '$847,234 USD equivalent'],
                    ['Associated VASPs', 'None identified'],
                    ['KYT Status',       'Under Review'],
                  ] as [string, string][]).map(([label, value], i, arr) => (
                    <div key={label} className={cn('grid grid-cols-[180px_1fr] items-center py-[9px]', i < arr.length - 1 ? 'border-b border-[#F3F4F6]' : '')}>
                      <span className="text-[12px] text-[#5C6578]">{label}</span>
                      <span className="text-[13px] font-medium text-[#374151]">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analysis panel */}
          {showPanel && (
          <div
            className="absolute top-0 right-0 bottom-0 w-[360px] bg-white flex flex-col overflow-hidden z-50 border-l border-[#ECEEF2] shadow-[-4px_0_24px_rgba(0,0,0,0.08)]"
          >

            {/* Header */}
            <div className="px-[20px] py-[16px] border-b border-[#ECEEF2] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-[10px]">
                <div className="w-[32px] h-[32px] rounded-[8px] bg-[#1B2D58] flex items-center justify-center shrink-0">
                  <Zap size={15} className="text-[#C6FF00]" />
                </div>
                <div>
                  <div className="flex items-center gap-[7px] mb-[2px]">
                    <span className="text-[13px] font-semibold text-[#0A0A0F]">Trace Agent</span>
                    <span className="w-[6px] h-[6px] rounded-full bg-[#10B981] inline-block" />
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] m-0">
                    AI Analysis · {truncateAddress(wallet || '0x7a3d4f8e9b2c')}
                  </p>
                </div>
              </div>
              <GhostIcon icon={X} size="sm" onClick={() => setShowPanel(false)} />
            </div>

            {/* Timer */}
            <div className="shrink-0 border-b border-[#ECEEF2]">
              <style>{`
                @keyframes scanPulse {
                  0%   { transform: translateX(-100%); }
                  100% { transform: translateX(400%); }
                }
                @keyframes blink {
                  0%, 100% { opacity: 1; }
                  50%       { opacity: 0.4; }
                }
              `}</style>
              <div className="px-[20px] py-[6px] text-[11px] text-center text-[#10B981] flex items-center justify-center gap-[6px]">
                {isComplete ? (
                  <>
                    <span className="text-[#10B981]">✓</span>
                    <span>{`Completed in ${Math.floor(timer / 60)}m ${String(timer % 60).padStart(2, '0')}s`}</span>
                  </>
                ) : (
                  <>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'blink 1.2s ease-in-out infinite', flexShrink: 0 }} />
                    <span>{`Analysing… ${Math.floor(timer / 60)}m ${String(timer % 60).padStart(2, '0')}s`}</span>
                  </>
                )}
              </div>
              {!isComplete && (
                <div className="h-[2px] bg-[rgba(16,185,129,0.12)] overflow-hidden relative">
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '25%', background: 'linear-gradient(90deg, transparent, #10B981, transparent)', animation: 'scanPulse 1.6s ease-in-out infinite' }} />
                </div>
              )}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">

              {/* Log entries */}
              <div className="flex flex-col gap-[12px]">
                {logEntries.map((entry, idx) => {
                  const cfg = LOG_ICON_CONFIG[entry.type] || LOG_ICON_CONFIG.info;
                  return (
                    <div key={entry.id} className="flex gap-[10px]">
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <cfg.Icon size={13} />
                      </div>
                      <div>
                        <p className="text-[11px] text-[#9CA3AF] mb-[2px]">{((idx + 1) * 0.5).toFixed(1)}s</p>
                        <p className="text-[13px] text-[#374151] leading-[1.4]">{entry.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Queue hint — running */}
              {!isComplete && showQueueHint && (
                <div className="mt-[16px]">
                  <Callout severity="info" onDismiss={() => setShowQueueHint(false)}>
                    Analysis runs in the background — check back via <strong>⚡ AI Analysis</strong> in the left menu.
                  </Callout>
                </div>
              )}

              {/* Preliminary findings — running */}
              {!isComplete && logEntries.length > 0 && (
                <div className="mt-[16px] border-t border-[#ECEEF2] pt-[16px]">
                  <p className={`${SECTION_LABEL} mb-[10px]`}>Preliminary Findings</p>
                  <div className="grid grid-cols-2 gap-[8px]">
                    {logEntries.length > 4 && <div className="bg-[#FEF2F2] rounded-[8px] p-[10px_12px]"><p className="text-[11px] text-[#9CA3AF]">Sanctions Match</p><p className="text-[13px] font-semibold text-[#EF4444]">Detected</p></div>}
                    {logEntries.length > 4 && <div className="bg-[#FFFBEB] rounded-[8px] p-[10px_12px]"><p className="text-[11px] text-[#9CA3AF]">Typology</p><p className="text-[13px] font-semibold text-[#F59E0B]">Sanctions Evasion</p></div>}
                    <div className="bg-[#EFF6FF] rounded-[8px] p-[10px_12px]"><p className="text-[11px] text-[#9CA3AF]">Hops Traced</p><p className="text-[13px] font-semibold text-[#3B82F6]">{Math.min(logEntries.length, 7)}</p></div>
                    <div className="bg-[#F5F3FF] rounded-[8px] p-[10px_12px]"><p className="text-[11px] text-[#9CA3AF]">Chains</p><p className="text-[13px] font-semibold text-[#7C3AED]">{Math.min(Math.ceil(logEntries.length / 2), 3)}</p></div>
                  </div>
                </div>
              )}

              {/* Complete results */}
              {isComplete && openCaseStep === null && (
                <div className="mt-[16px] border-t border-[#ECEEF2] pt-[16px] flex flex-col gap-[16px]">
                  <p className={SECTION_LABEL}>Analysis Complete</p>

                  <div className="grid grid-cols-2 gap-[8px]">
                    <MetricCard label="Risk Score"    value={completedData.riskScore} max={100} type="gradient-bar" compact />
                    <MetricCard label="AI Confidence" value={completedData.confidence} max={100} type="vertical-bar" displayValue={`${completedData.confidence}%`} compact />
                    <MetricCard
                      label="Hops Traced" value={5} max={7} type="dots"
                      visual={{ total: 7, current: 5, colors: ['#10B981','#F59E0B','#F59E0B','#EF4444','#EF4444','#9CA3AF','#9CA3AF'] }}
                      compact
                    />
                    <MetricCard
                      label="Chains" value={completedData.chains.length} max={3} type="badges"
                      visual={{ badges: completedData.chains }}
                      compact
                    />
                  </div>

                  <div>
                    <p className={`${SECTION_LABEL} mb-[6px]`}>Primary Typology</p>
                    <StatusChip status="escalated" label={completedData.typology} size="sm" />
                  </div>

                  <div>
                    <p className={`${SECTION_LABEL} mb-[10px]`}>Top Findings</p>
                    {completedData.findings.map((text, i) => (
                      <div key={i} className="flex gap-[8px] mb-[8px]">
                        <AlertTriangle size={14} className="text-[#F59E0B] shrink-0 mt-[1px]" />
                        <p className="text-[13px] text-[#374151] leading-[1.4]">{text}</p>
                      </div>
                    ))}
                  </div>

                  <Callout severity="critical">
                    <strong>Immediate action recommended.</strong> Risk score {completedData.riskScore} with confirmed mixer usage and structuring pattern — this wallet meets the threshold for formal case investigation.
                  </Callout>

                  <div className="flex flex-col gap-[8px]">
                    <div className="flex gap-[8px]">
                      <Btn variant="dark" icon={FolderPlus} onClick={() => { setAssignLeadSelected(selectedLead?.id ?? ''); setShowAssignLeadModal(true); }} className="flex-1 justify-center">
                        Open Case
                      </Btn>
                      <Btn variant="outline" icon={FileText} onClick={() => setShowReport(true)} className="flex-1 justify-center">
                        Report
                      </Btn>
                    </div>
                    <Btn variant="primary" icon={Zap} onClick={() => navigate(`/search?q=${encodeURIComponent(wallet)}`)} className="w-full justify-center">
                      Run Again
                    </Btn>
                  </div>
                </div>
              )}

              {/* Open Case — Confirm */}
              {isComplete && openCaseStep === 'confirm' && (
                <div className="mt-[16px] border-t border-[#ECEEF2] pt-[16px] flex flex-col gap-[12px]">
                  <div className="flex items-center gap-[8px]">
                    <FolderPlus size={16} className="text-[#374151]" />
                    <span className="text-[14px] font-semibold text-[#0A0A0F]">Opening Case</span>
                  </div>
                  <div className="bg-[#F8F9FB] border border-[#ECEEF2] rounded-[10px] p-[14px] flex flex-col gap-[10px]">
                    {([
                      ['Case ID', 'CASE-2026-0012'],
                      ['Wallet', truncateAddress(wallet || '0x1234567890ab')],
                      ['Risk Level', null],
                      ['Typology', 'Mixer Usage & Structuring'],
                      ['Analyst', currentUser?.name ?? 'James Analyst'],
                      ['Lead', selectedLead?.name ?? '—'],
                    ] as [string, string | null][]).map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[11px] text-[#9CA3AF] mb-[2px]">{label}</p>
                        {label === 'Risk Level'
                          ? <StatusChip risk="High" size="sm" />
                          : <p className={cn('text-[13px] text-[#374151]', label === 'Case ID' ? 'font-semibold' : 'font-normal')}>{value}</p>}
                      </div>
                    ))}
                    <div>
                      <label className="text-[11px] font-medium text-[#0A0A0F] block mb-[4px]">
                        Initial Note <span className="text-[#EF4444]">*</span>
                      </label>
                      <textarea
                        value={initialCaseNote}
                        onChange={(e) => setInitialCaseNote(e.target.value.slice(0, 250))}
                        placeholder="Add your initial assessment..."
                        rows={3}
                        className="w-full bg-white border border-[#D1D5DB] rounded-[10px] px-[14px] py-[9px] text-[12px] text-[#111827] resize-none outline-none font-[inherit] box-border transition-[border-color,box-shadow] duration-150 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#B0BCC8] focus:border-[#4B7AC7] focus:shadow-[0_0_0_3px_rgba(75,122,199,0.12)]"
                      />
                      <p className={`text-[11px] mt-[2px] ${initialCaseNote.length > 200 ? 'text-[#EF4444]' : 'text-[#9CA3AF]'}`}>{initialCaseNote.length} / 250</p>
                    </div>
                  </div>
                  <div className="flex gap-[8px]">
                    <Btn variant="dark" disabled={!initialCaseNote.trim()} onClick={() => setOpenCaseStep('success')} className="flex-1 justify-center">
                      Confirm & Open Case
                    </Btn>
                    <Btn variant="outline" onClick={() => setOpenCaseStep(null)} className="flex-1 justify-center">
                      Cancel
                    </Btn>
                  </div>
                </div>
              )}

              {/* Open Case — Success */}
              {isComplete && openCaseStep === 'success' && (
                <div className="mt-[16px] border-t border-[#ECEEF2] pt-[24px] flex flex-col items-center gap-[16px] text-center">
                  <div className="w-[56px] h-[56px] rounded-full bg-[#D1FAE5] flex items-center justify-center">
                    <CheckCircle size={28} className="text-[#10B981]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-[#0A0A0F]">Case Opened Successfully</p>
                    <p className="text-[13px] font-semibold text-[#374151] mt-[4px]">CASE-2026-0012</p>
                    <p className="text-[12px] text-[#9CA3AF] mt-[2px]">Risk Level: High</p>
                  </div>
                  <div className="flex flex-col gap-[8px] w-full">
                    <Btn variant="dark" onClick={() => navigate('/cases/CASE-2026-0012', { state: { initialCaseNote } })} className="w-full justify-center">View Case File</Btn>
                    <Btn variant="outline" onClick={() => navigate(-1)} className="w-full justify-center">Continue Investigation</Btn>
                  </div>
                </div>
              )}

            </div>
          </div>
          )}

        </main>
      </div>
    </div>

    {showReport && (
      <ReportOverlay
        report={{ id: 'RPT-LIVE', walletAddress: wallet, type: 'basic', caseId: null, generatedBy: 'System', date: new Date().toISOString().slice(0,10), riskLevel: completedData.riskScore >= 90 ? 'Critical' : completedData.riskScore >= 70 ? 'High' : 'Medium', riskScore: completedData.riskScore }}
        onClose={() => setShowReport(false)}
        hideTypeSwitch
      />
    )}

    {/* Assign Lead modal */}
    <Modal open={showAssignLeadModal} theme="light" title="Assign Lead" onClose={() => { setShowAssignLeadModal(false); setAssignLeadNote(''); }}>
      <p className="text-[13px] text-[#6B7280] leading-[1.55] m-0 mb-[20px]">
        Choose the lead who will oversee and approve this investigation. You can change this later from the case file.
      </p>
      <div className="flex flex-col gap-[16px] mb-[20px]">
        <div>
          <label className="text-[12px] font-semibold text-[#374151] mb-[6px] block">Lead *</label>
          <CustomSelect
            value={assignLeadSelected}
            onChange={setAssignLeadSelected}
            placeholder="Select lead…"
            options={leadUsers.map(u => ({ value: u.id, label: u.name }))}
          />
        </div>
        <div>
          <label className="text-[12px] font-semibold text-[#374151] mb-[6px] block">Note (optional)</label>
          <textarea
            value={assignLeadNote}
            onChange={e => setAssignLeadNote(e.target.value)}
            placeholder="e.g. Urgent — escalated by compliance team"
            rows={2}
            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] px-[10px] py-[8px] text-[13px] text-[#111827] resize-y outline-none box-border font-[inherit] leading-[1.5] transition-[border-color] duration-150 hover:border-[#D1D5DB] focus:border-[#4B7AC7]"
          />
        </div>
      </div>
      <div className="flex justify-end gap-[8px]">
        <Btn variant="outline" onClick={() => { setShowAssignLeadModal(false); setAssignLeadNote(''); }}>Cancel</Btn>
        <Btn
          variant="dark"
          disabled={!assignLeadSelected}
          onClick={() => {
            const lead = leadUsers.find(u => u.id === assignLeadSelected) ?? null;
            setSelectedLead(lead);
            setShowAssignLeadModal(false);
            setAssignLeadNote('');
            setOpenCaseStep('confirm');
          }}
        >
          Confirm & Continue
        </Btn>
      </div>
    </Modal>
  </>
  );
}
