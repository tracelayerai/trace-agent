import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownRight, ArrowUpRight, ExternalLink,
  Zap, AlertTriangle, AlertOctagon, Info, X,
  FolderPlus, CheckCircle, FileText, Wallet, UserPlus,
} from 'lucide-react';
import { useAuth, MOCK_USERS, ROLES } from '@/context/AuthContext';
import type { User } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import SearchBar from '@/components/SearchBar';
import { Table } from '@/components/core/Table';
import { StatusChip } from '@/components/core/StatusChip';
import { StatCard } from '@/components/ui';
import { CaseHeader, TabBtn, GhostIcon, Btn } from '@/components/core/CaseHeader';
import { Modal } from '@/components/core/Modal';
import { CustomSelect } from '@/components/core/CustomSelect';
import { Callout, MetricCard } from '@/components/core/MetricCard';
import logoIcon from '@/assets/images/ta_bw_logo_icon.svg';
import mascot from '@/assets/images/masc1.jpg';
import { mockTransactions } from '@/services/transactionsService';
import type { Transaction } from '@/services/transactionsService';
import { mockAnalysisLog, mockAnalysisRunning } from '@/services/analysisService';
import { ReportOverlay } from '@/pages/ReportsPage';
import { cn } from '@/lib/utils';

const SearchTabBtn = TabBtn;

const WALLET_ADDRESS = '0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f4a5b6c7d';

type LogIconConfig = { bg: string; color: string; Icon: React.ElementType };
const LOG_ICON_CONFIG: Record<string, LogIconConfig> = {
  info:     { bg: '#EFF6FF', color: '#3B82F6', Icon: Info },
  warning:  { bg: '#FFFBEB', color: '#F59E0B', Icon: AlertTriangle },
  critical: { bg: '#FEF2F2', color: '#EF4444', Icon: AlertOctagon },
};

interface MockAnalyst {
  id: string;
  name: string;
  title: string;
  initials: string;
}

const MOCK_ANALYSTS: MockAnalyst[] = [
  { id: 'user-001', name: 'James Analyst',  title: 'Senior Analyst',      initials: 'JA' },
  { id: 'user-004', name: 'Emma Wilson',    title: 'Analyst',              initials: 'EW' },
  { id: 'user-005', name: 'Iris Martinez',  title: 'Analyst',              initials: 'IM' },
  { id: 'user-006', name: 'Grace Lee',      title: 'Compliance Analyst',   initials: 'GL' },
];

interface LogEntry {
  id: string;
  type: string;
  message: string;
  delay?: number;
  icon?: string;
}

interface RecentSearch {
  wallet: string;
  chain: string;
  riskLevel: string;
  compliance: string;
  timestamp: string;
}

const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
const truncateHash    = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-8)}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLead, currentUser } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [assignee, setAssignee] = useState<User | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignModalSelected, setAssignModalSelected] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerIvRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const skipAnimationRef = useRef<boolean>(false);
  const [openCaseStep, setOpenCaseStep] = useState<'confirm' | 'success' | null>(null);
  const [flagCalloutDismissed, setFlagCalloutDismissed] = useState(false);
  const [showQueueHint, setShowQueueHint] = useState(false);
  const [initialCaseNote, setInitialCaseNote] = useState('');

  const [showAssignLeadModal, setShowAssignLeadModal] = useState(false);
  const [assignLeadSelected, setAssignLeadSelected] = useState('');
  const [assignLeadNote, setAssignLeadNote] = useState('');
  const [selectedLead, setSelectedLead] = useState<User | null>(null);

  const leadUsers = Object.values(MOCK_USERS).filter(u => u.role === ROLES.LEAD);

  const [_recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches') || '[]') as RecentSearch[]; }
    catch { return []; }
  });

  const addRecentSearch = useCallback((entry: RecentSearch) => {
    setRecentSearches(prev => {
      const deduped = prev.filter(s => s.wallet !== entry.wallet);
      const updated = [entry, ...deduped].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    addRecentSearch({
      wallet: WALLET_ADDRESS, chain: 'Ethereum',
      riskLevel: 'Critical', compliance: 'Flagged',
      timestamp: new Date().toISOString(),
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const flag = searchParams.get('openAnalysis');
    if (flag === 'complete') {
      skipAnimationRef.current = true;
      setLogEntries(mockAnalysisLog as LogEntry[]);
      setAnalysisComplete(true);
      setTimer(83);
      setShowAnalysisPanel(true);
    } else if (flag === 'running') {
      skipAnimationRef.current = true;
      setLogEntries(mockAnalysisRunning as LogEntry[]);
      setTimer(47);
      setShowQueueHint(true);
      setShowAnalysisPanel(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showAnalysisPanel) {
      setOpenCaseStep(null);
      setInitialCaseNote('');
      setShowQueueHint(false);
      setAnalysisComplete(false);
      setLogEntries([]);
      skipAnimationRef.current = false;
    }
  }, [showAnalysisPanel]);

  useEffect(() => {
    if (!showAnalysisPanel || analysisComplete) { setShowQueueHint(false); return; }
    const t = setTimeout(() => setShowQueueHint(true), 10000);
    return () => clearTimeout(t);
  }, [showAnalysisPanel, analysisComplete]);

  useEffect(() => {
    if (!showAnalysisPanel || skipAnimationRef.current) return;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    mockAnalysisLog.forEach((entry) => {
      timeouts.push(setTimeout(() => setLogEntries((prev) => [...prev, entry as LogEntry]), entry.delay));
    });
    const totalDelay = mockAnalysisLog.reduce((max, e) => Math.max(max, e.delay), 0);
    timeouts.push(setTimeout(() => setAnalysisComplete(true), totalDelay + 500));
    return () => timeouts.forEach(clearTimeout);
  }, [showAnalysisPanel]);

  useEffect(() => {
    if (!showAnalysisPanel) {
      clearInterval(timerIvRef.current ?? undefined);
      timerIvRef.current = null;
      setTimer(0);
      return;
    }
    timerIvRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => { clearInterval(timerIvRef.current ?? undefined); timerIvRef.current = null; };
  }, [showAnalysisPanel]);

  useEffect(() => {
    if (analysisComplete) {
      clearInterval(timerIvRef.current ?? undefined);
      timerIvRef.current = null;
    }
  }, [analysisComplete]);

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
    { key: 'dateTime', label: 'Date',    render: (v: unknown): ReactNode => <span className="font-mono text-[12px] text-[#4A5568]">{formatDate(String(v))}</span> },
    { key: 'from',     label: 'From',    render: (v: unknown): ReactNode => <span className="font-mono text-[12px] text-[#4A5568]">{truncateAddress(String(v))}</span> },
    { key: 'to',       label: 'To',      render: (v: unknown): ReactNode => <span className="font-mono text-[12px] text-[#4A5568]">{truncateAddress(String(v))}</span> },
    {
      key: 'amount', label: 'Amount',
      render: (v: unknown, row: Record<string, unknown>): ReactNode => {
        const color = row.type === 'Receive' ? '#10B981' : '#7C3AED';
        const sign  = row.type === 'Receive' ? '+' : '-';
        return <span className="font-mono text-[13px] font-bold" style={{ color }}>{sign}{String(v)} ETH</span>;
      },
    },
    { key: 'status',     label: 'Status',     render: (v: unknown): ReactNode => <StatusChip status={v === 'Confirmed' ? 'approved' : 'open'} label={String(v)} size="sm" /> },
    {
      key: 'compliance', label: 'Compliance',
      render: (v: unknown): ReactNode => <StatusChip status={v === 'clear' ? 'approved' : 'returned'} label={v === 'clear' ? 'Clear' : 'Flagged'} size="sm" />,
    },
  ];

  const TABS = [
    `All Transactions (${mockTransactions.length})`,
    `Inflows (${receives.length})`,
    `Outflows (${sends.length})`,
    `Flags (${flagged.length})`,
    'Customer Info',
  ];

  return (
  <>
    {/* Frame */}
    <div className="flex h-screen overflow-hidden p-[8px] gap-[8px] box-border bg-[linear-gradient(160deg,#060C1A_0%,#0C1D3C_55%,#091630_100%)]">
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div className="flex-1 flex flex-col gap-[8px] overflow-hidden">

        {/* Top bar */}
        <div className="shrink-0 h-[60px] rounded-[16px] flex items-center justify-start px-[8px] relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[16px]">
            <img src={mascot} alt="" className="absolute" style={{ right: -77, bottom: -164, height: 384, width: 'auto', objectFit: 'contain', objectPosition: 'bottom right', pointerEvents: 'none', zIndex: 1, WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 72%, transparent 100%)', maskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 72%, transparent 100%)' }} />
          </div>
          <div className="w-full max-w-[740px] bg-[#0A1528] rounded-full h-[44px] relative z-[2]">
            <SearchBar
              variant="nav"
              pill
              placeholder="Search wallet address..."
              initialValue={searchParams.get('q') ?? ''}
              onSearch={(q: string) => {
                sessionStorage.setItem('traceSearchQuery', q);
                navigate(`/search?q=${encodeURIComponent(q)}`);
              }}
              onClear={() => {
                sessionStorage.removeItem('traceSearchQuery');
                navigate('/search');
              }}
            />
          </div>
        </div>

        {/* Main content */}
        <main className={cn(
          'flex-1 overflow-hidden rounded-[16px] flex flex-col relative',
          'shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_2px_8px_rgba(0,0,0,0.03),inset_0_-2px_8px_rgba(0,0,0,0.02)]',
          !searchParams.get('q')
            ? 'bg-[linear-gradient(180deg,#F5F6FA_0%,#EAEBF0_60%,#E3E4EA_100%)]'
            : 'bg-[linear-gradient(180deg,#B8D0E4_0%,#CBE0ED_15%,#DEEEF6_28%,#EDF3F7_40%,#F0F2F7_55%)]',
        )}>

          {/* Empty state */}
          {!searchParams.get('q') && (
            <div className="flex-1 flex flex-col items-center justify-center px-[32px] py-[48px] text-center gap-[16px]">
              <div className="max-w-[480px]">
                <img src={logoIcon} alt="" className="w-[80px] h-[80px] object-contain block mx-auto mb-[16px] [filter:invert(70%)_sepia(15%)_saturate(300%)_hue-rotate(185deg)_opacity(30%)]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[rgba(30,50,80,0.28)] mb-[12px]">TraceAgent</p>
                <h2 className="text-[24px] font-semibold text-[rgba(30,50,80,0.35)] leading-[1.35] tracking-[-0.01em] m-0">
                  Investigate any wallet address<br />in minutes, not hours
                </h2>
              </div>
              <div className="max-w-[360px]">
                <p className="text-[13px] text-[rgba(30,50,80,0.22)] leading-[1.75] mb-[10px]">
                  Enter a digital wallet ID to get clear, auditable investigative reports from a single address — powered by AI.
                </p>
                <p className="text-[12px] text-[rgba(30,50,80,0.16)] leading-[1.7]">
                  If vulnerabilities are found, open a case to investigate flagged transactions further.
                </p>
              </div>
            </div>
          )}

          {/* CaseHeader */}
          {searchParams.get('q') && (
            <div className="shrink-0">
              <CaseHeader
                title={`${WALLET_ADDRESS.slice(0, 10)}…${WALLET_ADDRESS.slice(-6)}`}
                copyText={WALLET_ADDRESS}
                chips={[
                  { chain: 'ethereum' },
                  { label: 'First seen Jan 3, 2024' },
                  { label: 'Last active Feb 18, 2026' },
                ]}
                showStatusRow={false}
                actions={[
                  ...(isLead ? [{
                    variant: (assignee ? 'dark' : 'outline') as 'dark' | 'outline',
                    icon: UserPlus,
                    label: assignee ? assignee.name : 'Assign Analyst',
                    onClick: () => { setAssignModalSelected(assignee?.id ?? currentUser?.id ?? ''); setAssignNote(''); setShowAssignModal(true); },
                  }] : []),
                  { variant: 'primary' as const, icon: Zap, label: 'Run Analysis', onClick: () => { setShowAnalysisPanel(true); setLogEntries([]); setAnalysisComplete(false); } },
                ]}
              />
            </div>
          )}

          {/* Scrollable content */}
          {searchParams.get('q') && (
            <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#F5F6FA_0%,#EAEBF0_60%,#E3E4EA_100%)]">

              {/* Alert + KPI */}
              <div className="px-[32px] py-[24px] pb-[16px] flex flex-col gap-[16px]">
                {!flagCalloutDismissed && (
                  <Callout severity="warning" onDismiss={() => setFlagCalloutDismissed(true)}>
                    <strong>{flagged.length} compliance flags detected</strong> across {mockTransactions.length} transactions<br />
                    Review the highlighted rows in the Flags tab below
                  </Callout>
                )}
                <div className="grid gap-[8px] items-stretch grid-cols-[repeat(4,1fr)_1px_1fr]">
                  {[
                    { label: 'All Transactions', value: mockTransactions.length,      accent: '#2563EB', tab: 0 },
                    { label: 'Total Inflow',      value: `${inflow.toFixed(2)} ETH`,  accent: '#10B981', tab: 1 },
                    { label: 'Total Outflow',     value: `${outflow.toFixed(2)} ETH`, accent: '#7C3AED', tab: 2 },
                    { label: 'Flags',             value: flagged.length,              accent: '#F59E0B', tab: 3 },
                  ].map(({ label, value, accent, tab }) => (
                    <StatCard
                      key={label}
                      label={label}
                      value={value}
                      accent={accent}
                      compact
                      onClick={() => setActiveTab(tab)}
                      active={activeTab === tab}
                    />
                  ))}
                  <div className="bg-[#E5E7EB] self-stretch" />
                  <StatCard
                    label="Net Balance"
                    value={`${(inflow - outflow).toFixed(2)} ETH`}
                    accent="#6B7280"
                    compact
                  />
                </div>
              </div>

              {/* Tab bar */}
              <div className="flex border-b border-[#ECEEF2] px-[32px]">
                {TABS.map((tab, i) => (
                  <SearchTabBtn key={tab} label={tab} active={activeTab === i} onClick={() => setActiveTab(i)} />
                ))}
              </div>

              {/* Tab content */}
              <div className="px-[32px] py-[24px] pt-[16px] flex flex-col gap-[16px] pb-[80px]">

                {activeTab < 4 && (
                  <Table
                    density="relaxed"
                    columns={txColumns}
                    data={getFiltered() as unknown as Record<string, unknown>[]}
                    flaggedRowIds={flagged.map((t: Transaction) => t.id)}
                  />
                )}

                {activeTab === 4 && (
                  <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
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
                      ['Last Active',      'February 18, 2026'],
                      ['Total Volume',     '$847,234 USD equivalent'],
                      ['Associated VASPs', 'None identified'],
                      ['KYT Status',       'Under Review'],
                    ] as [string, string][]).map(([label, value], i, arr) => (
                      <div key={label} className={cn('grid py-[9px] grid-cols-[180px_1fr] items-center', i < arr.length - 1 ? 'border-b border-[#F3F4F6]' : '')}>
                        <span className="text-[12px] text-[#5C6578]">{label}</span>
                        <span className="text-[13px] font-medium text-[#374151]">{value}</span>
                      </div>
                    ))}
                    <div className="border-t border-[#E5E7EB] mt-[12px] pt-[14px]">
                      <div className="text-[12px] text-[#5C6578] mb-[6px] font-medium">Notes</div>
                      <p className="text-[13px] text-[#374151] leading-[1.55] m-0">No verified identity. High transaction frequency flagged for review.</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Analysis side panel */}
          {searchParams.get('q') && showAnalysisPanel && (
            <div className="absolute top-0 right-0 bottom-0 w-[360px] bg-white flex flex-col overflow-hidden rounded-tr-[16px] rounded-br-[16px] z-50 border-l border-[#ECEEF2] shadow-[-6px_0_28px_rgba(0,0,0,0.09),-1px_0_4px_rgba(0,0,0,0.04)]">

              {/* Panel header */}
              <div className="px-[20px] py-[16px] flex items-center justify-between shrink-0 border-b border-[#ECEEF2]">
                <div className="flex items-center gap-[10px]">
                  <div className="w-[32px] h-[32px] rounded-[10px] bg-[#1B2D58] flex items-center justify-center shrink-0">
                    <Zap size={15} className="text-[#C6FF00]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-[7px] mb-[2px]">
                      <span className="text-[14px] font-bold text-[#0A0A0F]">Trace Agent</span>
                      <span className="w-[6px] h-[6px] rounded-full bg-[#10B981] inline-block" />
                    </div>
                    <p className="text-[12px] text-[#9CA3AF] m-0">AI Analysis · {truncateAddress(WALLET_ADDRESS)}</p>
                  </div>
                </div>
                <GhostIcon icon={X} size="sm" onClick={() => setShowAnalysisPanel(false)} />
              </div>

              {/* Timer */}
              <div className="shrink-0 border-b border-[#ECEEF2]">
                <style>{`
                  @keyframes scanPulse { 0% { transform:translateX(-100%); } 100% { transform:translateX(400%); } }
                  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
                `}</style>
                <div className="px-[20px] py-[6px] text-[11px] text-[#10B981] flex items-center justify-center gap-[6px]">
                  {analysisComplete ? (
                    <><span>✓</span><span>{`Completed in ${Math.floor(timer / 60)}m ${String(timer % 60).padStart(2,'0')}s`}</span></>
                  ) : (
                    <><span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:'#10B981', animation:'blink 1.2s ease-in-out infinite', flexShrink:0 }} /><span>{`Analysing… ${Math.floor(timer / 60)}m ${String(timer % 60).padStart(2,'0')}s`}</span></>
                  )}
                </div>
                {!analysisComplete && (
                  <div className="h-[2px] bg-[rgba(16,185,129,0.12)] overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full w-[25%]" style={{ background:'linear-gradient(90deg,transparent,#10B981,transparent)', animation:'scanPulse 1.6s ease-in-out infinite' }} />
                  </div>
                )}
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-[20px] py-[14px]">

                {/* Log entries */}
                <div className="flex flex-col gap-[12px]">
                  {logEntries.map((entry, idx) => {
                    const cfg = LOG_ICON_CONFIG[entry.type] || LOG_ICON_CONFIG.info;
                    return (
                      <div key={entry.id} className="flex gap-[10px]">
                        <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 mt-[2px]"
                          style={{ background: cfg.bg, color: cfg.color }}>
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

                {/* Queue hint */}
                {showQueueHint && !analysisComplete && (
                  <div className="mt-[16px]">
                    <Callout severity="info" onDismiss={() => setShowQueueHint(false)}>
                      <strong>This may take a few more minutes</strong> depending on the number of transactions associated with this wallet.<br />
                      You can close this panel and come back — track progress via the <strong>⚡ AI Analysis</strong> item in the left menu.
                    </Callout>
                  </div>
                )}

                {/* Preliminary findings */}
                {logEntries.length > 0 && !analysisComplete && (
                  <div className="mt-[16px] pt-[16px] border-t border-[#ECEEF2]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#9CA3AF] mb-[10px]">Preliminary Findings</p>
                    <div className="grid grid-cols-2 gap-[8px]">
                      {logEntries.length > 4 && <div className="bg-[#FEF2F2] rounded-[10px] px-[12px] py-[10px]"><p className="text-[11px] text-[#9CA3AF]">Sanctions Match</p><p className="text-[13px] font-semibold text-[#EF4444]">Detected</p></div>}
                      {logEntries.length > 5 && <div className="bg-[#FFFBEB] rounded-[10px] px-[12px] py-[10px]"><p className="text-[11px] text-[#9CA3AF]">Typology</p><p className="text-[13px] font-semibold text-[#F59E0B]">Sanctions Evasion</p></div>}
                      <div className="bg-[#EFF6FF] rounded-[10px] px-[12px] py-[10px]"><p className="text-[11px] text-[#9CA3AF]">Hops Traced</p><p className="text-[13px] font-semibold text-[#3B82F6]">{Math.min(logEntries.length, 7)}</p></div>
                      <div className="bg-[#F5F3FF] rounded-[10px] px-[12px] py-[10px]"><p className="text-[11px] text-[#9CA3AF]">Chains</p><p className="text-[13px] font-semibold text-[#7C3AED]">{Math.min(Math.ceil(logEntries.length / 2), 3)}</p></div>
                    </div>
                  </div>
                )}

                {/* Analysis complete — results */}
                {analysisComplete && openCaseStep === null && (
                  <div className="mt-[16px] pt-[16px] flex flex-col gap-[16px] border-t border-[#ECEEF2]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#9CA3AF]">Analysis Complete</p>

                    <div className="grid grid-cols-2 gap-[8px]">
                      <MetricCard label="Risk Score" value={94} max={100} type="gradient-bar" compact />
                      <MetricCard label="AI Confidence" value={91} max={100} type="vertical-bar" displayValue="91%" compact />
                      <MetricCard
                        label="Hops Traced"
                        value={7}
                        max={7}
                        type="dots"
                        color="#EF4444"
                        visual={{
                          total: 7,
                          current: 7,
                          colors: ['#10B981', '#10B981', '#F59E0B', '#F59E0B', '#EF4444', '#EF4444', '#EF4444'],
                        }}
                        compact
                      />
                      <MetricCard
                        label="Chains"
                        value={3}
                        max={3}
                        type="badges"
                        visual={{ badges: [
                          { label: 'ETH', bg: '#454A75' },
                          { label: 'BTC', bg: '#E8911E' },
                          { label: 'TRX', bg: '#C1272D' },
                        ]}}
                        compact
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#9CA3AF] mb-[6px]">Primary Typology</p>
                      <StatusChip status="escalated" label="Sanctions Evasion" size="sm" />
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#9CA3AF] mb-[10px]">Top Findings</p>
                      {[
                        'Direct 2-hop connection to OFAC-sanctioned address',
                        'Cross-chain obfuscation via Hop Protocol bridge',
                        'Transaction frequency 200/hr — inconsistent with retail profile',
                      ].map((text, i) => (
                        <div key={i} className="flex gap-[8px] mb-[8px]">
                          <AlertTriangle size={14} className="text-[#F59E0B] shrink-0 mt-[1px]" />
                          <p className="text-[13px] text-[#374151] leading-[1.4]">{text}</p>
                        </div>
                      ))}
                    </div>

                    <Callout severity="critical">
                      <strong>Immediate action recommended.</strong> Risk score 94 with confirmed sanctions match — this wallet meets the threshold for formal case investigation under your compliance policy.
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
                      <Btn variant="primary" icon={Zap} onClick={() => { setShowAnalysisPanel(false); setLogEntries([]); setAnalysisComplete(false); setTimeout(() => { setShowAnalysisPanel(true); }, 50); }} className="w-full justify-center">
                        Run Again
                      </Btn>
                    </div>
                  </div>
                )}

                {/* Open Case — Confirm */}
                {analysisComplete && openCaseStep === 'confirm' && (
                  <div className="mt-[16px] pt-[16px] flex flex-col gap-[12px] border-t border-[#ECEEF2]">
                    <div className="flex items-center gap-[8px]">
                      <FolderPlus size={16} className="text-[#374151]" />
                      <span className="text-[14px] font-semibold text-[#0A0A0F]">Opening Case</span>
                    </div>
                    <div className="bg-white rounded-[12px] border border-[#ECEEF2] p-[14px] flex flex-col gap-[10px]">
                      {([['Case ID', 'CASE-2026-0011'], ['Wallet', truncateAddress(WALLET_ADDRESS)], ['Risk Level', null], ['Typology', 'Sanctions Evasion & Layering'], ['Analyst', assignee?.name ?? 'James Analyst'], ['Lead', selectedLead?.name ?? '—']] as [string, string | null][]).map(([label, value]) => (
                        <div key={label}>
                          <p className="text-[11px] text-[#9CA3AF] mb-[2px]">{label}</p>
                          {label === 'Risk Level'
                            ? <StatusChip risk="Critical" size="sm" />
                            : <p className={`text-[13px] text-[#374151] ${label === 'Case ID' ? 'font-semibold' : ''}`}>{value}</p>}
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
                          className="w-full px-[12px] py-[8px] border border-[#D1D5DB] rounded-[8px] text-[12px] text-[#111827] bg-white resize-none outline-none font-[inherit] box-border"
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
                {analysisComplete && openCaseStep === 'success' && (
                  <div className="mt-[16px] pt-[24px] flex flex-col items-center gap-[16px] text-center border-t border-[#ECEEF2]">
                    <div className="w-[56px] h-[56px] rounded-full bg-[#D1FAE5] flex items-center justify-center">
                      <CheckCircle size={28} className="text-[#10B981]" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#0A0A0F]">Case Opened Successfully</p>
                      <p className="text-[13px] font-semibold text-[#374151] mt-[4px]">CASE-2026-0011</p>
                      <p className="text-[12px] text-[#9CA3AF] mt-[2px]">Risk Level: Critical</p>
                    </div>
                    <div className="flex flex-col gap-[8px] w-full">
                      <Btn variant="dark" onClick={() => { navigate('/cases/CASE-2026-0011', { state: { initialCaseNote } }); setShowAnalysisPanel(false); }} className="w-full justify-center">View Case File</Btn>
                      <Btn variant="outline" onClick={() => { setShowAnalysisPanel(false); setOpenCaseStep(null); }} className="w-full justify-center">Continue Investigation</Btn>
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
        report={{ id: 'RPT-LIVE', walletAddress: searchParams.get('q') || '', type: 'basic', caseId: null, generatedBy: 'System', date: new Date().toISOString().slice(0,10), riskLevel: 'Critical', riskScore: 94 }}
        onClose={() => setShowReport(false)}
        hideTypeSwitch
      />
    )}

    {/* Assign Analyst modal */}
    <Modal open={showAssignModal} theme="light" title="Assign Analyst" onClose={() => setShowAssignModal(false)}>
      <p className="text-[13px] text-[#6B7280] leading-[1.55] m-0 mb-[20px]">
        The assigned analyst will take ownership of this investigation. You can reassign after the case is opened.
      </p>
      <div className="flex flex-col gap-[16px]">
        <div>
          <label className="text-[12px] font-semibold text-[#374151] mb-[6px] block">Analyst *</label>
          <CustomSelect
            value={assignModalSelected}
            onChange={setAssignModalSelected}
            placeholder="Select analyst…"
            options={[
              ...(currentUser ? [{ value: currentUser.id, label: `${currentUser.name} (Myself)` }] : []),
              ...MOCK_ANALYSTS.filter(a => a.id !== currentUser?.id).map(a => ({ value: a.id, label: a.name })),
            ]}
          />
        </div>
        <div>
          <label className="text-[12px] font-semibold text-[#374151] mb-[6px] block">Note (optional)</label>
          <textarea
            value={assignNote}
            onChange={e => setAssignNote(e.target.value)}
            placeholder="e.g. Prioritise — related to open SAR filing"
            rows={2}
            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] px-[10px] py-[8px] text-[13px] text-[#111827] resize-y outline-none box-border font-[inherit] leading-[1.5]"
          />
        </div>
      </div>
      <div className="flex justify-end gap-[8px] mt-[20px]">
        <Btn variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Btn>
        <Btn
          variant="dark"
          disabled={!assignModalSelected}
          onClick={() => {
            const analyst =
              assignModalSelected === currentUser?.id
                ? (currentUser as User)
                : (MOCK_ANALYSTS.find(a => a.id === assignModalSelected) as unknown as User | undefined) ?? null;
            setAssignee(analyst);
            setShowAssignModal(false);
          }}
        >
          Confirm
        </Btn>
      </div>
    </Modal>

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
            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] px-[10px] py-[8px] text-[13px] text-[#111827] resize-y outline-none box-border font-[inherit] leading-[1.5]"
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
