import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Filter, RotateCcw, X, Printer } from 'lucide-react';
import { Table } from '@/components/core/Table';
import { MetricCard } from '@/components/core/MetricCard';
import { CaseHeader, Btn, GhostIcon } from '@/components/core/CaseHeader';
import { StatCard } from '@/components/ui';
import { CustomSelect } from '@/components/core/CustomSelect';
import { FormField } from '@/components/core/FormField';
import Sidebar from '@/components/layout/Sidebar';
import { mockReports } from '@/services/reportsService';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/images/ta_full_logo.svg';
import { cn } from '@/lib/utils';

type Report = (typeof mockReports)[number];

// ── Static report content ──────────────────────────────────────────────────────
const REPORT_HOPS = [
  { n: 1, from: '0x8f3a...2b1c', to: '0x7a3d...6c7d',          amount: '+142.88 ETH',  action: 'Received from mixer-associated cluster',             chain: 'Ethereum',             warn: true  },
  { n: 2, from: '0x7a3d...6c7d', to: 'Hop Protocol Bridge',    amount: '142.88 ETH',   action: 'Cross-chain bridge initiated',                       chain: 'Ethereum → Arbitrum', warn: true  },
  { n: 3, from: 'Hop Protocol',  to: '0x9c4e...7f2a',          amount: '142.75 ETH',   action: 'Funds arrived on Arbitrum',                          chain: 'Arbitrum',             warn: false },
  { n: 4, from: '0x9c4e...7f2a', to: 'DEX Aggregator',         amount: '142.75 ETH',   action: 'Swapped to USDC via 1inch',                          chain: 'Arbitrum',             warn: false },
  { n: 5, from: 'DEX',           to: '12 fragmentation wallets', amount: '~11.9 ETH each', action: 'Systematic fragmentation — structuring pattern', chain: 'Arbitrum',             warn: true  },
  { n: 6, from: 'Fragmentation wallets', to: '0xb4e2...c021',  amount: '138.20 ETH',   action: 'Consolidation — 92% recovery rate',                  chain: 'Arbitrum',             warn: false },
  { n: 7, from: '0xb4e2...c021', to: 'VASP (non-coop)',        amount: '138.20 ETH',   action: 'Final destination — hosted VASP',                    chain: 'Arbitrum',             warn: true  },
];
const HOP_DOT_COLOR: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#F59E0B', neutral: '#2D3142' };
const HOP_RISK      = ['high','high','medium','medium','high','neutral','critical'];

const RISK_FLAGS = [
  { sev: 'CRITICAL', color: '#EF4444', title: 'SANCTIONS EXPOSURE',    body: 'Direct 2-hop connection to OFAC-sanctioned address 0x4f2a...9e1b. Source: OFAC SDN List March 2024. Constitutes reportable sanctions exposure under 31 CFR Part 501.', evidence: '0xf0e1d2c3...8f7a6b5c' },
  { sev: 'HIGH',     color: '#F97316', title: 'TECHNICAL OBFUSCATION', body: 'Non-custodial mixer combined with cross-chain bridge usage across 3 networks within 47 minutes. Consistent with professional money laundering tradecraft.', evidence: 'Hops 1–3 above' },
  { sev: 'HIGH',     color: '#F97316', title: 'BEHAVIORAL ANOMALY',    body: 'Transaction frequency 200/hr inconsistent with declared retail trader profile. Automated execution strongly suggested. Matches FinCEN FIN-2023-A001.', evidence: 'Transaction cluster Jan 13, 2024' },
];

const CHAIN_OF_CUSTODY = [
  { timestamp: 'Feb 27, 2026 13:58', action: 'Wallet Searched',       by: 'James Analyst', details: 'Initial search via TraceAgent platform' },
  { timestamp: 'Feb 27, 2026 14:02', action: 'Detailed Analysis Run', by: 'James Analyst', details: 'AI trace initiated — 8 hops analyzed' },
  { timestamp: 'Feb 27, 2026 14:05', action: 'Case Opened',           by: 'James Analyst', details: 'Case CASE-2026-0011 created, risk: Critical' },
  { timestamp: 'Feb 27, 2026 15:15', action: 'Report Generated',      by: 'James Analyst', details: 'Full investigative report produced' },
  { timestamp: 'Feb 27, 2026 16:42', action: 'Approved for SAR',      by: 'Sarah Chen',    details: 'Lead compliance review complete' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const TYPE_OPTS = [
  { value: 'All',       label: 'All Types' },
  { value: 'basic',     label: 'Basic'     },
  { value: 'analysis',  label: 'Analysis'  },
  { value: 'full-case', label: 'Full Case' },
];
const RISK_OPTS = [
  { value: 'All',      label: 'All Risk' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High',     label: 'High'     },
  { value: 'Medium',   label: 'Medium'   },
  { value: 'Low',      label: 'Low'      },
];
const TYPE_LABEL: Record<string, string> = { 'basic': 'Basic Report', 'analysis': 'Analysis Report', 'full-case': 'Full Case Report' };
const TYPE_DOC: Record<string, string>   = { 'basic': 'basic', 'analysis': 'analysis', 'full-case': 'full' };

const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

// ── Metric card data per report type ──────────────────────────────────────────
const BASIC_DOTS  = { total: 7, current: 5, colors: ['#22C55E','#F59E0B','#F59E0B','#EF4444','#EF4444'] };
const FULL_DOTS   = { total: 9, current: 7, colors: ['#F97316','#F97316','#2D3142','#F97316','#F97316','#2D3142','#EF4444'] };
const BASIC_CHAINS = [{ label: 'ETH', bg: '#454A75' }, { label: 'MATIC', bg: '#7B3FE4' }];
const FULL_CHAINS  = [{ label: 'ETH', bg: '#454A75' }, { label: 'ARB', bg: '#2B6CB0' }, { label: 'POL', bg: '#7B3FE4' }];

interface ReportDocumentProps { report: Report; reportType: string; }
function ReportDocument({ report, reportType }: ReportDocumentProps) {
  const riskLabel = ({ basic: 'Basic', analysis: 'Analysis', full: 'Full' } as Record<string, string>)[reportType];
  const isBasic = reportType === 'basic';

  return (
    <div className="flex flex-col">
      {/* Document */}
      <div className="max-w-[800px] mx-auto w-full bg-white border border-[#ECEEF2] rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="px-[40px] py-[32px] font-sans">

          {/* Cover block */}
          <div className="bg-[#F9FAFB] rounded-[8px] p-[24px] mb-[24px]">
            <div className="flex justify-between items-start">
              <img src={logo} alt="TraceAgent" className="h-[32px]" />
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6578]">{riskLabel} Investigative Report</div>
                <div className="text-[11px] text-[#5C6578] mt-[3px]">Generated: {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div className="text-[11px] text-[#5C6578]">Generated by: {report.generatedBy}</div>
              </div>
            </div>
            <div className="pt-[16px] mt-[16px] border-t border-[#E5E7EB]">
              <div className="text-[20px] font-bold text-[#111827] mb-[4px]">Case ID: {report.caseId || '—'}</div>
              <div className="font-mono text-[12px] text-[#374151] mb-[10px]">Subject: {report.walletAddress}</div>
              <div className="flex flex-wrap items-center gap-[10px]">
                <span className="text-[12px] text-[#374151]">Chain: Ethereum</span>
                <span className="text-[11px] font-bold bg-[#FEE2E2] text-[#B91C1C] px-[10px] py-[2px] rounded-full">{report.riskLevel.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Analysis metrics */}
          <div className="border-t border-[#E5E7EB] pt-[20px] mb-[28px]">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-[14px]">
              Analysis Complete
            </div>
            {isBasic ? (
              <div className="grid grid-cols-2 gap-[12px]">
                <MetricCard label="Risk Score"    value={91} max={100} type="gradient-bar" compact />
                <MetricCard label="AI Confidence" value={88} max={100} type="vertical-bar"  displayValue="88%" compact />
                <MetricCard label="Hops Traced"   value={5}  max={100} type="dots"          compact visual={BASIC_DOTS} />
                <MetricCard label="Chains"        value={2}  max={100} type="badges"        compact visual={{ badges: BASIC_CHAINS }} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-[12px] mb-[12px]">
                  <MetricCard label="Risk Score"    value={94} max={100} type="gradient-bar" />
                  <MetricCard label="AI Confidence" value={91} max={100} type="gauge"        displayValue="91%" />
                  <MetricCard label="Risk Exposure" value={94} max={100} type="vertical-bar" displayValue="94%" />
                </div>
                <div className="grid grid-cols-2 gap-[12px]">
                  <MetricCard label="Hops Traced"   value={7}  max={100} type="dots"   visual={FULL_DOTS} />
                  <MetricCard label="Chains"        value={3}  max={100} type="badges" visual={{ badges: FULL_CHAINS }} />
                </div>
              </>
            )}
          </div>

          {/* AI Summary (analysis + full) */}
          {['analysis', 'full'].includes(reportType) && (
            <div className="border border-[#FDE68A] border-l-[3px] border-l-[#F59E0B] rounded-[8px] px-[16px] py-[14px] bg-[#FFFBEB] mb-[24px]">
              <div className="flex items-center gap-[5px] mb-[8px]">
                <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-[0.07em]">⚡ AI Summary</span>
              </div>
              <p className="text-[13px] text-[#374151] leading-[1.75] m-0">
                The wallet at{' '}
                <span className="font-mono text-[12px] bg-[#F3F4F6] px-[5px] py-px rounded-[3px]">{report.walletAddress ? `${report.walletAddress.slice(0,6)}…${report.walletAddress.slice(-4)}` : '0x7a3d…6c7d'}</span>
                {' '}exhibits a sophisticated layering pattern consistent with sanctions evasion. Funds originating from mixer-associated clusters were bridged cross-chain via Hop Protocol and systematically fragmented across 12 sub-wallets before consolidation and transfer to a non-cooperative VASP. A direct 2-hop connection to OFAC-sanctioned address{' '}
                <span className="font-mono text-[12px] bg-[#F3F4F6] px-[5px] py-px rounded-[3px]">0x4f2a…9e1b</span>
                {' '}has been confirmed. Immediate escalation and SAR filing are recommended.
              </p>
            </div>
          )}

          {/* Immediate action alert (basic only) */}
          {isBasic && (
            <div className="border border-[#FECACA] border-l-[3px] border-l-[#EF4444] rounded-[8px] px-[16px] py-[14px] bg-[#FFF5F5] mb-[24px]">
              <p className="text-[13px] text-[#7F1D1D] leading-[1.75] m-0">
                <strong>Immediate action recommended.</strong> Risk score {report.riskScore ?? 91} with confirmed mixer usage and structuring pattern — this wallet meets the threshold for formal case investigation.
              </p>
            </div>
          )}

          {/* 01 — Executive Summary */}
          <div className="border-t border-[#E5E7EB] pt-[24px] mb-[28px]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C6578] mb-[12px]">01 — Executive Summary</div>
            <p className="text-[13px] leading-[1.75] text-[#374151] m-0">
              Wallet {report.walletAddress} was identified as high-risk following autonomous multi-chain tracing. The subject wallet received 284.50 ETH from a mixer-associated cluster and executed systematic cross-chain layering via Hop Protocol bridge. TraceAgent confirmed a 2-hop connection to OFAC-sanctioned address 0x4f2a…9e1b. Transaction frequency of 200/hr is inconsistent with declared retail trader profile.
            </p>
          </div>

          {/* 02 — Fund Flow Trace */}
          <div className="border-t border-[#E5E7EB] pt-[24px] mb-[28px]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C6578] mb-[6px]">02 — Fund Flow Trace</div>
            <div className="text-[12px] text-[#5C6578] mb-[16px]">{REPORT_HOPS.length} hops traced across 3 chains — Ethereum, Arbitrum, Polygon</div>
            <div className="flex flex-col gap-[14px]">
              {REPORT_HOPS.map((hop) => (
                <div key={hop.n} className="flex gap-[12px] items-start">
                  <div className="w-[24px] h-[24px] rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0" style={{ background: HOP_DOT_COLOR[HOP_RISK[hop.n - 1]] }}>
                    {String(hop.n).padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-[11px] text-[#374151]">{hop.from} → {hop.to} | {hop.amount}</div>
                    <div className="text-[13px] text-[#374151] mt-[2px]">{hop.action}</div>
                    <div className="flex items-center gap-[8px] mt-[4px]">
                      <span className="text-[11px] bg-[#F3F4F6] text-[#374151] px-[8px] py-px rounded-[4px] font-medium">{hop.chain}</span>
                      {hop.n === 7 && <span className="text-[11px] text-[#EF4444] font-semibold">● Final destination</span>}
                      {hop.n !== 7 && hop.warn && <span className="text-[11px] text-[#F59E0B] font-semibold">⚠ Flagged</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 03 — Risk Flags */}
          <div className="border-t border-[#E5E7EB] pt-[24px] mb-[28px]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C6578] mb-[16px]">03 — Risk Flags & Indicators</div>
            <div className="flex flex-col gap-[20px]">
              {RISK_FLAGS.map((f, i) => (
                <div key={i} className="pl-[16px]" style={{ borderLeft: `4px solid ${f.color}` }}>
                  <div className="flex items-center gap-[8px] mb-[6px]">
                    <span className="text-[11px] font-bold px-[8px] py-[2px] rounded-[4px]" style={{ background: f.color + '20', color: f.color }}>{f.sev}</span>
                    <span className="text-[13px] font-semibold text-[#111827]">{f.title}</span>
                  </div>
                  <p className="text-[13px] text-[#374151] leading-[1.65] m-0 mb-[6px]">{f.body}</p>
                  <p className="text-[11px] text-[#5C6578] font-mono m-0">Evidence: {f.evidence}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 04 — Risk Assessment (analysis + full) */}
          {['analysis', 'full'].includes(reportType) && (
            <div className="border-t border-[#E5E7EB] pt-[24px] mb-[28px]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C6578] mb-[16px]">04 — Risk Assessment</div>
              <div className="flex flex-col gap-[16px]">
                {[
                  ['Compliance Rationale',    'Deliberate fund fragmentation across 12 wallets combined with cross-chain bridging in compressed timeframe indicates calculated attempt to defeat automated monitoring systems.'],
                  ['Threat Actor Assessment', 'Technical sophistication, mixer-adjacent infrastructure, and non-cooperative VASP destination suggest professionally managed operation or state-sponsored actor bypassing economic sanctions.'],
                  ['Regulatory Impact',       'Failure to freeze and report constitutes violation of FinCEN 2024 Stablecoin Guidance and OFAC regulations. Immediate SAR filing recommended.'],
                ].map(([label, text]) => (
                  <div key={label}>
                    <div className="text-[13px] font-semibold text-[#111827] mb-[4px]">{label}:</div>
                    <p className="text-[13px] text-[#374151] leading-[1.65] m-0">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 05 — Chain of Custody (full only) */}
          {reportType === 'full' && (
            <div className="border-t border-[#E5E7EB] pt-[24px] mb-[28px]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C6578] mb-[16px]">05 — Chain of Custody</div>
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    {['Timestamp', 'Action', 'Performed By', 'Details'].map((h) => (
                      <th key={h} className="text-left pb-[8px] pr-[12px] text-[11px] font-semibold text-[#5C6578]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CHAIN_OF_CUSTODY.map((row, i) => (
                    <tr key={i} className={cn('border-b border-[#F3F4F6]', i % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-transparent')}>
                      <td className="py-[8px] pr-[12px] text-[#5C6578] font-mono whitespace-nowrap">{row.timestamp}</td>
                      <td className="py-[8px] pr-[12px] text-[#111827] font-medium">{row.action}</td>
                      <td className="py-[8px] pr-[12px] text-[#374151]">{row.by}</td>
                      <td className="py-[8px] text-[#5C6578]">{row.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-[#E5E7EB] pt-[20px] text-center text-[11px] text-[#5C6578]">
            Generated by TraceAgent — Trace Layer Inc. | CONFIDENTIAL — Regulatory Use Only | {report.caseId || report.id}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Full-screen report overlay ─────────────────────────────────────────────────
interface ReportOverlayProps {
  report: Report;
  onClose: () => void;
  hideTypeSwitch?: boolean;
  onOpenFull?: () => void;
}
export function ReportOverlay({ report, onClose, hideTypeSwitch = false, onOpenFull }: ReportOverlayProps) {
  const [reportType, setReportType] = useState(TYPE_DOC[report.type] || 'basic');

  const TAB_LABELS: Record<string, string> = { basic: 'Basic', analysis: 'Analysis', full: 'Full' };

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col p-[8px] box-border bg-[linear-gradient(160deg,#060C1A_0%,#0C1D3C_55%,#091630_100%)]"
    >
      {/* Nav band */}
      <div className="shrink-0 flex items-center justify-between px-[20px] h-[44px] mb-[8px] box-border">
        <span className="text-[13px] font-medium text-[rgba(255,255,255,0.45)]">
          Report Preview
          <span className="mx-[8px] text-[rgba(255,255,255,0.25)]">·</span>
          <span className="font-mono text-[12px] font-medium text-[rgba(255,255,255,0.75)]">
            {truncateAddress(report.walletAddress)}
          </span>
        </span>
        <div className="flex items-center gap-[8px]">
          {onOpenFull && (
            <button
              onClick={onOpenFull}
              className="flex items-center gap-[6px] bg-[rgba(198,255,0,0.12)] border border-[rgba(198,255,0,0.25)] rounded-[10px] px-[12px] py-[4px] text-[13px] font-medium text-[#C6FF00] cursor-pointer font-[inherit] hover:bg-[rgba(198,255,0,0.2)] transition-colors duration-150"
            >
              Open Full Case →
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-[6px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-[12px] py-[4px] text-[13px] font-medium text-white opacity-75 cursor-pointer font-[inherit] hover:opacity-100 hover:bg-[rgba(255,255,255,0.14)] transition-[opacity,background] duration-150"
          >
            <X size={13} /> Close
          </button>
        </div>
      </div>

      {/* Content panel */}
      <div
        className="flex-1 overflow-hidden flex flex-col bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_2px_8px_rgba(0,0,0,0.03),inset_0_-2px_8px_rgba(0,0,0,0.02)]"
      >
        {/* White action bar */}
        <div className="shrink-0 flex items-center justify-between px-[16px] py-[8px] border-b border-[#E5E7EB] bg-white">
          <div className="flex items-center gap-[6px]">
            {!hideTypeSwitch && (
              <div className="flex border border-[#ECEEF2] rounded-[8px] p-[3px] bg-[#F9FAFB] gap-[2px]">
                {['basic', 'analysis', 'full'].map((t) => (
                  <Btn key={t} variant="segment" size="sm" active={reportType === t} onClick={() => setReportType(t)}>
                    {TAB_LABELS[t]}
                  </Btn>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-[6px]">
            <Btn variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>Print</Btn>
            <Btn variant="dark" size="sm" icon={Download} onClick={() => {}}>Export PDF</Btn>
          </div>
        </div>

        {/* Scrollable document */}
        <div className="flex-1 overflow-y-auto bg-[#EAEBF0] p-[24px]">
          <ReportDocument report={report} reportType={reportType} />
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const navigate = useNavigate();
  const { isLead, isAdmin } = useAuth();

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [typeFilter,  setTypeFilter]  = useState('All');
  const [riskFilter,  setRiskFilter]  = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReport,  setShowReport]  = useState<Report | null>(null);

  const isDirty = typeFilter !== 'All' || riskFilter !== 'All' || searchQuery !== '';
  const resetFilters = () => { setTypeFilter('All'); setRiskFilter('All'); setSearchQuery(''); };

  const filtered = useMemo(() => {
    let f = [...mockReports];
    if (typeFilter !== 'All') f = f.filter((r) => r.type === typeFilter);
    if (riskFilter !== 'All') f = f.filter((r) => r.riskLevel === riskFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      f = f.filter((r) => r.walletAddress.toLowerCase().includes(q) || (r.caseId || '').toLowerCase().includes(q));
    }
    return f;
  }, [typeFilter, riskFilter, searchQuery]);

  const now = new Date();
  const thisMonthCount = mockReports.filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const criticalCount = mockReports.filter((r) => r.riskLevel === 'Critical').length;
  const highCount     = mockReports.filter((r) => r.riskLevel === 'High').length;

  const statCards = [
    { label: 'All Reports', value: mockReports.length, accent: '#003C7E', onFilter: () => resetFilters() },
    { label: 'This Month',  value: thisMonthCount,     accent: '#3B82F6', onFilter: () => resetFilters() },
    { label: 'Critical',    value: criticalCount,      accent: '#EF4444', onFilter: () => { setRiskFilter('Critical'); setTypeFilter('All'); setSearchQuery(''); } },
    { label: 'High Risk',   value: highCount,           accent: '#F97316', onFilter: () => { setRiskFilter('High'); setTypeFilter('All'); setSearchQuery(''); } },
  ];

  const isActiveStat = (card: typeof statCards[number]) => {
    if (card.label === 'Critical')    return riskFilter === 'Critical';
    if (card.label === 'High Risk')   return riskFilter === 'High';
    if (card.label === 'All Reports') return !isDirty;
    return false;
  };

  const columns = [
    { key: 'caseId',        label: 'Case ID', render: (v: unknown): ReactNode => <span className="font-mono text-[13px] font-semibold text-[#2D3142]">{String(v || '—')}</span> },
    { key: 'walletAddress', label: 'Wallet',  render: (v: unknown): ReactNode => (
      <span
        className="font-mono text-[12px] text-[#2563EB] cursor-pointer hover:underline transition-none"
        onClick={(e) => { e.stopPropagation(); navigate(`/search?q=${encodeURIComponent(String(v))}`); }}
      >{truncateAddress(String(v))}</span>
    )},
    { key: 'type',          label: 'Type',    render: (v: unknown): ReactNode => <span className="text-[13px] text-[#374151]">{TYPE_LABEL[String(v)] || String(v)}</span> },
    {
      key: 'riskScore', label: 'Risk Score',
      render: (v: unknown): ReactNode => {
        const s = (v as number) ?? 0;
        const color = s >= 90 ? '#EF4444' : s >= 70 ? '#F97316' : s >= 50 ? '#F59E0B' : '#22C55E';
        return <span className="font-mono text-[14px] font-bold" style={{ color }}>{s}</span>;
      },
    },
    ...(isLead || isAdmin ? [{ key: 'generatedBy', label: 'Generated By', type: 'plain' }] : []),
    { key: 'date', label: 'Date', render: (v: unknown): ReactNode => <span className="font-mono text-[12px] text-[#4A5568]">{new Date(String(v)).toLocaleDateString()}</span> },
    {
      key: 'id', label: '',
      render: (_v: unknown, row: Record<string, unknown>): ReactNode => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <GhostIcon icon={FileText} size="xs" onClick={() => setShowReport(row as unknown as Report)} />
        </div>
      ),
    },
  ];

  return (
    <>
      <div
        className="flex h-screen overflow-hidden p-[8px] gap-[8px] box-border bg-[linear-gradient(160deg,#060C1A_0%,#0C1D3C_55%,#091630_100%)]"
      >
        <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

        <div className="flex-1 overflow-hidden">
          <main
            className="h-full overflow-hidden bg-white rounded-[12px] flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_2px_8px_rgba(0,0,0,0.03),inset_0_-2px_8px_rgba(0,0,0,0.02)]"
          >
            <div className="shrink-0">
              <CaseHeader title="Reports" showStatusRow={false} />
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
              <div
                className="flex-1 px-[32px] py-[24px] flex flex-col gap-[16px] bg-[linear-gradient(180deg,#F5F6FA_0%,#EAEBF0_60%,#E3E4EA_100%)]"
              >

                <h2 className="text-[14px] font-medium tracking-[-0.2px] leading-[1.2] text-[#717A8C] m-0">My Downloads</h2>

                {/* Stat cards */}
                <div className="grid grid-cols-4 gap-[8px]">
                  {statCards.map((card) => (
                    <StatCard key={card.label} label={card.label} value={card.value} accent={card.accent} compact onClick={card.onFilter} active={isActiveStat(card)} />
                  ))}
                </div>

                {/* Filter panel */}
                <div className="bg-white rounded-[12px] border border-[#ECEEF2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-[16px] py-[12px]">
                  <div className="flex items-center gap-[16px]">
                    <Filter size={16} className="text-[#B0B8C8] shrink-0" />
                    <FormField label="Type" labelLayout="left">
                      <CustomSelect value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTS} />
                    </FormField>
                    <FormField label="Risk" labelLayout="left">
                      <CustomSelect value={riskFilter} onChange={setRiskFilter} options={RISK_OPTS} />
                    </FormField>
                    <FormField label="Search" labelLayout="left" className="flex-1">
                      <input
                        type="text"
                        placeholder="Search by wallet or Case ID"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                          'w-full h-[38px] bg-white border border-[#D1D5DB] rounded-[10px] px-[14px] py-[9px]',
                          'text-[14px] text-[#111827] font-mono',
                          'shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none box-border',
                          'transition-[border-color,box-shadow] duration-150',
                          'hover:border-[#B0BCC8]',
                          'focus:border-[#4B7AC7] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.10),0_1px_4px_rgba(0,0,0,0.05)]',
                        )}
                      />
                    </FormField>
                    <div className="w-px self-stretch bg-[#E5E7EB] shrink-0" />
                    <button
                      type="button"
                      title="Reset filters"
                      onClick={resetFilters}
                      className={cn(
                        'flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border-none bg-transparent cursor-pointer shrink-0',
                        'transition-[background,color,opacity] duration-150',
                        isDirty
                          ? 'text-[#2563EB] opacity-100 hover:bg-[rgba(37,99,235,0.10)] hover:text-[#1D4ED8]'
                          : 'text-[#7B90AA] opacity-40 hover:bg-[rgba(123,144,170,0.10)] hover:text-[#4A5568] hover:opacity-100',
                      )}
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[12px] border border-[#ECEEF2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
                  <Table density="relaxed" columns={columns} data={filtered as unknown as Record<string, unknown>[]} onRowClick={(row) => row.caseId && navigate(`/cases/${row.caseId}`)} />
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Full-screen report preview */}
      {showReport && <ReportOverlay report={showReport} onClose={() => setShowReport(null)} />}
    </>
  );
}
