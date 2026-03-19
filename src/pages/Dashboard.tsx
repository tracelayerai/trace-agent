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
import { mockCases } from '@/services/casesService';
import { useCaseStats } from '@/hooks/useCaseStats';
import { cn } from '@/lib/utils';

type Case = (typeof mockCases)[number];

// ── Static mock data ───────────────────────────────────────────────────────────

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

// ── DashWidget ──────────────────────────────────────────────────────────────────
interface DashWidgetProps {
  title: string;
  action?: { label: string; onClick: () => void } | null;
  children: ReactNode;
  minHeight?: number;
}
function DashWidget({ title, action, children, minHeight }: DashWidgetProps) {
  return (
    <div
      className="bg-white rounded-[12px] border border-[#ECEEF2] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden"
      style={minHeight ? { minHeight } : undefined}
    >
      <div className="flex items-center justify-between px-[20px] py-[12px] border-b border-[#F3F4F6] shrink-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#9CA3AF] m-0">{title}</p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center text-[11px] font-semibold text-[#9CA3AF] bg-transparent border border-[#E5E7EB] rounded-full px-[10px] py-[3px] cursor-pointer font-[inherit] outline-none shrink-0 leading-none hover:bg-[rgba(123,144,170,0.10)] hover:text-[#6B7280] transition-colors duration-150"
          >
            {action.label}
          </button>
        )}
      </div>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────────
interface EmptyStateProps { message: string; sub?: string; }
function EmptyState({ message, sub }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-[24px] py-[32px] gap-[8px] text-center">
      <div className="w-[32px] h-[32px] rounded-full bg-[#F0FDF4] flex items-center justify-center">
        <CheckCircle size={16} className="text-[#22C55E]" />
      </div>
      <p className="text-[13px] font-semibold text-[#6B7280] m-0">{message}</p>
      {sub && <p className="text-[12px] text-[#9CA3AF] m-0">{sub}</p>}
    </div>
  );
}

// ── Activity row ────────────────────────────────────────────────────────────────
interface ActivityRowProps { text: ReactNode; when: string; dotColor?: string; isLast?: boolean; }
function ActivityRow({ text, when, dotColor = '#D1D5DB', isLast }: ActivityRowProps) {
  return (
    <div className={cn('flex items-start gap-[12px] px-[20px] py-[12px]', !isLast && 'border-b border-[#F3F4F6]')}>
      <div className="w-[7px] h-[7px] rounded-full shrink-0 mt-[4px]" style={{ background: dotColor }} />
      <p className="text-[12px] text-[#4B5563] m-0 flex-1 leading-relaxed">{text}</p>
      <span className="text-[11px] text-[#B0B8C8] shrink-0 pt-px">{when}</span>
    </div>
  );
}

// ── Metric bar ──────────────────────────────────────────────────────────────────
interface MetricBarProps { label: string; labelRight: ReactNode; pct: number; color: string; max?: number; }
function MetricBar({ label, labelRight, pct, color, max = 100 }: MetricBarProps) {
  const w = pct === 0 ? 3 : `${Math.max((pct / max) * 100, 6)}%`;
  return (
    <div className="flex items-center gap-[12px] mb-[14px]">
      <span className="text-[12px] font-semibold w-[60px] shrink-0" style={{ color }}>{label}</span>
      <div className="flex-1 bg-[#F3F4F6] rounded-full h-[8px] overflow-hidden">
        <div className="h-[8px] rounded-full transition-[width] duration-300" style={{ background: color, width: w }} />
      </div>
      <span className="text-[12px] text-[#6B7280] w-[28px] text-right shrink-0">{labelRight}</span>
    </div>
  );
}

// ── Risk bars sub-widget ────────────────────────────────────────────────────────
interface RiskBarsProps {
  riskCounts: { level: string; count: number; color: string }[];
  maxRisk: number;
  footer?: string;
}
function RiskBars({ riskCounts, maxRisk, footer }: RiskBarsProps) {
  return (
    <>
      <div className="px-[20px] pt-[16px] flex flex-col flex-1">
        <div>
          {riskCounts.map(({ level, count, color }) => (
            <MetricBar key={level} label={level} labelRight={count} pct={count} max={maxRisk} color={color} />
          ))}
        </div>
      </div>
      {footer && (
        <p className="text-[11px] text-[#9CA3AF] mt-auto px-[20px] py-[10px] border-t border-[#F3F4F6] m-0">{footer}</p>
      )}
    </>
  );
}

// ── Analyst widgets ─────────────────────────────────────────────────────────────
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
      <div className="grid gap-[16px] grid-cols-[5fr_7fr]">

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
                  className="flex items-center gap-[10px] py-[11px] pr-[20px] pl-[16px] border-b border-[#F3F4F6] border-l-[3px] cursor-pointer transition-colors duration-[120ms] hover:bg-[#F8F9FB]"
                  style={{ borderLeftColor: borderColor }}
                >
                  <span className="font-mono text-[13px] font-semibold text-[#2D3142] shrink-0">{c.id}</span>
                  <span className="text-[11px] text-[#9CA3AF] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{c.typology}</span>
                  <div className="flex items-center gap-[6px] shrink-0">
                    <StatusChip risk={c.riskLevel} size="sm" />
                    {isReturned && <StatusChip status="returned" size="sm" />}
                    <ChevronRight size={12} className="text-[#D1D5DB]" />
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
              className="flex items-center gap-[12px] px-[20px] py-[12px] border-b border-[#F3F4F6] cursor-pointer transition-colors duration-[120ms] hover:bg-[#F8F9FB]"
            >
              <Search size={12} className="text-[#D1D5DB] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[12px] text-[#4A5568] m-0 overflow-hidden text-ellipsis whitespace-nowrap">{truncAddr(w.address)}</p>
                <p className="text-[11px] text-[#9CA3AF] m-0 mt-[2px]">{w.chain} · {w.typology}</p>
              </div>
              <div className="flex items-center gap-[8px] shrink-0">
                <StatusChip risk={w.risk} size="sm" />
                <span className="text-[12px] font-semibold font-mono w-[24px] text-right" style={{ color: RISK_COLOR[w.risk] }}>{w.score}</span>
              </div>
            </div>
          ))}
        </DashWidget>
      </div>

      {/* Row 3 — 3-col */}
      <div className="grid grid-cols-3 gap-[16px]">

        <DashWidget title="Cases Aging" action={{ label: 'View cases', onClick: () => navigate('/cases') }}>
          {AGING_CASES.map((c) => {
            const borderColor = c.days >= 5 ? RISK_COLOR.Critical : c.days >= 4 ? RISK_COLOR.High : RISK_COLOR.Medium;
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                className="flex items-center gap-[10px] py-[11px] pr-[20px] pl-[16px] border-b border-[#F3F4F6] border-l-[3px] cursor-pointer transition-colors duration-[120ms] hover:bg-[#F8F9FB]"
                style={{ borderLeftColor: borderColor }}
              >
                <span className="font-mono text-[13px] font-semibold text-[#2D3142] shrink-0">{c.id}</span>
                <span className="text-[11px] text-[#9CA3AF] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{c.typology}</span>
                <div className="flex items-center gap-[6px] shrink-0">
                  <StatusChip risk={c.risk} size="sm" />
                  <Clock size={10} style={{ color: borderColor }} />
                  <span className="text-[11px] font-semibold" style={{ color: borderColor }}>{c.days}d idle</span>
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

// ── Lead widgets ────────────────────────────────────────────────────────────────
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
      <div className="grid gap-[16px] grid-cols-[5fr_4fr_3fr]">

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
                  className="flex items-center gap-[10px] py-[11px] pr-[20px] pl-[16px] border-b border-[#F3F4F6] border-l-[3px] cursor-pointer transition-colors duration-[120ms] hover:bg-[#F8F9FB]"
                  style={{ borderLeftColor: borderColor }}
                >
                  <span className="font-mono text-[13px] font-semibold text-[#2D3142] shrink-0">{c.id}</span>
                  <span className="text-[11px] text-[#9CA3AF] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{c.assignedAnalyst} · {c.typology}</span>
                  <div className="flex items-center gap-[6px] shrink-0">
                    <StatusChip risk={c.riskLevel} size="sm" />
                    <span className="text-[11px] text-[#B0B8C8]">{new Date(c.lastUpdated).toLocaleDateString()}</span>
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
              <div key={i} className="flex items-center gap-[12px] px-[20px] py-[12px] border-b border-[#F3F4F6]">
                <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0" style={{ background: `${m.color}26`, border: `1.5px solid ${m.color}55` }}>
                  <span className="text-[10px] font-bold" style={{ color: m.color }}>{m.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-[5px]">
                    <span className="text-[12px] font-semibold text-[#374151] overflow-hidden text-ellipsis whitespace-nowrap">{m.name}</span>
                    <span className="text-[10px] text-[#9CA3AF] shrink-0 ml-[8px]">{total}</span>
                  </div>
                  <div className="flex h-[8px] rounded-full overflow-hidden bg-[#F3F4F6]">
                    {m.open     > 0 && <div style={{ flex: m.open,     background: '#93C5FD' }} />}
                    {m.pending  > 0 && <div style={{ flex: m.pending,  background: '#FCD34D' }} />}
                    {m.returned > 0 && <div style={{ flex: m.returned, background: '#FCA5A5' }} />}
                  </div>
                  <div className="flex items-center gap-[10px] mt-[4px]">
                    <span className="text-[10px] text-[#93C5FD]">{m.open} open</span>
                    {m.pending  > 0 && <span className="text-[10px] text-[#F59E0B]">{m.pending} pending</span>}
                    {m.returned > 0 && <span className="text-[10px] text-[#EF4444]">{m.returned} returned</span>}
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
      <div className="grid grid-cols-4 gap-[16px]">

        <DashWidget title="Overdue / Idle Cases" action={{ label: 'View cases', onClick: () => navigate('/cases') }}>
          {AGING_CASES.map((c) => {
            const borderColor = c.days >= 6 ? RISK_COLOR.Critical : c.days >= 5 ? RISK_COLOR.High : '#F59E0B';
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/cases/${c.id}`)}
                className="flex items-center gap-[10px] py-[11px] pr-[20px] pl-[16px] border-b border-[#F3F4F6] border-l-[3px] cursor-pointer transition-colors duration-[120ms] hover:bg-[#F8F9FB]"
                style={{ borderLeftColor: borderColor }}
              >
                <span className="font-mono text-[13px] font-semibold text-[#2D3142] shrink-0">{c.id}</span>
                <span className="text-[11px] text-[#9CA3AF] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{c.typology}</span>
                <div className="flex items-center gap-[5px] shrink-0">
                  <StatusChip risk={c.risk} size="sm" />
                  <Clock size={9} style={{ color: borderColor }} />
                  <span className="text-[11px] font-semibold" style={{ color: borderColor }}>{c.days}d idle</span>
                </div>
              </div>
            );
          })}
        </DashWidget>

        <DashWidget title="Team Activity">
          {TEAM_ACTIVITY.map((a, i) => (
            <ActivityRow
              key={i}
              text={<><span className="font-semibold">{a.actor}</span> {a.action}</>}
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
              className="flex items-center gap-[10px] py-[11px] pr-[20px] pl-[16px] border-b border-[#F3F4F6] border-l-[3px] border-l-[#EF4444] cursor-pointer transition-colors duration-[120ms] hover:bg-[#F8F9FB]"
            >
              <AlertTriangle size={11} className="text-[#EF4444] shrink-0" />
              <span className="font-mono text-[13px] font-semibold text-[#2D3142] shrink-0">{r.id}</span>
              <span className="text-[11px] text-[#9CA3AF] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{r.reason}</span>
              <span className="text-[11px] text-[#B0B8C8] shrink-0">{r.when}</span>
            </div>
          ))}
          <div className="mt-auto px-[20px] py-[10px] border-t border-[#F3F4F6] flex items-center gap-[6px]">
            <CheckCircle size={11} className="text-[#D1D5DB]" />
            <p className="text-[11px] text-[#9CA3AF] m-0">No more returns this week</p>
          </div>
        </DashWidget>

        <DashWidget title="Case Velocity">
          <div className="px-[20px] pt-[16px] flex-1">
            <p className="text-[11px] text-[#9CA3AF] m-0 mb-[14px]">Cases closed — last 7 days</p>
            <div>
              {CASE_VELOCITY.map(({ day, count }) => (
                <div key={day} className="flex items-center gap-[10px] mb-[8px]">
                  <span className="text-[11px] text-[#9CA3AF] w-[28px] shrink-0">{day}</span>
                  <div className="flex-1 bg-[#F3F4F6] rounded-full h-[8px]">
                    <div className="h-[8px] rounded-full bg-[#A5B4FC] transition-[width] duration-300" style={{ width: count === 0 ? 3 : `${(count / 6) * 100}%` }} />
                  </div>
                  <span className="text-[11px] text-[#6B7280] w-[14px] text-right shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-auto px-[20px] py-[10px] border-t border-[#F3F4F6] flex items-center gap-[6px]">
            <TrendingUp size={11} className="text-[#8B5CF6]" />
            <span className="text-[11px] text-[#8B5CF6] font-semibold">21 cases closed this week</span>
          </div>
        </DashWidget>
      </div>
    </>
  );
}

// ── Admin widgets ───────────────────────────────────────────────────────────────
interface AdminWidgetsProps { navigate: NavigateFunction; allCasesCount: number; }
function AdminWidgets({ navigate, allCasesCount }: AdminWidgetsProps) {
  return (
    <>
      {/* Row 2 — 8:4 */}
      <div className="grid gap-[16px] grid-cols-[8fr_4fr]">

        <DashWidget title="Org Audit Trail" action={{ label: 'Full trail', onClick: () => navigate('/admin') }}>
          {/* Column headers */}
          <div className="grid items-center px-[20px] py-[8px] bg-[#FAFBFC] border-b border-[#F3F4F6] grid-cols-[3fr_5fr_2fr_2fr]">
            {['User', 'Action', 'Role', 'Time'].map((h, i) => (
              <span key={h} className={cn('text-[11px] font-medium uppercase tracking-[0.06em] text-[#717A8C]', i === 3 ? 'text-right' : 'text-left')}>{h}</span>
            ))}
          </div>
          {AUDIT_LOG.map((log, i) => (
            <div
              key={i}
              className="grid items-center px-[20px] py-[11px] border-b border-[#F3F4F6] transition-colors duration-[120ms] cursor-default hover:bg-[#F8F9FB] grid-cols-[3fr_5fr_2fr_2fr]"
            >
              <div className="flex items-center gap-[8px] min-w-0">
                <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: AUDIT_DOT[log.type] ?? '#9CA3AF' }} />
                <span className="text-[12px] font-semibold text-[#374151] overflow-hidden text-ellipsis whitespace-nowrap">{log.actor}</span>
              </div>
              <span className="text-[12px] text-[#6B7280] overflow-hidden text-ellipsis whitespace-nowrap pr-[8px]">{log.action}</span>
              <span className="text-[11px] text-[#9CA3AF]">{log.role}</span>
              <span className="text-[11px] text-[#B0B8C8] text-right">{log.when}</span>
            </div>
          ))}
        </DashWidget>

        <DashWidget title="Compliance KPIs">
          <div className="px-[20px] pt-[20px] flex-1">
            {COMPLIANCE_KPIS.map(({ label, value, pct, color }) => (
              <div key={label} className="mb-[20px]">
                <div className="flex items-center justify-between mb-[7px]">
                  <span className="text-[12px] text-[#6B7280]">{label}</span>
                  <span className="text-[13px] font-bold" style={{ color }}>{value}</span>
                </div>
                <div className="bg-[#F3F4F6] rounded-full h-[8px]">
                  <div className="h-[8px] rounded-full transition-[width] duration-300" style={{ background: color, width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto px-[20px] py-[10px] border-t border-[#F3F4F6] flex items-center gap-[6px]">
            <Activity size={11} className="text-[#D1D5DB]" />
            <span className="text-[11px] text-[#9CA3AF]">{allCasesCount} total cases org-wide</span>
          </div>
        </DashWidget>
      </div>

      {/* Row 3 — Quick Actions */}
      <div className="grid grid-cols-3 gap-[16px]">
        {ADMIN_QUICK_ACTIONS.map(({ Icon, label, desc, color, bg, border, navState }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate('/admin', { state: navState })}
            className="bg-white border border-[#ECEEF2] rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] px-[24px] py-[20px] flex items-center gap-[16px] text-left cursor-pointer transition-shadow duration-150 w-full hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
          >
            <div className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: bg, border: `1px solid ${border}` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#111827] m-0 mb-[3px]">{label}</p>
              <p className="text-[12px] text-[#9CA3AF] leading-[1.45] m-0">{desc}</p>
            </div>
            <ChevronRight size={14} className="text-[#D1D5DB] shrink-0" />
          </button>
        ))}
      </div>
    </>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────────
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
    { label: 'My Cases',          value: stats.myCases         ?? 0,   accent: '#60A5FA', myFilter: true             },
  ];
  const adminStatCards: DashStatCard[] = [
    { label: 'All Cases',         value: stats.allCases  ?? 0, accent: '#003C7E', allCard: true      },
    { label: 'Open Cases',        value: stats.open      ?? 0, accent: '#3B82F6', status: 'open'     },
    { label: 'Critical Alerts',   value: stats.critical  ?? 0, accent: '#EF4444', risk: 'Critical'   },
    { label: 'Returned Cases',    value: stats.returned  ?? 0, accent: '#EF4444', status: 'returned' },
    { label: 'Closed This Month', value: stats.closed    ?? 0, accent: '#22C55E', status: 'closed'   },
    { label: 'My Cases',          value: stats.myCases   ?? 0, accent: '#A78BFA', myFilter: true     },
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
    <div
      className="flex h-screen overflow-hidden p-[8px] gap-[8px] box-border bg-[linear-gradient(160deg,#060C1A_0%,#0C1D3C_55%,#091630_100%)]"
    >
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div className="flex-1 flex flex-col gap-[8px] overflow-hidden">

        {/* Top search bar */}
        <div className="shrink-0 h-[60px] rounded-2xl flex items-center justify-start px-[8px] relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            <img src={mascot} alt="" className="absolute right-[-77px] bottom-[-164px] h-[384px] w-auto object-contain object-right-bottom pointer-events-none z-[1]" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 72%, transparent 100%)', maskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 72%, transparent 100%)' }} />
          </div>
          <div className="w-full max-w-[740px] bg-[#0A1528] rounded-full h-[44px] relative z-[2]">
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

        <main
          className="flex-1 overflow-hidden bg-white rounded-[12px] flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_2px_8px_rgba(0,0,0,0.03),inset_0_-2px_8px_rgba(0,0,0,0.02)]"
        >
          <div className="shrink-0">
            <CaseHeader title="Dashboard" showStatusRow={false} />
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col">
            <div
              className="flex-1 px-[32px] py-[24px] flex flex-col gap-[16px] bg-[linear-gradient(180deg,#F5F6FA_0%,#EAEBF0_60%,#E3E4EA_100%)]"
            >

              {/* Stat cards */}
              <div className="grid gap-[8px]" style={{ gridTemplateColumns: `repeat(${statCards.length}, 1fr)` }}>
                {statCards.map(({ label, value, accent, status, risk, myFilter: isMy, allCard }) => (
                  <StatCard
                    key={label}
                    label={label}
                    value={value}
                    accent={accent}
                    onClick={() => {
                      if (isMy)         navigate('/cases?my=true');
                      else if (allCard) navigate('/cases');
                      else if (status)  navigate(`/cases?status=${status}`);
                      else if (risk)    navigate(`/cases?risk=${risk}`);
                      else              navigate('/cases');
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
