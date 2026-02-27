import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  Download,
  Eye,
  Zap,
  AlertTriangle,
  AlertOctagon,
  Info,
  X,
  FolderPlus,
  CheckCircle,
} from 'lucide-react';
import { AppShell } from '../components/layout';
import { Button, Badge, Table, Card, Tabs } from '../components/ui';
import { ReportPreview } from '../components/ReportPreview';
import { mockTransactions } from '../data/mock/transactions.js';
import { mockAnalysisLog } from '../data/mock/analysisLog.js';

const WALLET_ADDRESS = '0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f4a5b6c7d';

export default function SearchPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [logEntries, setLogEntries] = useState([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(null);
  const [openCaseStep, setOpenCaseStep] = useState(null); // null | 'confirm' | 'success'
  const [initialCaseNote, setInitialCaseNote] = useState('');

  // Reset open-case state when panel closes
  useEffect(() => {
    if (!showAnalysisPanel) {
      setOpenCaseStep(null);
      setInitialCaseNote('');
    }
  }, [showAnalysisPanel]);

  // Simulate analysis log animation
  useEffect(() => {
    if (!showAnalysisPanel) return;

    mockAnalysisLog.forEach((entry, index) => {
      setTimeout(() => {
        setLogEntries((prev) => [...prev, entry]);
      }, entry.delay);
    });

    const totalDelay = mockAnalysisLog.reduce((max, entry) => Math.max(max, entry.delay), 0);
    setTimeout(() => {
      setAnalysisComplete(true);
    }, totalDelay + 500);
  }, [showAnalysisPanel]);

  // Timer for analysis panel
  useEffect(() => {
    if (!showAnalysisPanel) {
      setTimer(0);
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [showAnalysisPanel]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter transactions by tab
  const getFilteredTransactions = () => {
    if (activeTab === 0) return mockTransactions;
    if (activeTab === 1) return mockTransactions.filter((t) => t.type === 'Receive');
    if (activeTab === 2) return mockTransactions.filter((t) => t.type === 'Send');
    return [];
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate stats
  const receives = mockTransactions.filter((t) => t.type === 'Receive');
  const sends = mockTransactions.filter((t) => t.type === 'Send');
  const inflow = receives.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const outflow = sends.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const truncateAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const truncateHash = (hash) => `${hash.slice(0, 10)}...${hash.slice(-8)}`;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'info':
        return <Info size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'critical':
        return <AlertOctagon size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  const getLogCircleColor = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-600';
      case 'warning':
        return 'bg-amber-100 text-amber-600';
      case 'critical':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-24">
        {/* Back and Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-sm text-text-secondary mb-1">Wallet Investigation</p>
            <div className="flex items-center gap-3">
              <code className="text-lg font-600 text-text-primary tracking-tight">
                {WALLET_ADDRESS}
              </code>
              <button
                onClick={handleCopyAddress}
                className="text-text-secondary hover:text-text-primary transition-colors p-1"
                title="Copy address"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Chain and Details */}
        <div className="flex items-center gap-4">
          <Badge variant="status-open">Ethereum</Badge>
          <span className="text-sm text-text-secondary">First seen: Jan 3, 2024</span>
          <span className="text-sm text-text-secondary">Last active: Feb 18, 2026</span>
          <span className="text-sm text-text-secondary">Entity: Unknown</span>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total Inflow</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{inflow.toFixed(2)} ETH</p>
            <div className="mt-auto pt-2 h-1 w-12 rounded-full bg-green-100" />
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total Outflow</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{outflow.toFixed(2)} ETH</p>
            <div className="mt-auto pt-2 h-1 w-12 rounded-full bg-red-100" />
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Net Balance</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{(inflow - outflow).toFixed(2)} ETH</p>
            <div className="mt-auto pt-2 h-1 w-12 rounded-full bg-gray-200" />
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Transactions</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{mockTransactions.length}</p>
            <div className="mt-auto pt-2 h-1 w-12 rounded-full bg-gray-200" />
          </div>
        </div>

        {/* Compliance Alert */}
        <Card
          padding="md"
          className="border-l-4 border-l-amber-500 bg-amber-50"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-500 text-text-primary mb-1">
                  4 compliance flags detected across 50 transactions
                </p>
                <p className="text-sm text-text-secondary">
                  Review highlighted rows below
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowAnalysisPanel(true);
                setLogEntries([]);
                setAnalysisComplete(false);
              }}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <Zap size={16} />
              Run Detailed Analysis
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs
          defaultTab={0}
          onChange={setActiveTab}
          tabs={[
            { label: 'All Transactions', content: null },
            { label: 'Inflows', content: null },
            { label: 'Outflows', content: null },
            { label: 'Customer Information', content: null },
          ]}
        />

        {/* Tab Content */}
        {activeTab < 3 && (
          <Table
            columns={[
              {
                key: 'type',
                label: 'Type',
                render: (v) => (
                  <div className="flex items-center gap-2">
                    {v === 'Receive' ? (
                      <ArrowDownRight size={16} className="text-green-600" />
                    ) : (
                      <ArrowUpRight size={16} className="text-red-600" />
                    )}
                    <span className="text-sm">{v}</span>
                  </div>
                ),
              },
              {
                key: 'hash',
                label: 'Hash',
                render: (v) => (
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-text-secondary font-mono">
                      {truncateHash(v)}
                    </code>
                    <a
                      href={`https://etherscan.io/tx/${v}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ),
              },
              {
                key: 'dateTime',
                label: 'Date & Time',
                render: (v) => <span className="text-sm">{formatDate(v)}</span>,
              },
              {
                key: 'from',
                label: 'From',
                render: (v) => (
                  <code className="text-xs text-text-secondary font-mono">
                    {truncateAddress(v)}
                  </code>
                ),
              },
              {
                key: 'to',
                label: 'To',
                render: (v) => (
                  <code className="text-xs text-text-secondary font-mono">
                    {truncateAddress(v)}
                  </code>
                ),
              },
              {
                key: 'amount',
                label: 'Amount',
                render: (v, row) => (
                  <span
                    className={
                      row.type === 'Receive'
                        ? 'text-green-600 font-500'
                        : 'text-red-600 font-500'
                    }
                  >
                    {row.type === 'Receive' ? '+' : '-'}
                    {v} ETH
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (v) => (
                  <Badge variant={v === 'Confirmed' ? 'status-open' : 'default'}>
                    {v}
                  </Badge>
                ),
              },
              {
                key: 'compliance',
                label: 'Compliance',
                render: (v) => (
                  <Badge variant={v === 'clear' ? 'compliance-clear' : 'compliance-flagged'}>
                    {v === 'clear' ? 'Clear' : 'Flagged'}
                  </Badge>
                ),
              },
            ]}
            data={filteredTransactions}
            flaggedRowIds={mockTransactions
              .filter((t) => t.compliance === 'flagged')
              .map((t) => t.id)}
          />
        )}

        {/* Customer Information Tab */}
        {activeTab === 3 && (
          <Card padding="lg">
            <h3 className="text-lg font-600 text-text-primary mb-6">Entity Profile</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-1">
                  Entity Name
                </p>
                <p className="text-sm text-text-primary">Unknown</p>
              </div>
              <div>
                <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-1">
                  Entity Type
                </p>
                <p className="text-sm text-text-primary">Individual (Unverified)</p>
              </div>
              <div>
                <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-1">
                  Jurisdiction
                </p>
                <p className="text-sm text-text-primary">Unknown</p>
              </div>
              <div>
                <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-1">
                  First Seen
                </p>
                <p className="text-sm text-text-primary">January 3, 2024</p>
              </div>
              <div>
                <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-1">
                  Last Active
                </p>
                <p className="text-sm text-text-primary">February 18, 2026</p>
              </div>
              <div>
                <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-1">
                  Total Volume
                </p>
                <p className="text-sm text-text-primary">$847,234 USD equivalent</p>
              </div>
              <div>
                <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-1">
                  Associated VASPs
                </p>
                <p className="text-sm text-text-primary">None identified</p>
              </div>
              <div>
                <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-1">
                  KYT Status
                </p>
                <p className="text-sm text-text-primary">Under Review</p>
              </div>
            </div>
            <div className="border-t border-border mt-6 pt-6">
              <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-2">
                Notes
              </p>
              <p className="text-sm text-text-secondary">
                No verified identity. High transaction frequency flagged for review.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-16 right-0 bg-surface border-t border-border px-8 py-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowReportPreview('basic')}
          className="flex items-center gap-2"
        >
          <Eye size={16} />
          Preview Basic Report
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setShowAnalysisPanel(true);
            setLogEntries([]);
            setAnalysisComplete(false);
          }}
          className="flex items-center gap-2"
        >
          <Zap size={16} />
          Run Detailed Analysis
        </Button>
      </div>

      {/* Analysis Panel */}
      {showAnalysisPanel && (
        <div className="fixed top-0 right-0 bottom-0 w-96 bg-surface border-l border-border shadow-xl z-50 overflow-y-auto">
          {/* Panel Header */}
          <div className="sticky top-0 bg-surface border-b border-border p-6 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-600 text-text-primary">Trace Agent</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <p className="text-xs text-text-secondary">Analyzing {truncateAddress(WALLET_ADDRESS)}</p>
            </div>
            <button
              onClick={() => setShowAnalysisPanel(false)}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Timer */}
          <div className="px-6 py-2 border-b border-border text-xs text-text-secondary text-center">
            {Math.floor(timer / 60)}m {timer % 60}s elapsed
          </div>

          {/* Log Entries */}
          <div className="p-6 space-y-4">
            {logEntries.map((entry, idx) => (
              <div
                key={entry.id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <div className="flex gap-3">
                  <div className={`${getLogCircleColor(entry.type)} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {getLogIcon(entry.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary mb-1">
                      {((idx + 1) * 0.5).toFixed(1)}s
                    </p>
                    <p className="text-sm text-text-primary">{entry.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Preliminary Findings */}
          {logEntries.length > 0 && !analysisComplete && (
            <div className="border-t border-border p-6">
              <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-3">
                Preliminary Findings
              </p>
              <div className="grid grid-cols-2 gap-3">
                {logEntries.length > 4 && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-text-secondary mb-1">Sanctions Match</p>
                    <p className="text-sm font-600 text-red-600">Detected</p>
                  </div>
                )}
                {logEntries.length > 5 && (
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-xs text-text-secondary mb-1">Typology</p>
                    <p className="text-sm font-600 text-amber-600">Sanctions Evasion</p>
                  </div>
                )}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-text-secondary mb-1">Hops Traced</p>
                  <p className="text-sm font-600 text-blue-600">
                    {Math.min(logEntries.length, 7)}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-text-secondary mb-1">Chains Crossed</p>
                  <p className="text-sm font-600 text-purple-600">
                    {Math.min(Math.ceil(logEntries.length / 2), 3)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Completion State — or Open Case confirmation / success */}
          {analysisComplete && openCaseStep === null && (
            <div className="border-t border-border p-6 space-y-4">
              <div>
                <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-3">
                  Analysis Complete
                </p>
                <Card padding="md">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Risk Score</p>
                      <p className="text-3xl font-700 text-red-600">94</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary mb-2">Confidence</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: '91%' }}
                        />
                      </div>
                      <p className="text-xs text-text-secondary mt-1">91%</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Primary Typology</p>
                      <Badge variant="risk-critical">Sanctions Evasion</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-text-secondary">Hops Traced</p>
                        <p className="font-600 text-text-primary">7</p>
                      </div>
                      <div>
                        <p className="text-text-secondary">Chains</p>
                        <p className="font-600 text-text-primary">3</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-3">
                  Top Findings
                </p>
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text-primary">
                      Direct 2-hop connection to OFAC-sanctioned address
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text-primary">
                      Cross-chain obfuscation via Hop Protocol bridge
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text-primary">
                      Transaction frequency 200/hr — inconsistent with retail profile
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setOpenCaseStep('confirm')}
                  className="flex items-center justify-center gap-2"
                >
                  <FolderPlus size={16} />
                  Open Case
                </Button>
                <Button 
                  variant="ghost" 
                  fullWidth
                  onClick={() => setShowReportPreview('analysis')}
                >
                  Download Analysis Report
                </Button>
              </div>
            </div>
          )}

          {/* Open Case — Confirmation panel (Step 1) */}
          {analysisComplete && openCaseStep === 'confirm' && (
            <div className="border-t border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FolderPlus size={20} className="text-text-primary" />
                <h3 className="text-base font-600 text-text-primary">Opening Case</h3>
              </div>
              <Card padding="md" className="space-y-4">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Case ID</p>
                  <p className="text-sm font-600 text-text-primary">CASE-2026-0011</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Wallet</p>
                  <p className="font-mono text-xs text-text-primary">{truncateAddress(WALLET_ADDRESS)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Risk Level</p>
                  <Badge variant="risk-critical">CRITICAL</Badge>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Typology</p>
                  <p className="text-sm text-text-primary">Sanctions Evasion & Layering</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Assigned To</p>
                  <p className="text-sm text-text-primary">James Analyst</p>
                </div>
                <div>
                  <label className="block text-xs font-500 text-text-primary mb-1.5">
                    Initial Note <span className="text-risk-critical">*</span>
                  </label>
                  <textarea
                    value={initialCaseNote}
                    onChange={(e) => setInitialCaseNote(e.target.value)}
                    placeholder="Add your initial assessment before opening this case..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20 resize-none"
                  />
                  <p className="text-xs text-text-secondary mt-1">This will be recorded as the first case note</p>
                </div>
              </Card>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  fullWidth
                  disabled={!initialCaseNote.trim()}
                  onClick={() => setOpenCaseStep('success')}
                  className="flex items-center justify-center gap-2"
                >
                  Confirm & Open Case
                </Button>
                <Button variant="ghost" fullWidth onClick={() => setOpenCaseStep(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Open Case — Success state (Step 2) */}
          {analysisComplete && openCaseStep === 'success' && (
            <div className="border-t border-border p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center animate-in fade-in duration-300">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-600 text-text-primary">Case Opened Successfully</h3>
                <p className="text-sm font-600 text-text-primary mt-2">CASE-2026-0011</p>
                <p className="text-xs text-text-secondary mt-1">Risk Level: Critical</p>
              </div>
              <div className="w-full space-y-2 pt-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    navigate('/cases/CASE-2026-0011', { state: { initialCaseNote } });
                    setShowAnalysisPanel(false);
                    setOpenCaseStep(null);
                  }}
                  className="flex items-center justify-center gap-2"
                >
                  View Case File
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    setShowAnalysisPanel(false);
                    setOpenCaseStep(null);
                  }}
                >
                  Continue Investigation
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Preview Modal */}
      {showReportPreview && (
        <ReportPreview 
          initialType={showReportPreview}
          availableTypes={showReportPreview}
          caseId="CASE-2026-0011"
          walletAddress={WALLET_ADDRESS}
          onClose={() => setShowReportPreview(null)}
        />
      )}
    </AppShell>
  );
}
