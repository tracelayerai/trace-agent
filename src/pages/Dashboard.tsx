import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import {
  CheckCircle, Clock, Activity, Search,
  UserPlus, Users, Settings, ChevronRight, TrendingUp, AlertTriangle,
} from 'lucide-react';
import mascot from '@/assets/images/masc1.jpg';
import { StatCard } from '@/components/ui';
import { StatusChip } from '@/components/core/StatusChip';
import { CaseHeader } from '@/components/core/CaseHeader';
import SearchBar from '@/components/SearchBar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { mockCases } from '@/data/mock/cases';
import { useCaseStats } from '@/hooks/useCaseStats';
import { SURFACE, COLORS, TABLE, RADIUS, DASH_WIDGET } from '@/tokens/designTokens';

type Case = (typeof mockCases)[number];

// ── Static mock data ──────────────────────────────────────────────────────────

const RECENT_WALLETS = [
  { address: '0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f', chain: 'Ethereum', risk: 'Critical', score: 94, typology: 'Mixer / Layering',    when: '2h ago'    },
  { address: '0xabc123def456789abc123def456789abc1', chain: 'Tron',     risk: 'High',     score: 78, typology: 'Structuring',        when: '5h ago'    },
  { address: '0x1234567890abcdef1234567890abcdef12', chain: 'Ethereum', risk: 'Medium',   score: 55, typology: 'Sanctions Exposure', when: 'Yesterday' },
  { address: '0xdeadbeef1234567890abcdefdeadbeef12', chain: 'Bitcoin',  risk: 'Low',      score: 32, typology: 'Under Review',       when: 'Yesterday' },
];

const ANALYST_ACTIVITY = [
  { action: 'Submitted CASE-006 for approval',  when: '1h ago'    },
  { action: 'Ran AI analysis on 0x7a3d...2e3f', when: '2h ago'    },
  { action: 'Updated notes on CASE-2026-0011',  when: '3h ago'    },
  { action: 'Generated report for CASE-005',    when: 'Yesterday' },
  { action: 'Opened CASE-008 investigation',    when: 'Yesterday' },
];

const AGING_CASES = [
  { id: 'CASE-003', risk: 'High',     days: 7, typology: 'Layering'          },
  { id: 'CASE-009', risk: 'Medium',   days: 5, typology: 'Structuring'       },
  { id: 'CASE-011', risk: 'Critical', days: 4, typology: 'Sanctions Evasion' },
  { id: 'CASE-012', risk: 'Low',      days: 3, typology: 'Mixing'            },
];

const TEAM_WORKLOAD = [
  { name: 'Lily Bennett', open: 4, pending: 2, returned: 1, initials: 'LB', color: '#93C5FD' },
  { name: 'Marcus Webb',  open: 3, pending: 1, returned: 0, initials: 'MW', color: '#6EE7B7' },
  { name: 'Priya Sharma', open: 5, pending: 0, returned: 1, initials: 'PS', color: '#FCA5A5' },
  { name: 'Jordan Reyes', open: 2, pending: 3, returned: 0, initials: 'JR', color: '#C4B5FD' },
];

const TEAM_ACTIVITY = [
  { actor: 'Lily Bennett',  action: 'submitted CASE-006 for approval', when: '30m ago'   },
  { actor: 'Marcus Webb',   action: 'opened CASE-014 investigation',   when: '1h ago'    },
  { actor: 'Priya Sharma',  action: 'ran AI analysis on 0x1a2b...3c4d',when: '2h ago'    },
  { actor: 'Jordan Reyes',  action: 'updated notes on CASE-015',       when: '3h ago'    },
  { actor: 'Lily Bennett',  action: 'submitted CASE-007 for approval', when: 'Yesterday' },
];

const RECENTLY_RETURNED = [
  { id: 'CASE-004', analyst: 'Lily Bennett',  reason: 'Insufficient evidence',   when: '1h ago'    },
  { id: 'CASE-012', analyst: 'Priya Sharma',  reason: 'Missing SAR narrative',    when: 'Yesterday' },
  { id: 'CASE-016', analyst: 'Jordan Reyes',  reason: 'Chain tracing incomplete', when: '2d ago'    },
];

const CASE_VELOCITY = [
  { day: 'Mon', count: 3 },
  { day: 'Tue', count: 5 },
  { day: 'Wed', count: 2 },
  { day: 'Thu', count: 6 },
  { day: 'Fri', count: 4 },
  { day: 'Sat', count: 1 },
  { day: 'Sun', count: 0 },
];

const AUDIT_LOG = [
  { actor: 'Rachel Scott',  role: 'Lead',    action: 'approved CASE-006',                     when: '20m ago',   type: 'green'  },
  { actor: 'Daniel Cooper', role: 'Admin',   action: 'invited Nina Torres (analyst)',          when: '1h ago',    type: 'purple' },
  { actor: 'Lily Bennett',  role: 'Analyst', action: 'submitted CASE-013 for approval',        when: '2h ago',    type: 'amber'  },
  { actor: 'Rachel Scott',  role: 'Lead',    action: 'returned CASE-012 with notes',           when: '3h ago',    type: 'red'    },
  { actor: 'System',        role: '—',       action: 'AI analysis completed for 0x9c1d...4d',  when: '4h ago',    type: 'blue'   },
  { actor: 'Daniel Cooper', role: 'Admin',   action: 'deactivated Jordan Reyes',               when: 'Yesterday', type: 'purple' },
  { actor: 'Sam Okafor',    role: 'Lead',    action: 'assigned Priya Sharma to CASE-015',      when: 'Yesterday', type: 'amber'  },
  { actor: 'Daniel Cooper', role: 'Admin',   action: 'exported Q1 compliance report',          when: 'Yesterday', type: 'grey'   },
];

const AUDIT_DOT: Record<string, string> = { green: '#22C55E', amber: '#F59E0B', red: '#EF4444', blue: '#3B82F6', purple: '#8B5CF6', grey: '#9CA3AF' };

const COMPLIANCE_KPIS = [
  { label: 'SLA Met (≤5d)',   value: '89%',  pct: 89, color: '#22C55E' },
  { label: 'SAR Filing Rate', value: '76%',  pct: 76, color: '#3B82F6' },
  { label: 'AI Assist Rate',  value: '94%',  pct: 94, color: '#8B5CF6' },
  { label: 'Avg. Resolution', value: '4.2d', pct: 58, color: '#9CA3AF' },
];

const ADMIN_QUICK_ACTIONS = [
  { Icon: UserPlus,  label: 'Invite User',   desc: 'Add a new analyst or lead',        color: '#6366F1', bg: '#EEF2FF', border: '#C7D2FE', navState: { openInvite: true }          },
  { Icon: Users,     label: 'Manage Users',  desc: 'Edit roles, reassign cases',       color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', navState: { tab: 'Manage Users' }       },
  { Icon: Settings,  label: 'System Config', desc: 'Escalation rules & notifications', color: '#374151', bg: '#F9FAFB', border: '#E5E7EB', navState: { tab: 'Configuration' }      },
];

const RISK_COLOR: Record<string, string> = { Critical: '#EF4444', High: '#F97316', Medium: '#F59E0B', Low: '#22C55E' };
const truncAddr  = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

// ── DashWidget — auto height, breathable, no scroll ──────────────────────────
interface DashWidgetProps {
  title: string;
  action?: { label: string; onClick: () => void } | null;
  children: ReactNode;
  minHeight?: number;
}
function DashWidget({ title, action, children, minHeight }: DashWidgetProps) {
  return (
    <div style={{
      background:    SURFACE.panel.bg,
      borderRadius:  SURFACE.panel.borderRadius,
      border:        SURFACE.panel.border,
      boxShadow:     SURFACE.panel.shadow,
      display:       'flex',
      flexDirection: 'column',
      minHeight:     minHeight,
      overflow:      'hidden',
    }}>
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '12px 20px',
        borderBottom:   TABLE.row.borderBottom,
        flexShrink:     0,
      }}>
        <p style={DASH_WIDGET.title as React.CSSProperties}>{title}</p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            style={DASH_WIDGET.action as React.CSSProperties}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = (DASH_WIDGET.actionHover as React.CSSProperties).background as string; (e.currentTarget as HTMLButtonElement).style.color = (DASH_WIDGET.actionHover as React.CSSProperties).color as string; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = (DASH_WIDGET.action as React.CSSProperties).background as string; (e.currentTarget as HTMLButtonElement).style.color = (DASH_WIDGET.action as React.CSSProperties).color as string; }}
          >
            {action.label}
          </button>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
interface EmptyStateProps { message: string; sub?: string; }
function EmptyState({ message, sub }: EmptyStateProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: 8, textAlign: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCircle size={16} style={{ color: '#22C55E' }} />
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', margin: 0 }}>{message}</p>
      {sub && <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>{sub}</p>}
    </div>
  );
}

// ── Activity row — timeline dot style ────────────────────────────────────────
interface ActivityRowProps { text: ReactNode; when: string; dotColor?: string; isLast?: boolean; }
function ActivityRow({ text, when, dotColor = '#D1D5DB', isLast }: ActivityRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px', borderBottom: isLast ? 'none' : TABLE.row.borderBottom }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: 4 }} />
      <p style={{ fontSize: 12, color: '#4B5563', margin: 0, flex: 1, lineHeight: 1.5 }}>{text}</p>
      <span style={{ fontSize: 11, color: '#B0B8C8', flexShrink: 0, paddingTop: 1 }}>{when}</span>
    </div>
  );
}

// ── Risk / metric bar ─────────────────────────────────────────────────────────
interface MetricBarProps { label: string; labelRight: ReactNode; pct: number; color: string; max?: number; }
function MetricBar({ label, labelRight, pct, color, max = 100 }: MetricBarProps) {
  const w = pct === 0 ? 3 : `${Math.max((pct / max) * 100, 6)}%`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color, width: 60, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 999, height: 8, overflow: 'hidden' }}>
        <div style={{ height: 8, borderRadius: 999, background: color, width: w, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 12, color: '#6B7280', width: 28, textAlign: 'right', flexShrink: 0 }}>{labelRight}</span>
    </div>
  );
}

// ── Shared sub-widgets ────────────────────────────────────────────────────────
interface RiskBarsProps {
  riskCounts: { level: string; count: number; color: string }[];
  maxRisk: number;
  footer?: string;
}
function RiskBars({ riskCounts, maxRisk, footer }: RiskBarsProps) {
  return (
    <>
      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div>
          {riskCounts.map(({ level, count, color }) => (
            <MetricBar key={level} label={level} labelRight={count} pct={count} max={maxRisk} color={color} />
          ))}
        </div>
      </div>
      {footer && (
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 'auto 0 0', padding: '10px 20px', borderTop: TABLE.row.borderBottom }}>{footer}</p>
      )}
    </>
  );
}

// ── Analyst widgets ───────────────────────────────────────────────────────────
interface AnalystWidgetsProps {
  navigate: NavigateFunction;
  myCases: Case[];
  attentionCases: Case[];
  riskCounts: { level: string; count: number; color: string }[];
  maxRisk: number;
}
function AnalystWidgets({ navigate, myCases, attentionCases, riskCounts, maxRisk }: AnalystWidgetsProps) {
  return (
    <>
      {/* Row 2 — 5:7 */}
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 16 }}>

        <DashWidget
          title="Needs Attention"
          action={attentionCases.length > 0 ? { label: 'View all cases', onClick: () => navigate('/cases') } : null}
          minHeight={180}
        >
          {attentionCases.length === 0 ? (
            <EmptyState message="All clear" sub="No returned or critical cases" />
          ) : (
            attentionCases.map((c) => {
              const isReturned  = c.status === 'returned';
              const borderColor = isReturned ? RISK_COLOR.Critical : RISK_COLOR.High;
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/cases/${c.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px 11px 16px', borderBottom: TABLE.row.borderBottom, borderLeft: `3px solid ${borderColor}`, cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = TABLE.row.hoverBg; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'none'; }}
                >
                  <span style={{ ...(TABLE.cell.monoId as React.CSSProperties), flexShrink: 0 }}>{c.id}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.typology}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <StatusChip risk={c.riskLevel} size="sm" />
                    {isReturned && <StatusChip status="returned" size="sm" />}
                    <ChevronRight size={12} style={{ color: '#D1D5DB' }} />
                  </div>
                </div>
              );
            })
          )}
        </DashWidget>

        <DashWidget title="Recent Wallets" action={{ label: 'Open Search', onClick: () => navigate('/search') }}>
          {RECENT_WALLETS.map((w, i) => (
            <div
              key={i}
              onClick={() => navigate(`/search?q=${encodeURIComponent(w.address)}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: TABLE.row.borderBottom, cursor: 'pointer', transition: 'background 0.12s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = TABLE.row.hoverBg; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'none'; }}
            >
              <Search size={12} style={{ color: '#D1D5DB', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ ...(TABLE.cell.mono as React.CSSProperties), margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{truncAddr(w.address)}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>{w.chain} · {w.typology}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <StatusChip risk={w.risk} size="sm" />
                <span style={{ fontSize: 12, fontWeight: 600, color: RISK_COLOR[w.risk], width: 24, textAlign: 'right' }}>{w.score}</span>
              </div>
            </div>
          ))}
        </DashWidget>
      </div>

      {/* Row 3 — 3-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        <DashWidget title="Cases Aging" action={{ label: 'View cases', onClick: () => navigate('/cases') }}>
          {AGING_CASES.map((c) => {
            const borderColor = c.days >= 5 ? RISK_COLOR.Critical : c.days >= 4 ? RISK_COLOR.High : RISK_COLOR.Medium;
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px 11px 16px', borderBottom: TABLE.row.borderBottom, borderLeft: `3px solid ${borderColor}`, cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = TABLE.row.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'none'; }}
              >
                <span style={{ ...(TABLE.cell.monoId as React.CSSProperties), flexShrink: 0 }}>{c.id}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.typology}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <StatusChip risk={c.risk} size="sm" />
                  <Clock size={10} style={{ color: borderColor }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: borderColor }}>{c.days}d idle</span>
                </div>
              </div>
            );
          })}
        </DashWidget>

        <DashWidget title="My Recent Activity">
          {ANALYST_ACTIVITY.map((a, i) => (
            <ActivityRow key={i} text={a.action} when={a.when} isLast={i === ANALYST_ACTIVITY.length - 1} dotColor={i === 0 ? '#93C5FD' : '#D1D5DB'} />
          ))}
        </DashWidget>

        <DashWidget title="My Cases by Risk">
          <RiskBars
            riskCounts={riskCounts}
            maxRisk={maxRisk}
            footer={`${myCases.length} total cases assigned to me`}
          />
        </DashWidget>
      </div>
    </>
  );
}

// ── Lead widgets ──────────────────────────────────────────────────────────────
interface LeadWidgetsProps {
  navigate: NavigateFunction;
  leadBase: Case[];
  pendingCases: Case[];
  riskCounts: { level: string; count: number; color: string }[];
  maxRisk: number;
}
function LeadWidgets({ navigate, leadBase, pendingCases, riskCounts, maxRisk }: LeadWidgetsProps) {
  return (
    <>
      {/* Row 2 — 5:4:3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 4fr 3fr', gap: 16 }}>

        <DashWidget
          title="Approval Queue"
          action={{ label: 'View all', onClick: () => navigate('/cases') }}
          minHeight={180}
        >
          {pendingCases.length === 0 ? (
            <EmptyState message="Queue is clear" sub="No pending submissions" />
          ) : (
            pendingCases.map((c) => {
              const isUrgent    = c.riskLevel === 'Critical';
              const borderColor = isUrgent ? RISK_COLOR.Critical : '#F59E0B';
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/cases/${c.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px 11px 16px', borderBottom: TABLE.row.borderBottom, borderLeft: `3px solid ${borderColor}`, cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = TABLE.row.hoverBg; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'none'; }}
                >
                  <span style={{ ...(TABLE.cell.monoId as React.CSSProperties), flexShrink: 0 }}>{c.id}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.assignedAnalyst} · {c.typology}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <StatusChip risk={c.riskLevel} size="sm" />
                    <span style={{ fontSize: 11, color: '#B0B8C8' }}>{new Date(c.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </DashWidget>

        <DashWidget title="Analyst Workload" action={{ label: 'View cases', onClick: () => navigate('/cases') }}>
          {TEAM_WORKLOAD.map((m, i) => {
            const total = m.open + m.pending + m.returned;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: TABLE.row.borderBottom }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${m.color}26`, border: `1.5px solid ${m.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: m.color }}>{m.initials}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                    <span style={{ fontSize: 10, color: '#9CA3AF', flexShrink: 0, marginLeft: 8 }}>{total}</span>
                  </div>
                  <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', background: '#F3F4F6' }}>
                    {m.open     > 0 && <div style={{ flex: m.open,     background: '#93C5FD' }} />}
                    {m.pending  > 0 && <div style={{ flex: m.pending,  background: '#FCD34D' }} />}
                    {m.returned > 0 && <div style={{ flex: m.returned, background: '#FCA5A5' }} />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: '#93C5FD' }}>{m.open} open</span>
                    {m.pending  > 0 && <span style={{ fontSize: 10, color: '#F59E0B' }}>{m.pending} pending</span>}
                    {m.returned > 0 && <span style={{ fontSize: 10, color: '#EF4444' }}>{m.returned} returned</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </DashWidget>

        <DashWidget title="Risk Distribution">
          <RiskBars
            riskCounts={riskCounts}
            maxRisk={maxRisk}
            footer={`${leadBase.length} total org cases`}
          />
        </DashWidget>
      </div>

      {/* Row 3 — 4-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>

        <DashWidget title="Overdue / Idle Cases" action={{ label: 'View cases', onClick: () => navigate('/cases') }}>
          {AGING_CASES.map((c) => {
            const borderColor = c.days >= 6 ? RISK_COLOR.Critical : c.days >= 5 ? RISK_COLOR.High : '#F59E0B';
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px 11px 16px', borderBottom: TABLE.row.borderBottom, borderLeft: `3px solid ${borderColor}`, cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = TABLE.row.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'none'; }}
              >
                <span style={{ ...(TABLE.cell.monoId as React.CSSProperties), flexShrink: 0 }}>{c.id}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.typology}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                  <StatusChip risk={c.risk} size="sm" />
                  <Clock size={9} style={{ color: borderColor }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: borderColor }}>{c.days}d idle</span>
                </div>
              </div>
            );
          })}
        </DashWidget>

        <DashWidget title="Team Activity">
          {TEAM_ACTIVITY.map((a, i) => (
            <ActivityRow
              key={i}
              text={<><span style={{ fontWeight: 600 }}>{a.actor}</span> {a.action}</>}
              when={a.when}
              isLast={i === TEAM_ACTIVITY.length - 1}
              dotColor={i === 0 ? '#C6FF00' : '#D1D5DB'}
            />
          ))}
        </DashWidget>

        <DashWidget title="Recently Returned" action={{ label: 'View cases', onClick: () => navigate('/cases') }}>
          {RECENTLY_RETURNED.map((r) => (
            <div
              key={r.id}
              onClick={() => navigate(`/cases/${r.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px 11px 16px', borderBottom: TABLE.row.borderBottom, borderLeft: `3px solid ${RISK_COLOR.Critical}`, cursor: 'pointer', transition: 'background 0.12s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = TABLE.row.hoverBg; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'none'; }}
            >
              <AlertTriangle size={11} style={{ color: '#EF4444', flexShrink: 0 }} />
              <span style={{ ...(TABLE.cell.monoId as React.CSSProperties), flexShrink: 0 }}>{r.id}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</span>
              <span style={{ fontSize: 11, color: '#B0B8C8', flexShrink: 0 }}>{r.when}</span>
            </div>
          ))}
          <div style={{ marginTop: 'auto', padding: '10px 20px', borderTop: TABLE.row.borderBottom, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={11} style={{ color: '#D1D5DB' }} />
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>No more returns this week</p>
          </div>
        </DashWidget>

        <DashWidget title="Case Velocity">
          <div style={{ padding: '16px 20px 0', flex: 1 }}>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 14px' }}>Cases closed — last 7 days</p>
            <div>
              {CASE_VELOCITY.map(({ day, count }) => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#9CA3AF', width: 28, flexShrink: 0 }}>{day}</span>
                  <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 999, height: 8 }}>
                    <div style={{ height: 8, borderRadius: 999, background: '#A5B4FC', width: count === 0 ? 3 : `${(count / 6) * 100}%`, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#6B7280', width: 14, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 'auto', padding: '10px 20px', borderTop: TABLE.row.borderBottom, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={11} style={{ color: '#8B5CF6' }} />
            <span style={{ fontSize: 11, color: '#8B5CF6', fontWeight: 600 }}>21 cases closed this week</span>
          </div>
        </DashWidget>
      </div>
    </>
  );
}

// ── Admin widgets ─────────────────────────────────────────────────────────────
interface AdminWidgetsProps { navigate: NavigateFunction; allCasesCount: number; }
function AdminWidgets({ navigate, allCasesCount }: AdminWidgetsProps) {
  return (
    <>
      {/* Row 2 — 8:4 */}
      <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 16 }}>

        <DashWidget title="Org Audit Trail" action={{ label: 'Full trail', onClick: () => navigate('/admin') }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 5fr 2fr 2fr', padding: '8px 20px', background: TABLE.bg, borderBottom: TABLE.row.borderBottom }}>
            {['User', 'Action', 'Role', 'Time'].map((h, i) => (
              <span key={h} style={{ ...(TABLE.header as React.CSSProperties), textAlign: i === 3 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
          {AUDIT_LOG.map((log, i) => (
            <div
              key={i}
              style={{ display: 'grid', gridTemplateColumns: '3fr 5fr 2fr 2fr', alignItems: 'center', padding: '11px 20px', borderBottom: TABLE.row.borderBottom, transition: 'background 0.12s', cursor: 'default' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = TABLE.row.hoverBg; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: AUDIT_DOT[log.type] ?? '#9CA3AF', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.actor}</span>
              </div>
              <span style={{ fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{log.action}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{log.role}</span>
              <span style={{ fontSize: 11, color: '#B0B8C8', textAlign: 'right' }}>{log.when}</span>
            </div>
          ))}
        </DashWidget>

        <DashWidget title="Compliance KPIs">
          <div style={{ padding: '20px 20px 0', flex: 1 }}>
            {COMPLIANCE_KPIS.map(({ label, value, pct, color }) => (
              <div key={label} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
                </div>
                <div style={{ background: '#F3F4F6', borderRadius: 999, height: 8 }}>
                  <div style={{ height: 8, borderRadius: 999, background: color, width: `${pct}%`, transition: 'width 0.3s' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', padding: '10px 20px', borderTop: TABLE.row.borderBottom, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={11} style={{ color: '#D1D5DB' }} />
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>{allCasesCount} total cases org-wide</span>
          </div>
        </DashWidget>
      </div>

      {/* Row 3 — Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {ADMIN_QUICK_ACTIONS.map(({ Icon, label, desc, color, bg, border, navState }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate('/admin', { state: navState })}
            style={{ background: SURFACE.panel.bg, border: SURFACE.panel.border, borderRadius: SURFACE.panel.borderRadius, boxShadow: SURFACE.panel.shadow, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', cursor: 'pointer', transition: 'box-shadow 0.15s', width: '100%' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = SURFACE.panel.shadow; }}
          >
            <div style={{ width: 42, height: 42, borderRadius: RADIUS.md, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 3px' }}>{label}</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.45, margin: 0 }}>{desc}</p>
            </div>
            <ChevronRight size={14} style={{ color: '#D1D5DB', flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { isAnalyst, isLead, isAdmin } = useAuth();
  const { stats, myCases, leadBase } = useCaseStats();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [barQuery, setBarQuery] = useState('');

  interface DashStatCard { label: string; value: number; accent: string; status?: string; risk?: string; myFilter?: boolean; allCard?: boolean }
  const analystStatCards: DashStatCard[] = [
    { label: 'All Cases',         value: stats.allCases,               accent: '#003C7E', allCard: true              },
    { label: 'My Open Cases',     value: stats.myOpen          ?? 0,   accent: '#3B82F6', status: 'open'             },
    { label: 'Pending Approval',  value: stats.pendingApproval ?? 0,   accent: '#F59E0B', status: 'pending-approval' },
    { label: 'Due (SLA)',         value: stats.due             ?? 0,   accent: '#DC2626', status: 'due'              },
    { label: 'Returned to Me',    value: stats.returned        ?? 0,   accent: '#EF4444', status: 'returned'         },
    { label: 'Closed This Month', value: stats.closedThisMonth ?? 0,   accent: '#9CA3AF', status: 'closed'           },
  ];
  const leadStatCards: DashStatCard[] = [
    { label: 'All Cases',         value: stats.allCases,               accent: '#003C7E', allCard: true              },
    { label: 'Total Open Cases',  value: stats.totalOpen       ?? 0,   accent: '#3B82F6', status: 'open'             },
    { label: 'Pending Approval',  value: stats.pendingApproval ?? 0,   accent: '#F59E0B', status: 'pending-approval' },
    { label: 'Due (SLA)',         value: stats.due             ?? 0,   accent: '#DC2626', status: 'due'              },
    { label: 'Returned Cases',    value: stats.returned        ?? 0,   accent: '#EF4444', status: 'returned'         },
    { label: 'Closed This Month', value: stats.teamClosed      ?? 0,   accent: '#22C55E', status: 'closed'           },
    { label: 'My Cases',          value: stats.myCases         ?? 0,   accent: COLORS.role.lead.color, myFilter: true },
  ];
  const adminStatCards: DashStatCard[] = [
    { label: 'All Cases',         value: stats.allCases  ?? 0, accent: '#003C7E', allCard: true      },
    { label: 'Open Cases',        value: stats.open      ?? 0, accent: '#3B82F6', status: 'open'     },
    { label: 'Critical Alerts',   value: stats.critical  ?? 0, accent: '#EF4444', risk: 'Critical'   },
    { label: 'Returned Cases',    value: stats.returned  ?? 0, accent: '#EF4444', status: 'returned' },
    { label: 'Closed This Month', value: stats.closed    ?? 0, accent: '#22C55E', status: 'closed'   },
    { label: 'My Cases',          value: stats.myCases   ?? 0, accent: COLORS.role.admin.color, myFilter: true },
  ];
  const statCards: DashStatCard[] = isLead ? leadStatCards : isAdmin ? adminStatCards : analystStatCards;

  const pendingCases = useMemo(
    () => (isLead ? leadBase : myCases).filter((c) => c.status === 'pending-approval'),
    [isLead, leadBase, myCases],
  );

  const attentionCases = useMemo(
    () => [
      ...myCases.filter((c) => c.status === 'returned'),
      ...myCases.filter((c) => c.riskLevel === 'Critical' && c.status !== 'closed' && c.status !== 'returned'),
    ],
    [myCases],
  );

  const riskBase = useMemo(
    () => (isLead ? mockCases : myCases),
    [isLead, myCases],
  );
  const riskCounts = useMemo(
    () => ['Critical', 'High', 'Medium', 'Low'].map((level) => ({
      level, count: riskBase.filter((c) => c.riskLevel === level).length, color: RISK_COLOR[level],
    })),
    [riskBase],
  );
  const maxRisk = useMemo(() => Math.max(...riskCounts.map((r) => r.count), 1), [riskCounts]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: SURFACE.frame.bg, padding: SURFACE.frame.padding, gap: SURFACE.frame.padding, boxSizing: 'border-box' }}>
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: SURFACE.frame.padding, overflow: 'hidden' }}>

        {/* Top search bar */}
        <div style={{ flexShrink: 0, height: 60, borderRadius: RADIUS.lg, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 8px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: RADIUS.lg }}>
            <img src={mascot} alt="" style={{ position: 'absolute', right: -77, bottom: -164, height: 384, width: 'auto', objectFit: 'contain', objectPosition: 'bottom right', pointerEvents: 'none', zIndex: 1, WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 72%, transparent 100%)', maskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 72%, transparent 100%)' }} />
          </div>
          <div style={{ width: '100%', maxWidth: 740, background: '#0A1528', borderRadius: 9999, height: 44, position: 'relative', zIndex: 2 }}>
            <SearchBar
              variant="nav"
              pill
              placeholder="Search wallet address..."
              initialValue={barQuery}
              onValueChange={setBarQuery}
              onSearch={(q) => { setBarQuery(''); navigate(`/search?q=${encodeURIComponent(q)}`); }}
            />
          </div>
        </div>

        <main style={{ flex: 1, overflow: 'hidden', background: SURFACE.content.bg, borderRadius: SURFACE.content.borderRadius, boxShadow: SURFACE.content.shadow, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flexShrink: 0 }}>
            <CaseHeader title="Dashboard" showStatusRow={false} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, background: SURFACE.content.bodyBg, padding: SURFACE.content.padding, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${statCards.length}, 1fr)`, gap: 8 }}>
                {statCards.map(({ label, value, accent, status, risk, myFilter: isMy, allCard }) => (
                  <StatCard
                    key={label}
                    label={label}
                    value={value}
                    accent={accent}
                    onClick={() => {
                      if (isMy)     navigate('/cases?my=true');
                      else if (allCard) navigate('/cases');
                      else if (status)  navigate(`/cases?status=${status}`);
                      else if (risk)    navigate(`/cases?risk=${risk}`);
                      else navigate('/cases');
                    }}
                    compact
                  />
                ))}
              </div>

              {isAnalyst && (
                <AnalystWidgets
                  navigate={navigate}
                  myCases={myCases}
                  attentionCases={attentionCases}
                  riskCounts={riskCounts}
                  maxRisk={maxRisk}
                />
              )}
              {isLead && (
                <LeadWidgets
                  navigate={navigate}
                  leadBase={leadBase}
                  pendingCases={pendingCases}
                  riskCounts={riskCounts}
                  maxRisk={maxRisk}
                />
              )}
              {isAdmin && (
                <AdminWidgets
                  navigate={navigate}
                  allCasesCount={stats.allCases}
                />
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
