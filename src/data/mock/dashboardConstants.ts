// constants.ts - Risk colors, truncation utility, and other shared constants

export const RISK_COLOR = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#F59E0B',
  Low: '#22C55E',
} as const;

export const truncAddr = (a: string) => {
  const start = a.slice(0, 6);
  const end = a.slice(a.length - 4);
  return `${start}...${end}`;
};

export const AUDIT_DOT = {
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  grey: '#9CA3AF',
} as const;

// Mock data
export const RECENT_WALLETS = [
  { address: '0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f', chain: 'Ethereum', risk: 'Critical', score: 94, typology: 'Mixer / Layering', when: '2h ago' },
  { address: '0xabc123def456789abc123def456789abc1', chain: 'Tron', risk: 'High', score: 78, typology: 'Structuring', when: '5h ago' },
  { address: '0x1234567890abcdef1234567890abcdef12', chain: 'Ethereum', risk: 'Medium', score: 55, typology: 'Sanctions Exposure', when: 'Yesterday' },
  { address: '0xdeadbeef1234567890abcdefdeadbeef12', chain: 'Bitcoin', risk: 'Low', score: 32, typology: 'Under Review', when: 'Yesterday' },
] as const;

export const ANALYST_ACTIVITY = [
  { action: 'Submitted CASE-006 for approval', when: '1h ago' },
  { action: 'Ran AI analysis on 0x7a3d...2e3f', when: '2h ago' },
  { action: 'Updated notes on CASE-2026-0011', when: '3h ago' },
  { action: 'Generated report for CASE-005', when: 'Yesterday' },
  { action: 'Opened CASE-008 investigation', when: 'Yesterday' },
] as const;

export const AGING_CASES = [
  { id: 'CASE-003', risk: 'High', days: 7, typology: 'Layering' },
  { id: 'CASE-009', risk: 'Medium', days: 5, typology: 'Structuring' },
  { id: 'CASE-011', risk: 'Critical', days: 4, typology: 'Sanctions Evasion' },
  { id: 'CASE-012', risk: 'Low', days: 3, typology: 'Mixing' },
] as const;

export const TEAM_WORKLOAD = [
  { name: 'Lily Bennett', open: 4, pending: 2, returned: 1, initials: 'LB', color: '#93C5FD' },
  { name: 'Marcus Webb', open: 3, pending: 1, returned: 0, initials: 'MW', color: '#6EE7B7' },
  { name: 'Priya Sharma', open: 5, pending: 0, returned: 1, initials: 'PS', color: '#FCA5A5' },
  { name: 'Jordan Reyes', open: 2, pending: 3, returned: 0, initials: 'JR', color: '#C4B5FD' },
] as const;

export const TEAM_ACTIVITY = [
  { actor: 'Lily Bennett', action: 'submitted CASE-006 for approval', when: '30m ago' },
  { actor: 'Marcus Webb', action: 'opened CASE-014 investigation', when: '1h ago' },
  { actor: 'Priya Sharma', action: 'ran AI analysis on 0x1a2b...3c4d', when: '2h ago' },
  { actor: 'Jordan Reyes', action: 'updated notes on CASE-015', when: '3h ago' },
  { actor: 'Lily Bennett', action: 'submitted CASE-007 for approval', when: 'Yesterday' },
] as const;

export const RECENTLY_RETURNED = [
  { id: 'CASE-004', analyst: 'Lily Bennett', reason: 'Insufficient evidence', when: '1h ago' },
  { id: 'CASE-012', analyst: 'Priya Sharma', reason: 'Missing SAR narrative', when: 'Yesterday' },
  { id: 'CASE-016', analyst: 'Jordan Reyes', reason: 'Chain tracing incomplete', when: '2d ago' },
] as const;

export const CASE_VELOCITY = [
  { day: 'Mon', count: 3 },
  { day: 'Tue', count: 5 },
  { day: 'Wed', count: 2 },
  { day: 'Thu', count: 6 },
  { day: 'Fri', count: 4 },
  { day: 'Sat', count: 1 },
  { day: 'Sun', count: 0 },
] as const;

export const AUDIT_LOG = [
  { actor: 'Rachel Scott', role: 'Lead', action: 'approved CASE-006', when: '20m ago', type: 'green' },
  { actor: 'Daniel Cooper', role: 'Admin', action: 'invited Nina Torres (analyst)', when: '1h ago', type: 'purple' },
  { actor: 'Lily Bennett', role: 'Analyst', action: 'submitted CASE-013 for approval', when: '2h ago', type: 'amber' },
  { actor: 'Rachel Scott', role: 'Lead', action: 'returned CASE-012 with notes', when: '3h ago', type: 'red' },
  { actor: 'System', role: '—', action: 'AI analysis completed for 0x9c1d...4d', when: '4h ago', type: 'blue' },
  { actor: 'Daniel Cooper', role: 'Admin', action: 'deactivated Jordan Reyes', when: 'Yesterday', type: 'purple' },
  { actor: 'Sam Okafor', role: 'Lead', action: 'assigned Priya Sharma to CASE-015', when: 'Yesterday', type: 'amber' },
  { actor: 'Daniel Cooper', role: 'Admin', action: 'exported Q1 compliance report', when: 'Yesterday', type: 'grey' },
] as const;

export const COMPLIANCE_KPIS = [
  { label: 'SLA Met (≤5d)', value: '89%', pct: 89, color: '#22C55E' },
  { label: 'SAR Filing Rate', value: '76%', pct: 76, color: '#3B82F6' },
  { label: 'AI Assist Rate', value: '94%', pct: 94, color: '#8B5CF6' },
  { label: 'Avg. Resolution', value: '4.2d', pct: 58, color: '#9CA3AF' },
] as const;

export const ADMIN_QUICK_ACTIONS = [
  {
    label: 'Invite User',
    desc: 'Add a new analyst or lead',
    color: '#6366F1',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    navState: { openInvite: true },
  },
  {
    label: 'Manage Users',
    desc: 'Edit roles, reassign cases',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    navState: { tab: 'Manage Users' },
  },
  {
    label: 'System Config',
    desc: 'Escalation rules & notifications',
    color: '#374151',
    bg: '#F9FAFB',
    border: '#E5E7EB',
    navState: { tab: 'Configuration' },
  },
] as const;


