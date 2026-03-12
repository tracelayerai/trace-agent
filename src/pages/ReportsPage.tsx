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
import { SURFACE, INPUT, TABLE, COLORS, RADIUS, TYPOGRAPHY } from '@/tokens/designTokens';
import { mockReports } from '@/data/mock/reports';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/images/ta_full_logo.svg';

type Report = (typeof mockReports)[number];

// ── Static report content (mirrors CaseFile Report tab) ──────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
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
// map report.type → reportType token used in the doc
const TYPE_DOC: Record<string, string>   = { 'basic': 'basic', 'analysis': 'analysis', 'full-case': 'full' };

const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

// ── Metric card data per report type ─────────────────────────────────────────
const BASIC_DOTS  = { total: 7, current: 5, colors: ['#22C55E','#F59E0B','#F59E0B','#EF4444','#EF4444'] };
const FULL_DOTS   = { total: 9, current: 7, colors: ['#F97316','#F97316','#2D3142','#F97316','#F97316','#2D3142','#EF4444'] };
const BASIC_CHAINS = [{ label: 'ETH', bg: '#454A75' }, { label: 'MATIC', bg: '#7B3FE4' }];
const FULL_CHAINS  = [{ label: 'ETH', bg: '#454A75' }, { label: 'ARB', bg: '#2B6CB0' }, { label: 'POL', bg: '#7B3FE4' }];

interface ReportDocumentProps { report: Report; reportType: string; }
function ReportDocument({ report, reportType }: ReportDocumentProps) {
  const riskLabel = ({ basic: 'Basic', analysis: 'Analysis', full: 'Full' } as Record<string, string>)[reportType];
  const isBasic = reportType === 'basic';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Document */}
      <div style={{ maxWidth: 800, margin: '0 auto', width: '100%', background: '#FFFFFF', border: SURFACE.panel.border, borderRadius: SURFACE.panel.borderRadius, boxShadow: SURFACE.panel.shadow, overflow: 'hidden' }}>
        <div style={{ padding: '32px 40px', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

          {/* Cover block */}
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <img src={logo} alt="TraceAgent" style={{ height: 32 }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.text.light }}>{riskLabel} Investigative Report</div>
                <div style={{ fontSize: 11, color: COLORS.text.light, marginTop: 3 }}>Generated: {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div style={{ fontSize: 11, color: COLORS.text.light }}>Generated by: {report.generatedBy}</div>
              </div>
            </div>
            <div style={{ paddingTop: 16, marginTop: 16, borderTop: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text.dark, marginBottom: 4 }}>Case ID: {report.caseId || '—'}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.text.body, marginBottom: 10 }}>Subject: {report.walletAddress}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: COLORS.text.body }}>Chain: Ethereum</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#FEE2E2', color: '#B91C1C', padding: '2px 10px', borderRadius: 20 }}>{report.riskLevel.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Analysis metrics */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 20, marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: 14 }}>
              Analysis Complete
            </div>
            {isBasic ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <MetricCard label="Risk Score"    value={91} max={100} type="gradient-bar" compact />
                <MetricCard label="AI Confidence" value={88} max={100} type="vertical-bar"  displayValue="88%" compact />
                <MetricCard label="Hops Traced"   value={5}  max={100} type="dots"          compact visual={BASIC_DOTS} />
                <MetricCard label="Chains"        value={2}  max={100} type="badges"        compact visual={{ badges: BASIC_CHAINS }} />
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                  <MetricCard label="Risk Score"    value={94} max={100} type="gradient-bar" />
                  <MetricCard label="AI Confidence" value={91} max={100} type="gauge"        displayValue="91%" />
                  <MetricCard label="Risk Exposure" value={94} max={100} type="vertical-bar" displayValue="94%" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <MetricCard label="Hops Traced"   value={7}  max={100} type="dots"   visual={FULL_DOTS} />
                  <MetricCard label="Chains"        value={3}  max={100} type="badges" visual={{ badges: FULL_CHAINS }} />
                </div>
              </>
            )}
          </div>

          {/* AI Summary (analysis + full) */}
          {['analysis', 'full'].includes(reportType) && (
            <div style={{ border: '1px solid #FDE68A', borderLeft: '3px solid #F59E0B', borderRadius: 8, padding: '14px 16px', background: '#FFFBEB', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.07em' }}>⚡ AI Summary</span>
              </div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, margin: 0 }}>
                The wallet at{' '}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, background: '#F3F4F6', padding: '1px 5px', borderRadius: 3 }}>{report.walletAddress ? `${report.walletAddress.slice(0,6)}…${report.walletAddress.slice(-4)}` : '0x7a3d…6c7d'}</span>
                {' '}exhibits a sophisticated layering pattern consistent with sanctions evasion. Funds originating from mixer-associated clusters were bridged cross-chain via Hop Protocol and systematically fragmented across 12 sub-wallets before consolidation and transfer to a non-cooperative VASP. A direct 2-hop connection to OFAC-sanctioned address{' '}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, background: '#F3F4F6', padding: '1px 5px', borderRadius: 3 }}>0x4f2a…9e1b</span>
                {' '}has been confirmed. Immediate escalation and SAR filing are recommended.
              </p>
            </div>
          )}

          {/* Immediate action alert (basic only — nudge to open a case) */}
          {isBasic && (
            <div style={{ border: '1px solid #FECACA', borderLeft: '3px solid #EF4444', borderRadius: 8, padding: '14px 16px', background: '#FFF5F5', marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 1.75, margin: 0 }}>
                <strong>Immediate action recommended.</strong> Risk score {report.riskScore ?? 91} with confirmed mixer usage and structuring pattern — this wallet meets the threshold for formal case investigation.
              </p>
            </div>
          )}

          {/* 01 — Executive Summary */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24, marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.text.light, marginBottom: 12 }}>01 — Executive Summary</div>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: '#374151', margin: 0 }}>
              Wallet {report.walletAddress} was identified as high-risk following autonomous multi-chain tracing. The subject wallet received 284.50 ETH from a mixer-associated cluster and executed systematic cross-chain layering via Hop Protocol bridge. TraceAgent confirmed a 2-hop connection to OFAC-sanctioned address 0x4f2a…9e1b. Transaction frequency of 200/hr is inconsistent with declared retail trader profile.
            </p>
          </div>

          {/* 02 — Fund Flow Trace */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24, marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.text.light, marginBottom: 6 }}>02 — Fund Flow Trace</div>
            <div style={{ fontSize: 12, color: COLORS.text.light, marginBottom: 16 }}>{REPORT_HOPS.length} hops traced across 3 chains — Ethereum, Arbitrum, Polygon</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {REPORT_HOPS.map((hop) => (
                <div key={hop.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: HOP_DOT_COLOR[HOP_RISK[hop.n - 1]], color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {String(hop.n).padStart(2, '0')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.text.body }}>{hop.from} → {hop.to} | {hop.amount}</div>
                    <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{hop.action}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, background: '#F3F4F6', color: COLORS.text.body, padding: '1px 8px', borderRadius: 4, fontWeight: 500 }}>{hop.chain}</span>
                      {hop.n === 7 && <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>● Final destination</span>}
                      {hop.n !== 7 && hop.warn && <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>⚠ Flagged</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 03 — Risk Flags */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24, marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.text.light, marginBottom: 16 }}>03 — Risk Flags & Indicators</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {RISK_FLAGS.map((f, i) => (
                <div key={i} style={{ borderLeft: `4px solid ${f.color}`, paddingLeft: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: f.color + '20', color: f.color, padding: '2px 8px', borderRadius: 4 }}>{f.sev}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.dark }}>{f.title}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: '0 0 6px' }}>{f.body}</p>
                  <p style={{ fontSize: 11, color: COLORS.text.light, fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>Evidence: {f.evidence}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 04 — Risk Assessment (analysis + full) */}
          {['analysis', 'full'].includes(reportType) && (
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24, marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.text.light, marginBottom: 16 }}>04 — Risk Assessment</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  ['Compliance Rationale',    'Deliberate fund fragmentation across 12 wallets combined with cross-chain bridging in compressed timeframe indicates calculated attempt to defeat automated monitoring systems.'],
                  ['Threat Actor Assessment', 'Technical sophistication, mixer-adjacent infrastructure, and non-cooperative VASP destination suggest professionally managed operation or state-sponsored actor bypassing economic sanctions.'],
                  ['Regulatory Impact',       'Failure to freeze and report constitutes violation of FinCEN 2024 Stablecoin Guidance and OFAC regulations. Immediate SAR filing recommended.'],
                ].map(([label, text]) => (
                  <div key={label}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.dark, marginBottom: 4 }}>{label}:</div>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 05 — Chain of Custody (full only) */}
          {reportType === 'full' && (
            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24, marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.text.light, marginBottom: 16 }}>05 — Chain of Custody</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    {['Timestamp', 'Action', 'Performed By', 'Details'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '6px 12px 8px 0', fontSize: 11, fontWeight: 600, color: COLORS.text.light }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CHAIN_OF_CUSTODY.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 1 ? '#FAFAFA' : 'transparent' }}>
                      <td style={{ padding: '8px 12px 8px 0', color: COLORS.text.light, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>{row.timestamp}</td>
                      <td style={{ padding: '8px 12px 8px 0', color: COLORS.text.dark, fontWeight: 500 }}>{row.action}</td>
                      <td style={{ padding: '8px 12px 8px 0', color: COLORS.text.body }}>{row.by}</td>
                      <td style={{ padding: '8px 0', color: COLORS.text.light }}>{row.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 20, textAlign: 'center', fontSize: 11, color: COLORS.text.light }}>
            Generated by TraceAgent — Trace Layer Inc. | CONFIDENTIAL — Regulatory Use Only | {report.caseId || report.id}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Full-screen report overlay ────────────────────────────────────────────────
interface ReportOverlayProps {
  report: Report;
  onClose: () => void;
  hideTypeSwitch?: boolean;
  onOpenFull?: () => void;
}
export function ReportOverlay({ report, onClose, hideTypeSwitch = false, onOpenFull }: ReportOverlayProps) {
  const [reportType, setReportType] = useState(TYPE_DOC[report.type] || 'basic');

  const closeBtnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.08)', border: SURFACE.nav.border,
    borderRadius: RADIUS.md, padding: '4px 12px',
    color: COLORS.text.white, opacity: 0.75,
    fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s, background 0.15s',
  };

  const TAB_LABELS: Record<string, string> = { basic: 'Basic', analysis: 'Analysis', full: 'Full' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: SURFACE.frame.bg,
      display: 'flex', flexDirection: 'column',
      padding: SURFACE.frame.padding, boxSizing: 'border-box',
    }}>

      {/* ── Nav band ─────────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `0 ${SURFACE.nav.paddingX}px`, height: SURFACE.nav.height,
        background: 'transparent',
        marginBottom: SURFACE.frame.padding, boxSizing: 'border-box',
      }}>
        <span style={{ fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium, color: 'rgba(255,255,255,0.45)' }}>
          Report Preview
          <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.25)' }}>·</span>
          <span style={{ fontFamily: TYPOGRAPHY.fontMono, fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
            {truncateAddress(report.walletAddress)}
          </span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onOpenFull && (
            <button
              onClick={onOpenFull}
              style={{ ...closeBtnStyle, background: 'rgba(198,255,0,0.12)', borderColor: 'rgba(198,255,0,0.25)', color: '#C6FF00', opacity: 1 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(198,255,0,0.2)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(198,255,0,0.12)'; }}
            >
              Open Full Case →
            </button>
          )}
          <button
            onClick={onClose}
            style={closeBtnStyle}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.75'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
          >
            <X size={13} /> Close
          </button>
        </div>
      </div>

      {/* ── Content panel with white action bar + scrollable doc ────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: SURFACE.content.borderRadius, boxShadow: SURFACE.content.shadow }}>

        {/* White action bar — type tabs + actions */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!hideTypeSwitch && (
              <div style={{ display: 'flex', border: SURFACE.panel.border, borderRadius: 8, padding: 3, background: SURFACE.panel.bg, gap: 2 }}>
                {['basic', 'analysis', 'full'].map((t) => (
                  <Btn key={t} variant="segment" size="sm" active={reportType === t} onClick={() => setReportType(t)}>
                    {TAB_LABELS[t]}
                  </Btn>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>Print</Btn>
            <Btn variant="dark" size="sm" icon={Download} onClick={() => {}}>Export PDF</Btn>
          </div>
        </div>

        {/* Scrollable document */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#EAEBF0', padding: '24px' }}>
          <ReportDocument report={report} reportType={reportType} />
        </div>
      </div>

    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
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
    { key: 'caseId',        label: 'Case ID', render: (v: unknown): ReactNode => <span style={TABLE.cell.monoId as React.CSSProperties}>{String(v || '—')}</span> },
    { key: 'walletAddress', label: 'Wallet',  render: (v: unknown): ReactNode => (
      <span style={{ ...(TABLE.cell.mono as React.CSSProperties), color: COLORS.icon.active, cursor: 'pointer', textDecoration: 'none' } as React.CSSProperties}
        onMouseEnter={(e) => (e.currentTarget as HTMLSpanElement).style.textDecoration = 'underline'}
        onMouseLeave={(e) => (e.currentTarget as HTMLSpanElement).style.textDecoration = 'none'}
        onClick={(e) => { e.stopPropagation(); navigate(`/search?q=${encodeURIComponent(String(v))}`); }}>{truncateAddress(String(v))}</span>
    )},
    { key: 'type',          label: 'Type',    render: (v: unknown): ReactNode => <span style={TABLE.cell.plain as React.CSSProperties}>{TYPE_LABEL[String(v)] || String(v)}</span> },
    {
      key: 'riskScore', label: 'Risk Score',
      render: (v: unknown): ReactNode => {
        const s = (v as number) ?? 0;
        const color = s >= 90 ? '#EF4444' : s >= 70 ? '#F97316' : s >= 50 ? '#F59E0B' : '#22C55E';
        return <span style={{ ...(TABLE.cell.numeric as React.CSSProperties), color }}>{s}</span>;
      },
    },
    ...(isLead || isAdmin ? [{ key: 'generatedBy', label: 'Generated By', type: 'plain' }] : []),
    { key: 'date', label: 'Date', render: (v: unknown): ReactNode => <span style={TABLE.cell.mono as React.CSSProperties}>{new Date(String(v)).toLocaleDateString()}</span> },
    {
      key: 'id', label: '',
      render: (_v: unknown, row: Record<string, unknown>): ReactNode => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
          <GhostIcon icon={FileText} size="xs" onClick={() => setShowReport(row as unknown as Report)} />
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: SURFACE.frame.bg, padding: SURFACE.frame.padding, gap: SURFACE.frame.padding, boxSizing: 'border-box' }}>
        <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

        <div style={{ flex: 1, overflow: 'hidden' }}>

          <main style={{ height: '100%', overflow: 'hidden', background: SURFACE.content.bg, borderRadius: SURFACE.content.borderRadius, boxShadow: SURFACE.content.shadow, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flexShrink: 0 }}>
              <CaseHeader
                title="Reports"
                showStatusRow={false}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, background: SURFACE.content.bodyBg, padding: SURFACE.content.padding, display: 'flex', flexDirection: 'column', gap: 16 }}>

                <h2 style={{ ...(SURFACE.sectionHeading as React.CSSProperties), margin: 0 }}>My Downloads</h2>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {statCards.map((card) => (
                    <StatCard key={card.label} label={card.label} value={card.value} accent={card.accent} compact onClick={card.onFilter} active={isActiveStat(card)} />
                  ))}
                </div>

                {/* Filter panel */}
                <div style={{ background: SURFACE.panel.bg, borderRadius: SURFACE.panel.borderRadius, border: SURFACE.panel.border, boxShadow: SURFACE.panel.shadow, padding: SURFACE.panel.padding }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Filter size={COLORS.icon.size} style={{ color: '#B0B8C8', flexShrink: 0 }} />
                    <FormField label="Type" labelLayout="left">
                      <CustomSelect value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTS} />
                    </FormField>
                    <FormField label="Risk" labelLayout="left">
                      <CustomSelect value={riskFilter} onChange={setRiskFilter} options={RISK_OPTS} />
                    </FormField>
                    <FormField label="Search" labelLayout="left" style={{ flex: 1 }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#B0B8C8', pointerEvents: 'none' }}>
                          <path d="M3 6.75C3 5.505 4.005 4.5 5.25 4.5H18.75C19.995 4.5 21 5.505 21 6.75V17.25C21 18.495 19.995 19.5 18.75 19.5H5.25C4.005 19.5 3 18.495 3 17.25V6.75Z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M15.75 13.5C15.75 12.257 16.757 11.25 18 11.25H21V15.75H18C16.757 15.75 15.75 14.743 15.75 13.5Z" stroke="currentColor" strokeWidth="1.5"/>
                          <circle cx="18" cy="13.5" r="1.1" fill="currentColor"/>
                          <path d="M3 9.75H21" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        <input
                          type="text"
                          placeholder="Search by wallet or Case ID"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ width: '100%', height: INPUT.height, background: INPUT.bg, border: INPUT.border, borderRadius: INPUT.borderRadius, padding: INPUT.padding, paddingLeft: 32, fontSize: INPUT.fontSize, color: INPUT.color, boxShadow: INPUT.shadow, outline: 'none', transition: INPUT.transition, boxSizing: 'border-box', fontFamily: "'JetBrains Mono', monospace" }}
                          onFocus={(e)      => { e.currentTarget.style.border = INPUT.focus.border; e.currentTarget.style.boxShadow = INPUT.focus.shadow; }}
                          onBlur={(e)       => { e.currentTarget.style.border = INPUT.border; e.currentTarget.style.boxShadow = INPUT.shadow; }}
                          onMouseEnter={(e) => { e.currentTarget.style.border = INPUT.hover.border; }}
                          onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.border = INPUT.border; }}
                        />
                      </div>
                    </FormField>
                    <div style={{ width: 1, alignSelf: 'stretch', background: '#E5E7EB', flexShrink: 0 }} />
                    <button
                      type="button"
                      title="Reset filters"
                      onClick={resetFilters}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: COLORS.icon.dim, height: COLORS.icon.dim, borderRadius: RADIUS.md, border: 'none', background: 'none', cursor: 'pointer', color: isDirty ? COLORS.icon.active : COLORS.icon.restMuted, opacity: isDirty ? 1 : 0.4, transition: 'background 0.15s, color 0.15s, opacity 0.15s', flexShrink: 0 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isDirty ? COLORS.icon.activeBg : COLORS.icon.mutedBg; (e.currentTarget as HTMLButtonElement).style.color = isDirty ? COLORS.icon.activeHover : COLORS.icon.hover; (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = isDirty ? COLORS.icon.active : COLORS.icon.restMuted; (e.currentTarget as HTMLButtonElement).style.opacity = isDirty ? '1' : '0.4'; }}
                    >
                      <RotateCcw size={COLORS.icon.size} />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div style={{ background: SURFACE.panel.bg, borderRadius: SURFACE.panel.borderRadius, border: SURFACE.panel.border, boxShadow: SURFACE.panel.shadow, overflow: 'hidden' }}>
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
