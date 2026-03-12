import { useState, useMemo } from 'react';
import { X, Download, Printer, Lock } from 'lucide-react';
import { Badge } from './ui';
import { Btn } from './core/CaseHeader';
import logo from '../assets/images/ta_bw_logo.svg';
import { SURFACE, COLORS, TYPOGRAPHY, RADIUS, CALLOUT } from '@/tokens/designTokens';

type ReportType = 'basic' | 'analysis' | 'full';
type AvailableTypes = 'basic' | 'analysis' | 'full';

interface ReportPreviewProps {
  caseId?: string;
  walletAddress?: string;
  onClose?: () => void;
  initialType?: ReportType;
  availableTypes?: AvailableTypes;
}

type SurfaceFrame = { bg: string; padding: number | string };
type SurfaceNav = { paddingX: number; height: number; border: string };
type SurfaceContent = { borderRadius: number | string; shadow: string; bodyBg: string };
type SurfacePanel = { bg: string; border: string; borderRadius: number | string };
type TypographyToken = { fontMono: string; fontSans: string };
type ColorsToken = { text: { white: string } };

const SF  = SURFACE.frame   as unknown as SurfaceFrame;
const SN  = SURFACE.nav     as unknown as SurfaceNav;
const SCo = SURFACE.content as unknown as SurfaceContent;
const SP  = SURFACE.panel   as unknown as SurfacePanel;
const TY  = TYPOGRAPHY      as unknown as TypographyToken;
const CL  = COLORS          as unknown as ColorsToken;

const TAB_LABELS: Record<ReportType, string> = { basic: 'Basic', analysis: 'Analysis', full: 'Full' };

export function ReportPreview({ caseId = 'CASE-2026-0011', walletAddress = '0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f4a5b6c7d', onClose, initialType = 'full', availableTypes = 'full' }: ReportPreviewProps) {
  const allowed = useMemo<ReportType[]>(() => {
    if (availableTypes === 'basic') return ['basic'];
    if (availableTypes === 'analysis') return ['basic', 'analysis'];
    return ['basic', 'analysis', 'full'];
  }, [availableTypes]);

  const clampedInitial = useMemo<ReportType>(() => {
    if (allowed.includes(initialType)) return initialType;
    return allowed[allowed.length - 1];
  }, [initialType, allowed]);

  const [reportType, setReportType] = useState<ReportType>(clampedInitial);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const showSection = (section: number) => {
    if (reportType === 'basic') return [1, 2, 3].includes(section);
    if (reportType === 'analysis') return [1, 2, 3, 4, 5].includes(section);
    return true;
  };

  const truncAddr = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';

  const navStyle = {
    flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: `0 ${SN.paddingX}px`,
    height: SN.height,
    background: 'transparent',
    marginBottom: SF.padding,
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: SF.bg,
      display: 'flex', flexDirection: 'column',
      padding: SF.padding,
      boxSizing: 'border-box',
      fontFamily: TY.fontSans,
    }}>

      {/* Top nav band */}
      <div style={navStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>
            Report Preview
          </span>
          {truncAddr && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>·</span>
              <span style={{ fontFamily: TY.fontMono, fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                {truncAddr}
              </span>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.08)', border: SN.border,
            borderRadius: RADIUS.md,
            padding: '4px 12px',
            color: CL.text.white, opacity: 0.75,
            fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'opacity 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        >
          <X size={13} />
          Close
        </button>
      </div>

      {/* Scrollable document */}
      <div style={{ flex: 1, overflow: 'hidden', borderRadius: SCo.borderRadius, boxShadow: SCo.shadow, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>

        {/* White action bar */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: `1px solid ${COLORS.bg.lighter}`, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', border: SP.border, borderRadius: 8, padding: 3, background: SP.bg, gap: 2 }}>
              {allowed.map((type) => (
                <Btn key={type} variant="segment" active={reportType === type} onClick={() => setReportType(type)}>
                  {TAB_LABELS[type]}
                </Btn>
              ))}
              {availableTypes !== 'full' && (
                <>
                  {availableTypes === 'basic' && (['Analysis', 'Full'] as const).map((lbl) => (
                    <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', fontSize: 12, color: '#D1D5DB', cursor: 'not-allowed' }}>
                      <Lock size={10} />{lbl}
                    </span>
                  ))}
                  {availableTypes === 'analysis' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', fontSize: 12, color: '#D1D5DB', cursor: 'not-allowed' }}>
                      <Lock size={10} />Full
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn variant="outline" icon={Printer} onClick={() => window.print()}>Print</Btn>
            <Btn variant="dark" icon={Download} onClick={() => { /* TODO: replace with onExport(reportType) prop wired to PDF generation API */ }}>Export PDF</Btn>
          </div>
        </div>

        {/* Document scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', background: SCo.bodyBg, padding: '32px 24px' }}>
          <div style={{ maxWidth: 780, margin: '0 auto', background: '#FFFFFF', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <div className="px-16 py-12 bg-white rounded-lg">
              {/* COVER BLOCK */}
              <div className="pb-8 border-b border-border">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="TraceAgent" style={{ height: '24px' }} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-text-secondary mb-2">
                      Investigative Report
                    </p>
                    <div className="flex justify-end gap-2 mb-3">
                      <Badge variant="secondary">
                        {reportType === 'basic' ? 'BASIC' : reportType === 'analysis' ? 'ANALYSIS' : 'FULL CASE'}
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

                <div className="bg-page p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-1">Case ID</p>
                    <p className="text-xl font-bold text-text-primary">{caseId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-500 text-text-secondary uppercase tracking-wide">Subject Wallet</p>
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
                    <p className="text-sm text-text-primary">January 3, 2024 — February 18, 2026</p>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              {['analysis', 'full'].includes(reportType) && (
                <div style={{ margin: '0 0 24px', border: CALLOUT.variants.warning.border, borderLeft: `3px solid ${CALLOUT.variants.warning.accent}`, borderRadius: 8, padding: CALLOUT.padding, background: CALLOUT.variants.warning.bg }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                    <span style={{ fontSize: CALLOUT.labelSize, fontWeight: 700, color: CALLOUT.variants.warning.labelColor, textTransform: 'uppercase', letterSpacing: '0.07em' }}>⚡ AI Summary</span>
                  </div>
                  <p style={{ fontSize: CALLOUT.textSize, color: CALLOUT.variants.warning.textColor, lineHeight: CALLOUT.lineHeight, margin: 0 }}>
                    The wallet at{' '}
                    <span style={{ fontFamily: TY.fontMono, fontSize: 12, background: '#F3F4F6', padding: '1px 5px', borderRadius: 3 }}>{truncAddr || '0x7a3d…6c7d'}</span>
                    {' '}exhibits a sophisticated layering pattern consistent with sanctions evasion. Funds originating from mixer-associated clusters were bridged cross-chain via Hop Protocol and systematically fragmented across 12 sub-wallets before consolidation and transfer to a non-cooperative VASP. A direct 2-hop connection to OFAC-sanctioned address{' '}
                    <span style={{ fontFamily: TY.fontMono, fontSize: 12, background: '#F3F4F6', padding: '1px 5px', borderRadius: 3 }}>0x4f2a…9e1b</span>
                    {' '}has been confirmed. Immediate escalation and SAR filing are recommended.
                  </p>
                </div>
              )}

              {reportType === 'basic' && (
                <div style={{ margin: '0 0 24px', border: CALLOUT.variants.critical.border, borderLeft: `3px solid ${CALLOUT.variants.critical.accent}`, borderRadius: 8, padding: CALLOUT.padding, background: CALLOUT.variants.critical.bg }}>
                  <p style={{ fontSize: CALLOUT.textSize, color: CALLOUT.variants.critical.textColor, lineHeight: CALLOUT.lineHeight, margin: 0 }}>
                    <strong>Immediate action recommended.</strong> Risk score 91 with confirmed mixer usage and structuring pattern — this wallet meets the threshold for formal case investigation.
                  </p>
                </div>
              )}

              {/* SECTION 1 */}
              {showSection(1) && (
                <div className="py-8 border-b border-border">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-6">01 — Executive Summary</h2>
                  <p className="text-sm leading-relaxed text-text-tertiary">
                    Wallet {truncateAddress(walletAddress)} was identified as a high-risk address following autonomous multi-chain tracing initiated on February 27, 2026. The subject wallet received 284.50 ETH from a mixer-associated cluster and subsequently executed systematic cross-chain layering via the Hop Protocol bridge. Trace Agent identified a confirmed 2-hop connection to an OFAC-sanctioned address (0x4f2a...9e1b), constituting a direct sanctions exposure risk. A transaction frequency of 200 transactions per hour is inconsistent with the subject's declared profile of Individual Retail Trader, indicating potential automated laundering infrastructure. This case has been escalated for SAR filing with FinCEN.
                  </p>
                </div>
              )}

              {/* SECTION 2 */}
              {showSection(2) && (
                <div className="py-8 border-b border-border">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">02 — Fund Flow Trace</h2>
                  <p className="text-xs text-text-secondary mb-6">Autonomous trace completed across 3 chains, 7 hops, 12 intermediate wallets.</p>
                  <div className="space-y-4">
                    {[
                      { num: '01', from: '0x8f3a...2b1c', to: truncateAddress(walletAddress), amount: '142.88 ETH', action: 'Received from mixer-associated cluster', chain: 'Ethereum', flag: true },
                      { num: '02', from: truncateAddress(walletAddress), to: 'Hop Bridge', amount: '142.88 ETH', action: 'Cross-chain bridge initiated', chain: 'Ethereum→Arbitrum', flag: true },
                      { num: '03', from: 'Hop Protocol', to: '0x9c4e...7f2a', amount: '142.75 ETH', action: 'Funds arrived on Arbitrum', chain: 'Arbitrum', flag: false },
                      { num: '04', from: '0x9c4e...7f2a', to: 'DEX Aggregator', amount: '142.75 ETH', action: 'Swapped to USDC via 1inch', chain: 'Arbitrum', flag: false },
                      { num: '05', from: 'DEX', to: '12 wallets', amount: '~11.9 ETH each', action: 'Systematic fragmentation — structuring pattern', chain: 'Arbitrum', flag: true },
                      { num: '06', from: 'Fragmentation wallets', to: '0xb4e2...c021', amount: '138.20 ETH', action: 'Consolidation — 92% recovery rate', chain: 'Arbitrum', flag: false },
                      { num: '07', from: '0xb4e2...c021', to: 'VASP (non-coop)', amount: '138.20 ETH', action: 'Final destination — hosted VASP', chain: 'Arbitrum', flag: true },
                    ].map((hop, idx) => (
                      <div key={idx} className="flex gap-4 pb-4 border-b border-border last:border-0">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-6 h-6 rounded-full bg-text-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">{hop.num}</div>
                          <div className="flex-1">
                            <div className="text-xs text-text-secondary mb-1">
                              <span className="font-mono">{hop.from}</span> → <span className="font-mono">{hop.to}</span>
                            </div>
                            <p className="text-sm font-semibold text-text-primary mb-1">{hop.amount}</p>
                            <p className="text-xs text-text-tertiary mb-2">{hop.action}</p>
                            <div className="flex gap-2 items-center">
                              <Badge variant="secondary">{hop.chain}</Badge>
                              {hop.flag && <span className="text-orange-500">⚠️</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3 */}
              {showSection(3) && (
                <div className="py-8 border-b border-border">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-6">03 — Risk Flags & Indicators</h2>
                  <div className="space-y-6">
                    {[
                      { title: 'Sanctions Exposure', severity: 'risk-critical', label: 'CRITICAL', content: 'Direct 2-hop connection to OFAC-sanctioned address 0x4f2a...9e1b. Source: OFAC SDN List, updated March 2024. Constitutes a reportable sanctions exposure under 31 CFR Part 501.', evidence: 'Transaction hash 0xf0e1d2c38f7a6b5c...' },
                      { title: 'Technical Obfuscation', severity: 'risk-high', label: 'HIGH', content: 'Use of non-custodial mixer (Tornado Cash-adjacent cluster) combined with rapid cross-chain bridge usage across 3 networks within 47 minutes. This pattern is consistent with professional money laundering tradecraft.', evidence: 'Hops 1–3 above.' },
                      { title: 'Behavioral Anomaly', severity: 'risk-high', label: 'HIGH', content: 'Transaction frequency of 200 transactions/hour is statistically inconsistent with declared retail trader profile. Automated transaction execution strongly suggested. Pattern matches typology ref: FinCEN FIN-2023-A001.', evidence: 'Transaction cluster Jan 13, 2024, 09:00–10:00 AM UTC.' },
                    ].map((flag, idx) => (
                      <div key={idx} className="border-l-4 border-orange-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-xs font-semibold text-text-primary">FLAG {String(idx + 1).padStart(2, '0')} — {flag.title}</p>
                          <Badge variant={flag.severity}>{flag.label}</Badge>
                        </div>
                        <p className="text-sm text-text-tertiary mb-2">{flag.content}</p>
                        <p className="text-xs text-text-secondary italic">Supporting evidence: {flag.evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4 */}
              {showSection(4) && (
                <div className="py-8 border-b border-border">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-6">04 — Risk Assessment & Regulatory Impact</h2>
                  <div className="space-y-6">
                    {[
                      { label: 'Compliance Rationale', content: 'The deliberate use of fund fragmentation across 12 intermediate wallets, combined with cross-chain bridging within a compressed timeframe, indicates a calculated attempt to defeat automated transaction monitoring systems. The 92% consolidation rate suggests a professionally managed operation rather than opportunistic activity.' },
                      { label: 'Threat Actor Assessment', content: 'The technical sophistication of the automation, the use of mixer-adjacent infrastructure, and the final destination in a non-cooperative VASP jurisdiction suggest this may be a professionally managed money laundering syndicate or a state-sponsored actor seeking to bypass economic sanctions imposed following the 2022 enforcement actions.' },
                      { label: 'Regulatory Impact', content: 'Failure to freeze and report these funds would constitute a violation of FinCEN 2024 Stablecoin Guidance and OFAC sanctions regulations. The platform faces material legal and reputational risk. Immediate SAR filing with FinCEN is recommended. Evidence package is attached to this report.' },
                    ].map((section, idx) => (
                      <div key={idx}>
                        <p className="text-sm font-semibold text-text-primary mb-2">{section.label}</p>
                        <p className="text-sm text-text-tertiary leading-relaxed">{section.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 5 */}
              {showSection(5) && (
                <div className="py-8 border-b border-border">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-6">05 — Analyst Notes & Actions</h2>
                  <div className="space-y-4">
                    {[
                      { author: 'James Analyst', role: 'Senior Analyst', timestamp: 'Feb 27, 2026 14:15', content: 'Initial review complete. Sanctions match confirmed via OFAC API. Escalating to full investigation.' },
                      { author: 'James Analyst', role: 'Senior Analyst', timestamp: 'Feb 27, 2026 14:28', content: 'Traced bridge activity to Hop Protocol. Destination VASP identified as operating in non-cooperative jurisdiction (ref: FATF Grey List 2024). Preparing SAR documentation.' },
                      { author: 'Sarah Chen', role: 'Compliance Lead', timestamp: 'Feb 27, 2026 15:42', content: 'Reviewed and approved for SAR filing. Case escalated to Critical. Legal team notified.' },
                    ].map((note, idx) => (
                      <div key={idx} className="pb-4 border-b border-border last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-semibold text-text-primary">{note.author} <span className="font-normal text-text-secondary">— {note.role}</span></p>
                          <p className="text-xs text-text-secondary">{note.timestamp}</p>
                        </div>
                        <p className="text-sm text-text-tertiary">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 6 */}
              {showSection(6) && (
                <div className="py-8 border-b border-border">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-6">06 — Chain of Custody</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-2 text-xs font-semibold text-text-secondary">Timestamp</th>
                          <th className="text-left py-2 px-2 text-xs font-semibold text-text-secondary">Action</th>
                          <th className="text-left py-2 px-2 text-xs font-semibold text-text-secondary">Performed By</th>
                          <th className="text-left py-2 px-2 text-xs font-semibold text-text-secondary">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { timestamp: 'Feb 27, 2026 13:58', action: 'Wallet Searched',      by: 'James Analyst', details: 'Initial search via TraceAgent platform' },
                          { timestamp: 'Feb 27, 2026 14:02', action: 'Detailed Analysis Run', by: 'James Analyst', details: 'AI trace initiated — 8 hops analyzed' },
                          { timestamp: 'Feb 27, 2026 14:05', action: 'Case Opened',           by: 'James Analyst', details: 'Case CASE-2026-0011 created, risk: Critical' },
                          { timestamp: 'Feb 27, 2026 14:15', action: 'Note Added',            by: 'James Analyst', details: 'Sanctions match confirmed' },
                          { timestamp: 'Feb 27, 2026 14:28', action: 'Note Added',            by: 'James Analyst', details: 'Bridge activity traced' },
                          { timestamp: 'Feb 27, 2026 15:42', action: 'Status Updated',        by: 'Sarah Chen',    details: 'Escalated to Critical' },
                          { timestamp: 'Feb 27, 2026 15:43', action: 'Note Added',            by: 'Sarah Chen',    details: 'SAR filing approved' },
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

              {/* FOOTER */}
              <div className="pt-8 border-t border-border flex justify-between items-center text-xs text-text-secondary">
                <p>Generated by TraceAgent — Trace Layer Inc.</p>
                <p className="font-semibold">CONFIDENTIAL — For regulatory use only</p>
                <p>Page 1 of 1 — Case {caseId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportPreview;
