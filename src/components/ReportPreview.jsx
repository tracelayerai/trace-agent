import { useState, useMemo } from 'react';
import { X, Download, Printer, Lock } from 'lucide-react';
import { Button, Badge } from './ui';
import logo from '../assets/images/ta_bw_logo.svg';

export function ReportPreview({ caseId = 'CASE-2026-0011', walletAddress = '0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f4a5b6c7d', onClose, initialType = 'full', availableTypes = 'full' }) {
  const allowed = useMemo(() => {
    if (availableTypes === 'basic') return ['basic'];
    if (availableTypes === 'analysis') return ['basic', 'analysis'];
    return ['basic', 'analysis', 'full'];
  }, [availableTypes]);
  const clampedInitial = useMemo(() => {
    if (allowed.includes(initialType)) return initialType;
    return allowed[allowed.length - 1];
  }, [initialType, allowed]);
  const [reportType, setReportType] = useState(clampedInitial);

  const getReportTypeLabel = (type) => {
    const labels = {
      basic: 'Basic Report',
      analysis: 'Analysis Report',
      full: 'Full Investigative Report',
    };
    return labels[type] || labels.full;
  };

  const truncateAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const showSection = (section) => {
    if (reportType === 'basic') return [1, 2, 3].includes(section);
    if (reportType === 'analysis') return [1, 2, 3, 4, 5].includes(section);
    return true; // full shows all
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      {/* Floating Action Bar */}
      <div className="fixed top-0 right-0 m-6 flex flex-col gap-3 z-50 bg-white rounded-lg shadow-lg p-4 border border-border max-w-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-text-primary">{getReportTypeLabel(reportType)}</p>
            {caseId && <p className="text-xs text-text-secondary">Case #{caseId}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Report type toggle — context-aware: only show options that are available */}
        {availableTypes === 'basic' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600">Basic Report — run Detailed Analysis to unlock Analysis and Full reports</p>
            <div className="flex rounded-lg border border-border p-0.5 bg-gray-100">
              <span className="flex-1 px-3 py-2 text-sm font-500 text-gray-900 bg-white shadow-sm rounded-md">Basic</span>
              <span className="flex-1 px-3 py-2 text-sm font-500 text-gray-400 flex items-center justify-center gap-1" title="Run Detailed Analysis to unlock">
                <Lock size={12} /> Analysis
              </span>
              <span className="flex-1 px-3 py-2 text-sm font-500 text-gray-400 flex items-center justify-center gap-1" title="Run Detailed Analysis and open a case to unlock">
                <Lock size={12} /> Full
              </span>
            </div>
          </div>
        )}
        {availableTypes === 'analysis' && (
          <div className="space-y-2">
            <div className="flex rounded-lg border border-border p-0.5 bg-gray-100">
              <button type="button" onClick={() => setReportType('basic')} className={`flex-1 px-3 py-2 text-sm font-500 rounded-md transition-colors ${reportType === 'basic' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Basic</button>
              <button type="button" onClick={() => setReportType('analysis')} className={`flex-1 px-3 py-2 text-sm font-500 rounded-md transition-colors ${reportType === 'analysis' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Analysis</button>
              <span className="flex-1 px-3 py-2 text-sm font-500 text-gray-400 flex items-center justify-center gap-1 cursor-not-allowed" title="Open a case to generate Full Investigative Report">
                <Lock size={12} /> Full
              </span>
            </div>
          </div>
        )}
        {availableTypes === 'full' && (
          <div className="flex rounded-lg border border-border p-0.5 bg-gray-100">
            {['basic', 'analysis', 'full'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setReportType(type)}
                className={`flex-1 px-3 py-2 text-sm font-500 rounded-md transition-colors ${
                  reportType === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type === 'basic' ? 'Basic' : type === 'analysis' ? 'Analysis' : 'Full'}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Printer size={16} />
            Print
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => alert(`Downloading ${getReportTypeLabel(reportType)}`)}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Document Container — centered, scrollable */}
      <div className="flex justify-center py-20 px-4">
      <div className="bg-white shadow-2xl max-w-3xl w-full rounded-lg">
        {/* Document Content */}
        <div className="px-16 py-12 bg-white rounded-lg">
          {/* ===== COVER BLOCK ===== */}
          <div className="pb-8 border-b border-border">
            <div className="flex justify-between items-start mb-8">
              {/* Left: Logo and branding */}
              <div className="flex items-center gap-3">
                <img src={logo} alt="TraceAgent" style={{ height: '24px' }} />
              </div>

              {/* Right: Header info */}
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-text-secondary mb-2">
                  Investigative Report
                </p>
                <div className="flex justify-end gap-2 mb-3">
                  <Badge variant="secondary" size="sm">
                    {reportType === 'basic'
                      ? 'BASIC'
                      : reportType === 'analysis'
                      ? 'ANALYSIS'
                      : 'FULL CASE'}
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary mb-1">
                  Generated: February 27, 2026 at 14:32 UTC
                </p>
                <p className="text-xs text-text-secondary">
                  Generated by: James Analyst — Senior Analyst
                </p>
              </div>
            </div>

            {/* Case Summary Block */}
            <div className="bg-page p-4 rounded-lg space-y-3">
              <div>
                <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-1">
                  Case ID
                </p>
                <p className="text-xl font-bold text-text-primary">{caseId}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-500 text-text-secondary uppercase tracking-wide">
                  Subject Wallet
                </p>
                <p className="font-mono text-sm text-text-primary">{walletAddress}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <p className="text-xs font-500 text-text-secondary mb-1">Chain</p>
                  <p className="text-sm font-semibold text-text-primary">Ethereum</p>
                </div>
                <div>
                  <p className="text-xs font-500 text-text-secondary mb-1">Risk Level</p>
                  <Badge variant="risk-critical">CRITICAL</Badge>
                </div>
                <div>
                  <p className="text-xs font-500 text-text-secondary mb-1">Typology</p>
                  <p className="text-sm font-semibold text-text-primary">Sanctions Evasion</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs font-500 text-text-secondary mb-1">Report Period</p>
                <p className="text-sm text-text-primary">
                  January 3, 2024 — February 18, 2026
                </p>
              </div>
            </div>
          </div>

          {/* ===== SECTION 1: EXECUTIVE SUMMARY ===== */}
          {showSection(1) && (
            <div className="py-8 border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-6">
                01 — Executive Summary
              </h2>
              <p className="text-sm leading-relaxed text-text-tertiary">
                Wallet {truncateAddress(walletAddress)} was identified as a high-risk address following
                autonomous multi-chain tracing initiated on February 27, 2026. The subject wallet received
                284.50 ETH from a mixer-associated cluster and subsequently executed systematic cross-chain
                layering via the Hop Protocol bridge. Trace Agent identified a confirmed 2-hop connection to
                an OFAC-sanctioned address (0x4f2a...9e1b), constituting a direct sanctions exposure risk. A
                transaction frequency of 200 transactions per hour is inconsistent with the subject's declared
                profile of Individual Retail Trader, indicating potential automated laundering infrastructure.
                This case has been escalated for SAR filing with FinCEN.
              </p>
            </div>
          )}

          {/* ===== SECTION 2: FUND FLOW TRACE ===== */}
          {showSection(2) && (
            <div className="py-8 border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">
                02 — Fund Flow Trace
              </h2>
              <p className="text-xs text-text-secondary mb-6">
                Autonomous trace completed across 3 chains, 7 hops, 12 intermediate wallets.
              </p>

              <div className="space-y-4">
                {[
                  {
                    num: '01',
                    from: '0x8f3a...2b1c',
                    to: truncateAddress(walletAddress),
                    amount: '142.88 ETH',
                    action: 'Received from mixer-associated cluster',
                    chain: 'Ethereum',
                    flag: true,
                  },
                  {
                    num: '02',
                    from: truncateAddress(walletAddress),
                    to: 'Hop Bridge',
                    amount: '142.88 ETH',
                    action: 'Cross-chain bridge initiated',
                    chain: 'Ethereum→Arbitrum',
                    flag: true,
                  },
                  {
                    num: '03',
                    from: 'Hop Protocol',
                    to: '0x9c4e...7f2a',
                    amount: '142.75 ETH',
                    action: 'Funds arrived on Arbitrum',
                    chain: 'Arbitrum',
                    flag: false,
                  },
                  {
                    num: '04',
                    from: '0x9c4e...7f2a',
                    to: 'DEX Aggregator',
                    amount: '142.75 ETH',
                    action: 'Swapped to USDC via 1inch',
                    chain: 'Arbitrum',
                    flag: false,
                  },
                  {
                    num: '05',
                    from: 'DEX',
                    to: '12 wallets',
                    amount: '~11.9 ETH each',
                    action: 'Systematic fragmentation — structuring pattern',
                    chain: 'Arbitrum',
                    flag: true,
                  },
                  {
                    num: '06',
                    from: 'Fragmentation wallets',
                    to: '0xb4e2...c021',
                    amount: '138.20 ETH',
                    action: 'Consolidation — 92% recovery rate',
                    chain: 'Arbitrum',
                    flag: false,
                  },
                  {
                    num: '07',
                    from: '0xb4e2...c021',
                    to: 'VASP (non-coop)',
                    amount: '138.20 ETH',
                    action: 'Final destination — hosted VASP',
                    chain: 'Arbitrum',
                    flag: true,
                  },
                ].map((hop, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b border-border last:border-0">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-6 h-6 rounded-full bg-text-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {hop.num}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-text-secondary mb-1">
                          <span className="font-mono">{hop.from}</span> → <span className="font-mono">{hop.to}</span>
                        </div>
                        <p className="text-sm font-semibold text-text-primary mb-1">{hop.amount}</p>
                        <p className="text-xs text-text-tertiary mb-2">{hop.action}</p>
                        <div className="flex gap-2 items-center">
                          <Badge variant="secondary" size="sm">
                            {hop.chain}
                          </Badge>
                          {hop.flag && <span className="text-orange-500">⚠️</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SECTION 3: RISK FLAGS ===== */}
          {showSection(3) && (
            <div className="py-8 border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-6">
                03 — Risk Flags & Indicators
              </h2>

              <div className="space-y-6">
                {[
                  {
                    title: 'Sanctions Exposure',
                    severity: 'risk-critical',
                    label: 'CRITICAL',
                    content:
                      'Direct 2-hop connection to OFAC-sanctioned address 0x4f2a...9e1b. Source: OFAC SDN List, updated March 2024. Constitutes a reportable sanctions exposure under 31 CFR Part 501.',
                    evidence: 'Transaction hash 0xf0e1d2c38f7a6b5c...',
                  },
                  {
                    title: 'Technical Obfuscation',
                    severity: 'risk-high',
                    label: 'HIGH',
                    content:
                      'Use of non-custodial mixer (Tornado Cash-adjacent cluster) combined with rapid cross-chain bridge usage across 3 networks within 47 minutes. This pattern is consistent with professional money laundering tradecraft.',
                    evidence: 'Hops 1–3 above.',
                  },
                  {
                    title: 'Behavioral Anomaly',
                    severity: 'risk-high',
                    label: 'HIGH',
                    content:
                      'Transaction frequency of 200 transactions/hour is statistically inconsistent with declared retail trader profile. Automated transaction execution strongly suggested. Pattern matches typology ref: FinCEN FIN-2023-A001.',
                    evidence: 'Transaction cluster Jan 13, 2024, 09:00–10:00 AM UTC.',
                  },
                ].map((flag, idx) => (
                  <div key={idx} className="border-l-4 border-orange-500 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs font-semibold text-text-primary">FLAG {String(idx + 1).padStart(2, '0')} — {flag.title}</p>
                      <Badge variant={flag.severity}>{flag.label}</Badge>
                    </div>
                    <p className="text-sm text-text-tertiary mb-2">{flag.content}</p>
                    <p className="text-xs text-text-secondary italic">
                      Supporting evidence: {flag.evidence}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SECTION 4: RISK ASSESSMENT ===== */}
          {showSection(4) && (
            <div className="py-8 border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-6">
                04 — Risk Assessment & Regulatory Impact
              </h2>

              <div className="space-y-6">
                {[
                  {
                    label: 'Compliance Rationale',
                    content:
                      'The deliberate use of fund fragmentation across 12 intermediate wallets, combined with cross-chain bridging within a compressed timeframe, indicates a calculated attempt to defeat automated transaction monitoring systems. The 92% consolidation rate suggests a professionally managed operation rather than opportunistic activity.',
                  },
                  {
                    label: 'Threat Actor Assessment',
                    content:
                      'The technical sophistication of the automation, the use of mixer-adjacent infrastructure, and the final destination in a non-cooperative VASP jurisdiction suggest this may be a professionally managed money laundering syndicate or a state-sponsored actor seeking to bypass economic sanctions imposed following the 2022 enforcement actions.',
                  },
                  {
                    label: 'Regulatory Impact',
                    content:
                      'Failure to freeze and report these funds would constitute a violation of FinCEN 2024 Stablecoin Guidance and OFAC sanctions regulations. The platform faces material legal and reputational risk. Immediate SAR filing with FinCEN is recommended. Evidence package is attached to this report.',
                  },
                ].map((section, idx) => (
                  <div key={idx}>
                    <p className="text-sm font-semibold text-text-primary mb-2">{section.label}</p>
                    <p className="text-sm text-text-tertiary leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SECTION 5: ANALYST NOTES ===== */}
          {showSection(5) && (
            <div className="py-8 border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-6">
                05 — Analyst Notes & Actions
              </h2>

              <div className="space-y-4">
                {[
                  {
                    author: 'James Analyst',
                    role: 'Senior Analyst',
                    timestamp: 'Feb 27, 2026 14:15',
                    content: 'Initial review complete. Sanctions match confirmed via OFAC API. Escalating to full investigation.',
                  },
                  {
                    author: 'James Analyst',
                    role: 'Senior Analyst',
                    timestamp: 'Feb 27, 2026 14:28',
                    content:
                      'Traced bridge activity to Hop Protocol. Destination VASP identified as operating in non-cooperative jurisdiction (ref: FATF Grey List 2024). Preparing SAR documentation.',
                  },
                  {
                    author: 'Sarah Chen',
                    role: 'Compliance Lead',
                    timestamp: 'Feb 27, 2026 15:42',
                    content: 'Reviewed and approved for SAR filing. Case escalated to Critical. Legal team notified.',
                  },
                ].map((note, idx) => (
                  <div key={idx} className="pb-4 border-b border-border last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-text-primary">
                        {note.author} <span className="font-normal text-text-secondary">— {note.role}</span>
                      </p>
                      <p className="text-xs text-text-secondary">{note.timestamp}</p>
                    </div>
                    <p className="text-sm text-text-tertiary">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SECTION 6: CHAIN OF CUSTODY ===== */}
          {showSection(6) && (
            <div className="py-8 border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-6">
                06 — Chain of Custody
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-xs font-semibold text-text-secondary">
                        Timestamp
                      </th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-text-secondary">
                        Action
                      </th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-text-secondary">
                        Performed By
                      </th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-text-secondary">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        timestamp: 'Feb 27, 2026 13:58',
                        action: 'Wallet Searched',
                        by: 'James Analyst',
                        details: 'Initial search via TraceAgent platform',
                      },
                      {
                        timestamp: 'Feb 27, 2026 14:02',
                        action: 'Detailed Analysis Run',
                        by: 'James Analyst',
                        details: 'AI trace initiated — 8 hops analyzed',
                      },
                      {
                        timestamp: 'Feb 27, 2026 14:05',
                        action: 'Case Opened',
                        by: 'James Analyst',
                        details: 'Case CASE-2026-0011 created, risk: Critical',
                      },
                      {
                        timestamp: 'Feb 27, 2026 14:15',
                        action: 'Note Added',
                        by: 'James Analyst',
                        details: 'Sanctions match confirmed',
                      },
                      {
                        timestamp: 'Feb 27, 2026 14:28',
                        action: 'Note Added',
                        by: 'James Analyst',
                        details: 'Bridge activity traced',
                      },
                      {
                        timestamp: 'Feb 27, 2026 15:42',
                        action: 'Status Updated',
                        by: 'Sarah Chen',
                        details: 'Escalated to Critical',
                      },
                      {
                        timestamp: 'Feb 27, 2026 15:43',
                        action: 'Note Added',
                        by: 'Sarah Chen',
                        details: 'SAR filing approved',
                      },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-border last:border-0">
                        <td className="py-2 px-2 text-xs text-text-secondary">{row.timestamp}</td>
                        <td className="py-2 px-2 text-xs text-text-primary font-medium">{row.action}</td>
                        <td className="py-2 px-2 text-xs text-text-secondary">{row.by}</td>
                        <td className="py-2 px-2 text-xs text-text-tertiary">{row.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== FOOTER ===== */}
          <div className="pt-8 border-t border-border flex justify-between items-center text-xs text-text-secondary">
            <p>Generated by TraceAgent — Trace Layer Inc.</p>
            <p className="font-semibold">CONFIDENTIAL — For regulatory use only</p>
            <p>Page 1 of 1 — Case {caseId}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default ReportPreview;
