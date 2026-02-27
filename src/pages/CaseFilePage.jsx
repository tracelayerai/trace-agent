import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Download,
  Printer,
  MessageSquare,
  XCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import logo from '../assets/images/ta_bw_logo.svg';
import { AppShell } from '../components/layout';
import { Button, Badge, Card, Table, Modal, Textarea } from '../components/ui';
import { ReportPreview } from '../components/ReportPreview';
import { mockCases } from '../data/mock/cases';
import { mockTransactions } from '../data/mock/transactions';
import { mockCaseNotes, mockStatusHistory } from '../data/mock/caseNotes';

const CASE_ID = 'CASE-2026-0011';

const HOP_TRACE = [
  { n: 1, from: '0x8f3a...2b1c', to: '0x7a3d...6c7d', amount: '+142.88 ETH', action: 'Received from mixer-associated cluster' },
  { n: 2, from: '0x7a3d...6c7d', to: 'Hop Bridge', amount: '142.88 ETH', action: 'Cross-chain bridge initiated' },
  { n: 3, from: 'Hop Protocol', to: '0x9c4e...7f2a', amount: '142.75 ETH', action: 'Funds arrived on Arbitrum' },
  { n: 4, from: '0x9c4e...7f2a', to: 'DEX Aggregator', amount: '142.75 ETH', action: 'Swapped to USDC via 1inch' },
  { n: 5, from: 'DEX', to: '12 wallets', amount: '~11.9 ETH each', action: 'Systematic fragmentation' },
  { n: 6, from: 'Fragmentation wallets', to: '0xb4e2...c021', amount: '138.20 ETH', action: 'Consolidation — 92% recovery' },
  { n: 7, from: '0xb4e2...c021', to: 'VASP (non-coop)', amount: '138.20 ETH', action: 'Final destination' },
];

const TOP_FLAGS = [
  { severity: 'Critical', text: 'Direct 2-hop connection to OFAC-sanctioned address 0x4f2a...9e1b' },
  { severity: 'High', text: 'Cross-chain obfuscation via Hop Protocol bridge' },
  { severity: 'High', text: 'Transaction frequency 200/hr — inconsistent with retail profile' },
];

const REPORT_HOPS = [
  { n: 1, from: '0x8f3a...2b1c', to: '0x7a3d...6c7d', amount: '+142.88 ETH', action: 'Received from mixer-associated cluster', chain: 'Ethereum', warn: true },
  { n: 2, from: '0x7a3d...6c7d', to: 'Hop Protocol Bridge', amount: '142.88 ETH', action: 'Cross-chain bridge initiated', chain: 'Ethereum → Arbitrum', warn: true },
  { n: 3, from: 'Hop Protocol', to: '0x9c4e...7f2a', amount: '142.75 ETH', action: 'Funds arrived on Arbitrum', chain: 'Arbitrum', warn: false },
  { n: 4, from: '0x9c4e...7f2a', to: 'DEX Aggregator', amount: '142.75 ETH', action: 'Swapped to USDC via 1inch', chain: 'Arbitrum', warn: false },
  { n: 5, from: 'DEX', to: '12 fragmentation wallets', amount: '~11.9 ETH each', action: 'Systematic fragmentation — structuring pattern', chain: 'Arbitrum', warn: true },
  { n: 6, from: 'Fragmentation wallets', to: '0xb4e2...c021', amount: '138.20 ETH', action: 'Consolidation — 92% recovery rate', chain: 'Arbitrum', warn: false },
  { n: 7, from: '0xb4e2...c021', to: 'VASP (non-coop)', amount: '138.20 ETH', action: 'Final destination — hosted VASP', chain: 'Arbitrum', warn: true },
];

const CHAIN_OF_CUSTODY = [
  { timestamp: 'Feb 27, 2026 13:58', action: 'Wallet Searched', by: 'James Analyst', details: 'Initial search via TraceAgent platform' },
  { timestamp: 'Feb 27, 2026 14:02', action: 'Detailed Analysis Run', by: 'James Analyst', details: 'AI trace initiated — 8 hops analyzed' },
  { timestamp: 'Feb 27, 2026 14:05', action: 'Case Opened', by: 'James Analyst', details: 'Case CASE-2026-0011 created, risk: Critical' },
  { timestamp: 'Feb 27, 2026 14:15', action: 'Note Added', by: 'James Analyst', details: 'Sanctions match confirmed' },
  { timestamp: 'Feb 27, 2026 14:28', action: 'Note Added', by: 'James Analyst', details: 'Bridge activity traced' },
  { timestamp: 'Feb 27, 2026 15:42', action: 'Status Updated', by: 'Sarah Chen', details: 'Escalated to Critical' },
  { timestamp: 'Feb 27, 2026 15:43', action: 'Note Added', by: 'Sarah Chen', details: 'SAR filing approved' },
];

export default function CaseFilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [status, setStatus] = useState('Open');
  const [riskLevel, setRiskLevel] = useState('Critical');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [notes, setNotes] = useState([...mockCaseNotes]);
  const [newNote, setNewNote] = useState('');
  const [statusHistory, setStatusHistory] = useState([...mockStatusHistory]);
  const [reportTabType, setReportTabType] = useState('full');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [notesBannerDismissed, setNotesBannerDismissed] = useState(false);
  const notesTextareaRef = useRef(null);

  // Pre-populate "Case Opened" with initial note when coming from Analysis Panel
  useEffect(() => {
    const initialNote = location.state?.initialCaseNote;
    if (initialNote && typeof initialNote === 'string' && initialNote.trim()) {
      setStatusHistory((prev) => {
        const opened = prev.find((s) => s.action === 'Case Opened');
        const rest = prev.filter((s) => s.id !== opened?.id);
        if (opened) {
          return [{ ...opened, note: initialNote.trim() }, ...rest];
        }
        return [{ id: 'status-0', action: 'Case Opened', author: 'James Analyst', role: 'Senior Analyst', timestamp: '2026-02-27T14:05:00Z', note: initialNote.trim(), type: 'Status Change' }, ...rest];
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.initialCaseNote, location.pathname, navigate]);

  const caseData = mockCases.find((c) => c.id === id) || {
    id: id || CASE_ID,
    walletAddress: '0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f4a5b6c7d',
    chain: 'Ethereum',
    riskLevel: 'Critical',
    riskScore: 94,
    typology: 'Sanctions Evasion & Layering',
    status: 'Open',
    assignedAnalyst: 'James Analyst',
    dateOpened: '2026-02-27',
    lastUpdated: '2026-02-27',
    sanctions: true,
    exposurePercent: 94,
  };

  const flaggedTransactions = useMemo(
    () => mockTransactions.filter((t) => t.compliance === 'flagged').slice(0, 4),
    []
  );

  const truncateAddress = (addr) => `${addr?.slice(0, 6)}...${addr?.slice(-4)}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatDateTime = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleConfirmClose = () => {
    if (closeReason.trim().length < 20) return;
    setStatus('Closed');
    const reason = closeReason.trim();
    setStatusHistory((prev) => [
      ...prev,
      {
        id: `status-${Date.now()}`,
        action: 'Case Closed',
        author: 'James Analyst',
        role: 'Senior Analyst',
        timestamp: new Date().toISOString(),
        note: reason,
        type: 'Status Change',
      },
    ]);
    setNotes((prev) => [
      ...prev,
      {
        id: `note-status-${Date.now()}`,
        author: 'James Analyst',
        role: 'Senior Analyst',
        timestamp: new Date().toISOString(),
        content: `Case closed by James Analyst — ${reason}`,
        type: 'Status Change',
        isStatusChange: true,
      },
    ]);
    setCloseReason('');
    setShowCloseModal(false);
  };

  const handleConfirmReopen = () => {
    if (reopenReason.trim().length < 20) return;
    setStatus('Reopened');
    const reason = reopenReason.trim();
    setStatusHistory((prev) => [
      ...prev,
      {
        id: `status-${Date.now()}`,
        action: 'Case Reopened',
        author: 'James Analyst',
        role: 'Senior Analyst',
        timestamp: new Date().toISOString(),
        note: reason,
        type: 'Status Change',
      },
    ]);
    setNotes((prev) => [
      ...prev,
      {
        id: `note-status-${Date.now()}`,
        author: 'James Analyst',
        role: 'Senior Analyst',
        timestamp: new Date().toISOString(),
        content: `Case reopened by James Analyst — ${reason}`,
        type: 'Status Change',
        isStatusChange: true,
      },
    ]);
    setReopenReason('');
    setShowReopenModal(false);
  };

  const goToNotesAndFocus = () => {
    setActiveTab(3);
    setTimeout(() => notesTextareaRef.current?.focus(), 100);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes((prev) => [
      {
        id: `note-${Date.now()}`,
        author: 'James Analyst',
        role: 'Senior Analyst',
        timestamp: new Date().toISOString(),
        content: newNote.trim(),
        type: 'Investigation Note',
      },
      ...prev,
    ]);
    setNewNote('');
  };

  const allNotesForDisplay = useMemo(() => {
    const statusItems = statusHistory.map((s) => ({
      ...s,
      content: s.note || s.action,
      isStatusChange: true,
    }));
    return [...statusItems, ...notes].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [notes, statusHistory]);

  const caseProgressTimeline = useMemo(() => {
    const noteEvents = notes
      .filter((n) => !n.isStatusChange)
      .map((n) => ({ id: `tl-${n.id}`, action: 'Note Added', author: n.author, timestamp: n.timestamp }));
    return [...statusHistory, ...noteEvents].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [statusHistory, notes]);

  if (!caseData) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <h1 className="text-2xl font-700 text-text-primary mb-2">Case Not Found</h1>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </AppShell>
    );
  }

  const tabs = [
    { label: 'Overview', id: 0 },
    { label: 'Transactions', id: 1 },
    { label: 'Analysis', id: 2 },
    { label: 'Notes', id: 3 },
    { label: 'Report', id: 4 },
  ];

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(caseData.walletAddress);
  };

  return (
    <AppShell>
      {/* Header — full width, white, bottom border */}
      <header className="bg-white border-b border-border">
        <div className="px-6 py-6">
          {/* Row 1 — Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-text-secondary mb-4">
            <button onClick={() => navigate('/dashboard')} className="hover:text-text-primary flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <span>/</span>
            <button onClick={() => navigate('/cases')} className="hover:text-text-primary">Cases</button>
            <span>/</span>
            <span className="text-text-primary font-500">{caseData.id}</span>
          </nav>

          {/* Row 2 — Case identity + Primary actions */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{caseData.id}</h1>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm text-gray-500 font-mono">{caseData.walletAddress}</code>
                <button onClick={handleCopyWallet} className="text-gray-400 hover:text-text-primary p-0.5" title="Copy">
                  <Copy size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" size="sm">{caseData.chain}</Badge>
                <span className="text-sm text-text-secondary">{caseData.typology}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(status === 'Open' || status === 'Reopened') && (
                <>
                  <Button variant="secondary" onClick={goToNotesAndFocus} className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    Add Review Note
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowCloseModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-500 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <XCircle size={16} />
                    Close Case
                  </button>
                </>
              )}
              {status === 'Closed' && (
                <Button variant="secondary" onClick={() => setShowReopenModal(true)} className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50">
                  <RefreshCw size={16} />
                  Reopen Case
                </Button>
              )}
            </div>
          </div>

          {/* Row 3 — Status strip */}
          <div className="mt-4 flex flex-wrap items-center gap-4 py-3 px-0 bg-[#F9FAFB] border-y border-border text-sm">
            <Badge variant={`status-${status.toLowerCase()}`}>{status}</Badge>
            <span className="text-gray-400">|</span>
            <Badge variant={`risk-${riskLevel.toLowerCase()}`}>{riskLevel}</Badge>
            <span className="text-gray-400">|</span>
            <span className="text-text-secondary">Assigned: <span className="text-text-primary font-500">{caseData.assignedAnalyst}</span></span>
            <span className="text-gray-400">|</span>
            <span className="text-text-secondary">Opened: {formatDate(caseData.dateOpened)}</span>
            <span className="text-gray-400">|</span>
            <span className="text-text-secondary">Last Updated: {formatDate(caseData.lastUpdated)}</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-500 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 0 && (
          <div className="space-y-6">
            {/* Top row — 5 KPI cards */}
            <div className="grid grid-cols-5 gap-4">
              {/* Card 1 — Risk Score */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Risk Score</p>
                <p className="text-3xl font-bold text-red-500 mt-1">{caseData.riskScore ?? 94}</p>
                <div className="mt-auto pt-3">
                  <div className="relative h-1.5 w-full rounded-full bg-[#F3F4F6] overflow-visible">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500"
                      style={{ left: `${Math.min(100, Math.max(0, caseData.riskScore ?? 94))}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                    <span>0 — Low</span>
                    <span>50 — Med</span>
                    <span>100 — High</span>
                  </div>
                </div>
              </div>

              {/* Card 2 — AI Confidence */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">AI Confidence</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">91%</p>
                <div className="mt-auto pt-2 flex justify-center" style={{ height: 40 }}>
                  <svg width="100%" height="40" viewBox="0 0 120 40" className="overflow-visible">
                    <path d="M 10 38 A 50 50 0 0 1 110 38" fill="none" stroke="#E5E7EB" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 10 38 A 50 50 0 0 1 110 38" fill="none" stroke="#111827" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${0.91 * 157} 20`} />
                  </svg>
                </div>
              </div>

              {/* Card 3 — Risk Exposure */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-row items-stretch gap-3">
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Risk Exposure</p>
                  <p className="text-3xl font-bold text-orange-500 mt-1">{caseData.exposurePercent ?? 76}%</p>
                </div>
                <div className="w-2 rounded-full bg-[#F3F4F6] flex flex-col justify-end flex-shrink-0 self-stretch">
                  <div className="rounded-full bg-[#F97316] w-full" style={{ height: `${caseData.exposurePercent ?? 76}%`, minHeight: 4 }} />
                </div>
              </div>

              {/* Card 4 — Hops Traced */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Hops Traced</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">7</p>
                <div className="mt-auto pt-3 flex items-center justify-center gap-0.5">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <span key={i} className="flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          i === 0 ? 'bg-gray-900' : i === 6 ? 'bg-white border-2 border-red-500' : 'bg-gray-400'
                        }`}
                      />
                      {i < 6 && <span className="w-2 h-px bg-gray-300 flex-shrink-0" />}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card 5 — Chains */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Chains</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
                <div className="mt-auto pt-3 flex flex-wrap gap-1.5">
                  <span className="text-xs font-medium text-white bg-gray-900 rounded-full px-2 py-0.5">ETH</span>
                  <span className="text-xs font-medium text-white bg-blue-600 rounded-full px-2 py-0.5">ARB</span>
                  <span className="text-xs font-medium text-white bg-purple-600 rounded-full px-2 py-0.5">POL</span>
                </div>
              </div>
            </div>

            {/* Middle — two cards side by side */}
            <div className="grid grid-cols-2 gap-6">
              <Card padding="md">
                <h3 className="text-sm font-600 text-text-primary mb-4">Risk Indicators</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Sanctions</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="risk-critical">FLAGGED</Badge>
                      <span className="text-xs text-gray-500">OFAC, FinCEN</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Typology</p>
                    <p className="text-sm font-500 text-text-primary">Sanctions Evasion & Layering</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-2">Exposure</p>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${caseData.exposurePercent || 76}%` }} />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{caseData.exposurePercent || 76}%</p>
                  </div>
                </div>
              </Card>
              <Card padding="md">
                <h3 className="text-sm font-600 text-text-primary mb-4">On-Chain Summary</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-text-secondary">First Seen</p>
                    <p className="font-500 text-text-primary">Jan 3, 2024</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Last Active</p>
                    <p className="font-500 text-text-primary">Feb 18, 2026</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Total Volume</p>
                    <p className="font-500 text-text-primary">284,500 USDT equivalent</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Chains</p>
                    <p className="font-500 text-text-primary">Ethereum, Arbitrum, Polygon</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Bottom — AI Executive Summary full width */}
            <Card padding="lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">AI Executive Summary</h3>
                <span className="text-xs text-gray-500">Generated by Trace Agent</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Wallet {truncateAddress(caseData.walletAddress)} was identified as high-risk following autonomous multi-chain tracing initiated on February 27, 2026. The subject wallet received 284.50 ETH from a mixer-associated cluster and executed systematic cross-chain layering via Hop Protocol bridge. Trace Agent confirmed a 2-hop connection to an OFAC-sanctioned address. Transaction frequency of 200/hr is inconsistent with declared retail trader profile. Case escalated for SAR filing with FinCEN.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab(2)}
                className="mt-4 text-sm font-500 text-accent hover:underline"
              >
                View full analysis →
              </button>
            </Card>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-600 text-text-primary">Flagged transactions (4)</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/search?q=${caseData.walletAddress}`)}>
                View full wallet explorer →
              </Button>
            </div>
            <Table
              columns={[
                { key: 'hash', label: 'Hash', render: (v) => <code className="text-xs">{truncateAddress(v)}</code> },
                { key: 'dateTime', label: 'Date', render: (v) => formatDateTime(v) },
                { key: 'amount', label: 'Amount', render: (v, r) => `${r.type === 'Receive' ? '+' : '-'}${v} ${r.token}` },
                { key: 'flagReason', label: 'Flag reason', render: (v) => v || '—' },
                {
                  key: 'compliance',
                  label: 'Compliance',
                  render: (v) => (
                    <Badge variant={v === 'flagged' ? 'compliance-flagged' : 'compliance-clear'}>
                      {v === 'flagged' ? 'Flagged' : 'Clear'}
                    </Badge>
                  ),
                },
              ]}
              data={flaggedTransactions}
            />
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-6">
            <p className="text-xs text-gray-500">Generated by Trace Agent · Feb 27, 2026 14:32 UTC</p>
            {/* Same 2 KPI cards as Overview — Risk Score and AI Confidence */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Risk Score</p>
                <p className="text-3xl font-bold text-red-500 mt-1">{caseData.riskScore ?? 94}</p>
                <div className="mt-auto pt-3">
                  <div className="relative h-1.5 w-full rounded-full bg-[#F3F4F6] overflow-visible">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500"
                      style={{ left: `${Math.min(100, Math.max(0, caseData.riskScore ?? 94))}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                    <span>0 — Low</span>
                    <span>50 — Med</span>
                    <span>100 — High</span>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">AI Confidence</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">91%</p>
                <div className="mt-auto pt-2 flex justify-center" style={{ height: 40 }}>
                  <svg width="100%" height="40" viewBox="0 0 120 40" className="overflow-visible">
                    <path d="M 10 38 A 50 50 0 0 1 110 38" fill="none" stroke="#E5E7EB" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 10 38 A 50 50 0 0 1 110 38" fill="none" stroke="#111827" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${0.91 * 157} 20`} />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-600 text-text-primary mb-3">Hop trace (7 hops)</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                {HOP_TRACE.map((hop) => (
                  <li key={hop.n} className="text-text-secondary">
                    <span className="font-mono">{hop.from}</span> → <span className="font-mono">{hop.to}</span>
                    {' '}{hop.amount} — {hop.action}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="text-sm font-600 text-text-primary mb-3">Top risk flags</h3>
              <div className="space-y-2">
                {TOP_FLAGS.map((f, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Badge variant={f.severity === 'Critical' ? 'risk-critical' : 'risk-high'} size="sm">
                      {f.severity}
                    </Badge>
                    <p className="text-sm text-text-primary">{f.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-6">
            {/* Dismissible instruction banner */}
            {!notesBannerDismissed && (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-l-4 border-l-blue-500 bg-[#EFF6FF]">
                <MessageSquare size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-800 flex-1">
                  This is your investigation workspace. Add notes as you review the case. Close the case when your review is complete.
                </p>
                <button
                  type="button"
                  onClick={() => setNotesBannerDismissed(true)}
                  className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Case Progress timeline — oldest at top, newest at bottom */}
            <div>
              <h3 className="text-sm font-600 text-text-primary mb-3">Case Progress</h3>
              <div className="space-y-2 text-sm">
                {caseProgressTimeline.map((e) => (
                  <div key={e.id} className="flex gap-3 items-center py-2">
                    <span className="text-blue-600">●</span>
                    <span className="font-500 text-text-primary">{e.action}</span>
                    <span className="text-gray-500">— {e.author}</span>
                    <span className="text-gray-400 ml-auto">{formatDateTime(e.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Note */}
            <Card padding="md" className="border border-border shadow-sm">
              <label className="block text-sm font-500 text-text-primary mb-2">Add Note</label>
              <textarea
                ref={notesTextareaRef}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your investigation note here..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-xl text-base bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px] mb-2 resize-y"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary">{newNote.length} characters</span>
                <Button variant="primary" size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                  Add Note
                </Button>
              </div>
            </Card>

            {/* Notes Log — chronological, oldest first */}
            <div>
              <h3 className="text-sm font-600 text-text-primary mb-3">Notes Log</h3>
              <div className="space-y-4">
                {allNotesForDisplay.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-lg border border-border bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-600 text-white">
                          {n.author?.split(' ').map((x) => x[0]).join('') || '?'}
                        </div>
                        <span className="font-600 text-sm text-text-primary">{n.author}</span>
                        <span className="text-xs text-gray-500">{n.role}</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDateTime(n.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2" style={{ fontSize: '14px' }}>{n.content}</p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-500 ${
                        n.isStatusChange ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {n.type || 'Investigation Note'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 4 && (
          <div className="relative">
            {/* Floating action bar — sticky at top of tab */}
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-end gap-3 py-3 mb-4 bg-page/95 backdrop-blur border-b border-border -mx-0 px-0">
              <div className="flex rounded-lg border border-border p-0.5 bg-surface">
                {['basic', 'analysis', 'full'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setReportTabType(type)}
                    className={`px-4 py-2 text-sm font-500 rounded-md transition-colors ${
                      reportTabType === type ? 'bg-accent text-white' : 'text-text-secondary hover:bg-gray-100'
                    }`}
                  >
                    {type === 'basic' ? 'Basic' : type === 'analysis' ? 'Analysis' : 'Full'}
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => window.print()} className="flex items-center gap-2">
                <Printer size={16} />
                Print
              </Button>
              <Button variant="primary" size="sm" onClick={() => alert('Export PDF')} className="flex items-center gap-2">
                <Download size={16} />
                Export PDF
              </Button>
            </div>

            {/* Report document — inline */}
            <div className="max-w-[800px] mx-auto bg-white border border-border rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 md:p-8 space-y-6">
                {/* Cover block */}
                <div className="bg-[#F9FAFB] rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <img src={logo} alt="TraceAgent" className="h-7" />
                      <span className="font-600 text-text-primary">TraceAgent</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {reportTabType === 'basic' ? 'BASIC' : reportTabType === 'analysis' ? 'ANALYSIS' : 'FULL'} INVESTIGATIVE REPORT
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Generated: Feb 27, 2026 at 14:32 UTC</p>
                      <p className="text-xs text-gray-500">Generated by: James Analyst — Senior Analyst</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border space-y-2">
                    <p className="text-xl font-bold text-text-primary">Case ID: {caseData.id}</p>
                    <p className="font-mono text-sm text-gray-600">Subject: {caseData.walletAddress}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="text-gray-600">Chain: Ethereum</span>
                      <Badge variant="risk-critical">CRITICAL</Badge>
                      <span className="text-gray-600">Typology: Sanctions Evasion & Layering</span>
                    </div>
                  </div>
                </div>

                {/* 01 — Executive Summary */}
                {(['basic', 'analysis', 'full'].includes(reportTabType)) && (
                  <>
                    <div className="border-t border-border pt-6">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">01 — Executive Summary</h3>
                      <p className="text-sm leading-relaxed text-gray-700">
                        Wallet {truncateAddress(caseData.walletAddress)} was identified as high-risk following autonomous multi-chain tracing initiated on February 27, 2026. The subject wallet received 284.50 ETH from a mixer-associated cluster and executed systematic cross-chain layering via Hop Protocol bridge. Trace Agent confirmed a 2-hop connection to OFAC-sanctioned address 0x4f2a...9e1b. Transaction frequency of 200/hr is inconsistent with declared retail trader profile. Case escalated for SAR filing with FinCEN.
                      </p>
                    </div>
                  </>
                )}

                {/* 02 — Fund Flow Trace */}
                {(['basic', 'analysis', 'full'].includes(reportTabType)) && (
                  <div className="border-t border-border pt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">02 — Fund Flow Trace</h3>
                    <p className="text-xs text-gray-600 mb-4">7 hops traced across 3 chains — Ethereum, Arbitrum, Polygon</p>
                    <div className="space-y-3">
                      {REPORT_HOPS.map((hop) => (
                        <div key={hop.n} className="flex gap-3 items-start">
                          <div className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {String(hop.n).padStart(2, '0')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs text-gray-700">{hop.from} → {hop.to} | {hop.amount}</p>
                            <p className="text-sm text-gray-600 mt-0.5">{hop.action}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" size="sm">{hop.chain}</Badge>
                              {hop.n === 7 ? <span className="text-red-500">🔴</span> : hop.warn && <span className="text-amber-500">⚠️</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 03 — Risk Flags */}
                {(['basic', 'analysis', 'full'].includes(reportTabType)) && (
                  <div className="border-t border-border pt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">03 — Risk Flags & Indicators</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-red-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="risk-critical">CRITICAL</Badge>
                          <span className="font-600 text-sm text-text-primary">SANCTIONS EXPOSURE</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-1">
                          Direct 2-hop connection to OFAC-sanctioned address 0x4f2a...9e1b. Source: OFAC SDN List March 2024. Constitutes reportable sanctions exposure under 31 CFR Part 501.
                        </p>
                        <p className="text-xs text-gray-500 font-mono">Evidence: 0xf0e1d2c3...8f7a6b5c</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="risk-high">HIGH</Badge>
                          <span className="font-600 text-sm text-text-primary">TECHNICAL OBFUSCATION</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-1">
                          Non-custodial mixer combined with cross-chain bridge usage across 3 networks within 47 minutes. Consistent with professional money laundering tradecraft.
                        </p>
                        <p className="text-xs text-gray-500">Evidence: Hops 1–3 above</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="risk-high">HIGH</Badge>
                          <span className="font-600 text-sm text-text-primary">BEHAVIORAL ANOMALY</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-1">
                          Transaction frequency 200/hr inconsistent with declared retail trader profile. Automated execution strongly suggested. Matches FinCEN FIN-2023-A001.
                        </p>
                        <p className="text-xs text-gray-500">Evidence: Transaction cluster Jan 13, 2024</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 04 — Risk Assessment */}
                {(['analysis', 'full'].includes(reportTabType)) && (
                  <div className="border-t border-border pt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">04 — Risk Assessment</h3>
                    <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                      <div>
                        <p className="font-600 text-text-primary mb-1">Compliance Rationale:</p>
                        <p>Deliberate fund fragmentation across 12 wallets combined with cross-chain bridging in compressed timeframe indicates calculated attempt to defeat automated monitoring systems.</p>
                      </div>
                      <div>
                        <p className="font-600 text-text-primary mb-1">Threat Actor Assessment:</p>
                        <p>Technical sophistication, mixer-adjacent infrastructure, and non-cooperative VASP destination suggest professionally managed operation or state-sponsored actor bypassing economic sanctions.</p>
                      </div>
                      <div>
                        <p className="font-600 text-text-primary mb-1">Regulatory Impact:</p>
                        <p>Failure to freeze and report constitutes violation of FinCEN 2024 Stablecoin Guidance and OFAC regulations. Immediate SAR filing recommended.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 05 — Analyst Notes */}
                {(['analysis', 'full'].includes(reportTabType)) && (
                  <div className="border-t border-border pt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">05 — Analyst Notes</h3>
                    <div className="space-y-4">
                      {mockCaseNotes.map((note) => (
                        <div key={note.id} className="pb-4 border-b border-border last:border-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-600 text-sm text-text-primary">{note.author} — {note.role}</p>
                            <span className="text-xs text-gray-500">{formatDateTime(note.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 06 — Chain of Custody */}
                {reportTabType === 'full' && (
                  <div className="border-t border-border pt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">06 — Chain of Custody</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500">Timestamp</th>
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500">Action</th>
                            <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500">Performed By</th>
                            <th className="text-left py-2 text-xs font-semibold text-gray-500">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {CHAIN_OF_CUSTODY.map((row, i) => (
                            <tr key={i} className={`border-b border-border ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                              <td className="py-2 pr-4 text-gray-600">{row.timestamp}</td>
                              <td className="py-2 pr-4 font-500 text-text-primary">{row.action}</td>
                              <td className="py-2 pr-4 text-gray-600">{row.by}</td>
                              <td className="py-2 text-gray-600">{row.details}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-border pt-6 text-center text-xs text-gray-400">
                  <p>Generated by TraceAgent — Trace Layer Inc. | CONFIDENTIAL — Regulatory Use Only | Case {caseData.id}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Preview Modal */}
      {showReportModal && (
        <ReportPreview
          initialType="full"
          caseId={id}
          walletAddress={caseData.walletAddress}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Close Case — Blocking modal */}
      <Modal
        isOpen={showCloseModal}
        title={
          <span className="flex items-center gap-2">
            <XCircle size={22} className="text-red-500 flex-shrink-0" />
            Close Case {caseData.id}
          </span>
        }
        onClose={() => {}}
        blocking
        className="max-w-[480px]"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowCloseModal(false); setCloseReason(''); }}>
              Cancel
            </Button>
            <button
              type="button"
              disabled={closeReason.trim().length < 20}
              onClick={() => { handleConfirmClose(); setShowCloseModal(false); setCloseReason(''); }}
              className="px-4 py-2 text-sm font-500 text-white rounded-lg bg-[#EF4444] hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Confirm & Close Case
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              Closing this case will be permanently recorded in the audit trail. You must provide a reason.
            </p>
          </div>
          <div>
            <label className="block text-sm font-500 text-text-primary mb-1.5">
              Reason for Closing <span className="text-red-500">*</span>
            </label>
            <textarea
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder="Describe why this case is being closed..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm min-h-[80px]"
              minLength={20}
            />
            <p className={`text-xs mt-1 ${closeReason.length >= 20 ? 'text-green-600' : 'text-text-secondary'}`}>
              {closeReason.length} / 20 minimum characters
            </p>
          </div>
        </div>
      </Modal>

      {/* Reopen Case — Blocking modal */}
      <Modal
        isOpen={showReopenModal}
        title={
          <span className="flex items-center gap-2">
            <RefreshCw size={22} className="text-blue-500 flex-shrink-0" />
            Reopen Case {caseData.id}
          </span>
        }
        onClose={() => {}}
        blocking
        className="max-w-[480px]"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowReopenModal(false); setReopenReason(''); }}>
              Cancel
            </Button>
            <button
              type="button"
              disabled={reopenReason.trim().length < 20}
              onClick={() => { handleConfirmReopen(); setShowReopenModal(false); setReopenReason(''); }}
              className="px-4 py-2 text-sm font-500 text-white rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Confirm & Reopen Case
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              Reopening this case will be permanently recorded in the audit trail. You must provide a reason.
            </p>
          </div>
          <div>
            <label className="block text-sm font-500 text-text-primary mb-1.5">
              Reason for Reopening <span className="text-blue-600">*</span>
            </label>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Describe why this case is being reopened..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-xl text-sm min-h-[80px]"
              minLength={20}
            />
            <p className={`text-xs mt-1 ${reopenReason.length >= 20 ? 'text-green-600' : 'text-text-secondary'}`}>
              {reopenReason.length} / 20 minimum characters
            </p>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
