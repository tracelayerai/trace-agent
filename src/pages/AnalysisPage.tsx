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
import { CustomSelect } from '@/components/core/CustomSelect';
import { SURFACE, TABLE, COLORS, INPUT } from '@/tokens/designTokens';
import { useAuth, MOCK_USERS, ROLES } from '@/context/AuthContext';
import type { User } from '@/context/AuthContext';
import { mockTransactions } from '@/data/mock/transactions';
import type { Transaction } from '@/data/mock/transactions';
import { mockAnalysisCompleted, mockAnalysisRunning } from '@/data/mock/analysisLog';
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

type SurfaceOverlay = {
  width: number | string;
  bg: string;
  borderLeft: string;
  shadow: string;
  separator: string;
  header: { padding: number | string; titleSize: number; titleWeight: number; titleColor: string; subtitleSize: number; subtitleColor: string };
  body: { padding: number | string };
  sectionLabel: React.CSSProperties;
};

const SO = SURFACE.overlay as unknown as SurfaceOverlay;

const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
const truncateHash    = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-8)}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

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
          <span style={TABLE.cell.mono as React.CSSProperties}>{truncateHash(String(v))}</span>
          <a href={`https://etherscan.io/tx/${v}`} target="_blank" rel="noopener noreferrer" style={{ color: '#9CA3AF' }}>
            <ExternalLink size={12} />
          </a>
        </span>
      ),
    },
    { key: 'dateTime',   label: 'Date',       render: (v: unknown): ReactNode => <span style={TABLE.cell.mono as React.CSSProperties}>{formatDate(String(v))}</span> },
    { key: 'from',       label: 'From',       render: (v: unknown): ReactNode => <span style={TABLE.cell.mono as React.CSSProperties}>{truncateAddress(String(v))}</span> },
    { key: 'to',         label: 'To',         render: (v: unknown): ReactNode => <span style={TABLE.cell.mono as React.CSSProperties}>{truncateAddress(String(v))}</span> },
    {
      key: 'amount', label: 'Amount',
      render: (v: unknown, row: Record<string, unknown>): ReactNode => {
        const color = row.type === 'Receive' ? '#10B981' : '#7C3AED';
        const sign  = row.type === 'Receive' ? '+' : '-';
        return <span style={{ ...(TABLE.cell.numeric as React.CSSProperties), color, fontSize: 13 }}>{sign}{String(v)} ETH</span>;
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

  const SF = SURFACE.frame as unknown as { bg: string; padding: number | string; borderRadius: number };
  const SC = SURFACE.content as unknown as { bg: string; bodyBg: string; borderRadius: number | string; shadow: string; padding: number | string };
  const SH = SURFACE.header as unknown as { borderBottom: string; paddingX: number };
  const SP = SURFACE.panel as unknown as { bg: string; border: string; borderRadius: number | string };
  const SCard = SURFACE.card as unknown as { bg: string; border: string; borderRadius: number | string; shadow: string; padding: number | string };
  const CL = COLORS as unknown as { accent: { teal: string }; text: { dark: string; light: string; body: string } };

  return (
  <>
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: SF.bg, padding: SF.padding, gap: SF.padding, boxSizing: 'border-box' }}>
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: SF.padding, overflow: 'hidden' }}>
        <main style={{ flex: 1, overflow: 'hidden', background: SC.bg, borderRadius: SC.borderRadius, boxShadow: SC.shadow, display: 'flex', flexDirection: 'column', position: 'relative' }}>

          <div style={{ flexShrink: 0 }}>
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
          <div style={{ flex: 1, overflowY: 'auto', background: SC.bodyBg }}>

            <div style={{ padding: SC.padding, paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!flagCalloutDismissed && (
                <Callout severity="warning" onDismiss={() => setFlagCalloutDismissed(true)}>
                  <strong>{flagged.length} compliance flags detected</strong> across {mockTransactions.length} transactions<br />
                  Review the highlighted rows in the Flags tab below
                </Callout>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 1px 1fr', gap: 8, alignItems: 'stretch' }}>
                {[
                  { label: 'All Transactions', value: mockTransactions.length, accent: '#2563EB', tab: 0 },
                  { label: 'Total Inflow',      value: `${inflow.toFixed(2)} ETH`, accent: '#10B981', tab: 1 },
                  { label: 'Total Outflow',     value: `${outflow.toFixed(2)} ETH`, accent: '#7C3AED', tab: 2 },
                  { label: 'Flags',             value: flagged.length, accent: '#F59E0B', tab: 3 },
                ].map(({ label, value, accent, tab }) => (
                  <StatCard key={label} label={label} value={value} accent={accent} compact onClick={() => setActiveTab(tab)} active={activeTab === tab} />
                ))}
                <div style={{ background: '#E5E7EB', alignSelf: 'stretch' }} />
                <StatCard label="Net Balance" value={`${(inflow - outflow).toFixed(2)} ETH`} accent="#6B7280" compact />
              </div>
            </div>

            <div style={{ display: 'flex', borderBottom: SH.borderBottom, padding: `0 ${SH.paddingX}px` }}>
              {TABS.map((tab, i) => (
                <TabBtn key={tab} label={tab} active={activeTab === i} onClick={() => setActiveTab(i)} />
              ))}
            </div>

            <div style={{ padding: SC.padding, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 80 }}>
              {activeTab < 4 && (
                <Table
                  density="relaxed"
                  columns={txColumns}
                  data={getFiltered() as unknown as Record<string, unknown>[]}
                  flaggedRowIds={flagged.map((t: Transaction) => t.id)}
                />
              )}
              {activeTab === 4 && (
                <div style={{ background: SCard.bg, border: SCard.border, borderRadius: SCard.borderRadius, boxShadow: SCard.shadow, padding: SCard.padding }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0F4F8', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Wallet size={20} style={{ color: '#7B90AA' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: CL.text.dark, lineHeight: 1.3 }}>Entity Profile</div>
                      <div style={{ fontSize: 12, color: CL.text.light, marginTop: 2 }}>Individual · Unverified</div>
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
                    <div key={label} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <span style={{ fontSize: 12, color: CL.text.light }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: CL.text.body }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analysis panel */}
          {showPanel && (
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: SO.width, background: SO.bg, borderLeft: SO.borderLeft, boxShadow: SO.shadow, zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: SO.header.padding, borderBottom: SO.separator, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1B2D58', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={15} style={{ color: '#C6FF00' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                    <span style={{ fontSize: SO.header.titleSize, fontWeight: SO.header.titleWeight, color: SO.header.titleColor }}>Trace Agent</span>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  </div>
                  <p style={{ fontSize: SO.header.subtitleSize, color: SO.header.subtitleColor, margin: 0 }}>
                    AI Analysis · {truncateAddress(wallet || '0x7a3d4f8e9b2c')}
                  </p>
                </div>
              </div>
              <GhostIcon icon={X} size="sm" onClick={() => setShowPanel(false)} />
            </div>

            {/* Timer */}
            <div style={{ flexShrink: 0, borderBottom: SO.separator }}>
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
              <div style={{ padding: '6px 20px', fontSize: 11, textAlign: 'center', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {isComplete ? (
                  <>
                    <span style={{ color: '#10B981' }}>✓</span>
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
                <div style={{ height: 2, background: 'rgba(16,185,129,0.12)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '25%', background: 'linear-gradient(90deg, transparent, #10B981, transparent)', animation: 'scanPulse 1.6s ease-in-out infinite' }} />
                </div>
              )}
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: SO.body.padding }}>

              {/* Log entries */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {logEntries.map((entry, idx) => {
                  const cfg = LOG_ICON_CONFIG[entry.type] || LOG_ICON_CONFIG.info;
                  return (
                    <div key={entry.id} style={{ display: 'flex', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <cfg.Icon size={13} />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>{((idx + 1) * 0.5).toFixed(1)}s</p>
                        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{entry.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Queue hint — running */}
              {!isComplete && showQueueHint && (
                <div style={{ marginTop: 16 }}>
                  <Callout severity="info" onDismiss={() => setShowQueueHint(false)}>
                    Analysis runs in the background — check back via <strong>⚡ AI Analysis</strong> in the left menu.
                  </Callout>
                </div>
              )}

              {/* Preliminary findings — running */}
              {!isComplete && logEntries.length > 0 && (
                <div style={{ marginTop: 16, borderTop: SO.separator, paddingTop: 16 }}>
                  <p style={{ ...SO.sectionLabel, marginBottom: 10 }}>Preliminary Findings</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {logEntries.length > 4 && <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '10px 12px' }}><p style={{ fontSize: 11, color: '#9CA3AF' }}>Sanctions Match</p><p style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>Detected</p></div>}
                    {logEntries.length > 4 && <div style={{ background: '#FFFBEB', borderRadius: 8, padding: '10px 12px' }}><p style={{ fontSize: 11, color: '#9CA3AF' }}>Typology</p><p style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>Sanctions Evasion</p></div>}
                    <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '10px 12px' }}><p style={{ fontSize: 11, color: '#9CA3AF' }}>Hops Traced</p><p style={{ fontSize: 13, fontWeight: 600, color: '#3B82F6' }}>{Math.min(logEntries.length, 7)}</p></div>
                    <div style={{ background: '#F5F3FF', borderRadius: 8, padding: '10px 12px' }}><p style={{ fontSize: 11, color: '#9CA3AF' }}>Chains</p><p style={{ fontSize: 13, fontWeight: 600, color: '#7C3AED' }}>{Math.min(Math.ceil(logEntries.length / 2), 3)}</p></div>
                  </div>
                </div>
              )}

              {/* Complete results */}
              {isComplete && openCaseStep === null && (
                <div style={{ marginTop: 16, borderTop: SO.separator, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ ...SO.sectionLabel }}>Analysis Complete</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
                    <p style={{ ...SO.sectionLabel, marginBottom: 6 }}>Primary Typology</p>
                    <StatusChip status="escalated" label={completedData.typology} size="sm" />
                  </div>

                  <div>
                    <p style={{ ...SO.sectionLabel, marginBottom: 10 }}>Top Findings</p>
                    {completedData.findings.map((text, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <AlertTriangle size={14} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{text}</p>
                      </div>
                    ))}
                  </div>

                  <Callout severity="critical">
                    <strong>Immediate action recommended.</strong> Risk score {completedData.riskScore} with confirmed mixer usage and structuring pattern — this wallet meets the threshold for formal case investigation.
                  </Callout>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Btn variant="dark" icon={FolderPlus} onClick={() => { setAssignLeadSelected(selectedLead?.id ?? ''); setShowAssignLeadModal(true); }} style={{ flex: 1, justifyContent: 'center' }}>
                        Open Case
                      </Btn>
                      <Btn variant="outline" icon={FileText} onClick={() => setShowReport(true)} style={{ flex: 1, justifyContent: 'center' }}>
                        Report
                      </Btn>
                    </div>
                    <Btn variant="primary" icon={Zap} onClick={() => navigate(`/search?q=${encodeURIComponent(wallet)}`)} style={{ width: '100%', justifyContent: 'center' }}>
                      Run Again
                    </Btn>
                  </div>
                </div>
              )}

              {/* Open Case — Confirm */}
              {isComplete && openCaseStep === 'confirm' && (
                <div style={{ marginTop: 16, borderTop: SO.separator, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FolderPlus size={16} style={{ color: '#374151' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0F' }}>Opening Case</span>
                  </div>
                  <div style={{ background: SP.bg, border: SP.border, borderRadius: SP.borderRadius, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {([
                      ['Case ID', 'CASE-2026-0012'],
                      ['Wallet', truncateAddress(wallet || '0x1234567890ab')],
                      ['Risk Level', null],
                      ['Typology', 'Mixer Usage & Structuring'],
                      ['Analyst', currentUser?.name ?? 'James Analyst'],
                      ['Lead', selectedLead?.name ?? '—'],
                    ] as [string, string | null][]).map(([label, value]) => (
                      <div key={label}>
                        <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>{label}</p>
                        {label === 'Risk Level'
                          ? <StatusChip risk="High" size="sm" />
                          : <p style={{ fontSize: 13, color: '#374151', fontWeight: label === 'Case ID' ? 600 : 400 }}>{value}</p>}
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 500, color: '#0A0A0F', display: 'block', marginBottom: 4 }}>
                        Initial Note <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <textarea
                        value={initialCaseNote}
                        onChange={(e) => setInitialCaseNote(e.target.value.slice(0, 250))}
                        placeholder="Add your initial assessment..."
                        rows={3}
                        style={{ width: '100%', padding: INPUT.padding as string, border: INPUT.border as string, borderRadius: INPUT.borderRadius as number, fontSize: 12, color: INPUT.color as string, background: INPUT.bg as string, resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', boxShadow: INPUT.shadow as string, transition: INPUT.transition as string }}
                      />
                      <p style={{ fontSize: 11, color: initialCaseNote.length > 200 ? '#EF4444' : '#9CA3AF', marginTop: 2 }}>{initialCaseNote.length} / 250</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn variant="dark" disabled={!initialCaseNote.trim()} onClick={() => setOpenCaseStep('success')} style={{ flex: 1, justifyContent: 'center' }}>
                      Confirm & Open Case
                    </Btn>
                    <Btn variant="outline" onClick={() => setOpenCaseStep(null)} style={{ flex: 1, justifyContent: 'center' }}>
                      Cancel
                    </Btn>
                  </div>
                </div>
              )}

              {/* Open Case — Success */}
              {isComplete && openCaseStep === 'success' && (
                <div style={{ marginTop: 16, borderTop: SO.separator, paddingTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={28} style={{ color: '#10B981' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0F' }}>Case Opened Successfully</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 4 }}>CASE-2026-0012</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Risk Level: High</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                    <Btn variant="dark" onClick={() => navigate('/cases/CASE-2026-0012', { state: { initialCaseNote } })} style={{ width: '100%', justifyContent: 'center' }}>View Case File</Btn>
                    <Btn variant="outline" onClick={() => navigate(-1)} style={{ width: '100%', justifyContent: 'center' }}>Continue Investigation</Btn>
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
      <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55, margin: '0 0 20px' }}>
        Choose the lead who will oversee and approve this investigation. You can change this later from the case file.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>Lead *</label>
          <CustomSelect
            value={assignLeadSelected}
            onChange={setAssignLeadSelected}
            placeholder="Select lead…"
            options={leadUsers.map(u => ({ value: u.id, label: u.name }))}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>Note (optional)</label>
          <textarea
            value={assignLeadNote}
            onChange={e => setAssignLeadNote(e.target.value)}
            placeholder="e.g. Urgent — escalated by compliance team"
            rows={2}
            style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#111827', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5 }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
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
