import { useState, useEffect } from 'react';
import { UserPlus, Download, Filter, Search, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';
import { CaseHeader, Btn } from '@/components/core/CaseHeader';
import { Modal } from '@/components/core/Modal';
import { CustomSelect } from '@/components/core/CustomSelect';
import { FormField, FilterSearchInput } from '@/components/core/FormField';
import { Toast, useToast } from '@/components/core/Toast';
import Sidebar from '@/components/layout/Sidebar';
import { SURFACE, INPUT, TABLE, COLORS, EMPTY_STATE, ALERT, RADIUS, TYPOGRAPHY } from '@/tokens/designTokens';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Exact v2 mock data ────────────────────────────────────────────────────────
interface AdminUser {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  status: string;
  casesAssigned: number | null;
  lastActive: string;
}

const ADMIN_USERS: AdminUser[] = [
  { id: 'user-001',     name: 'James Analyst',  initials: 'JA', role: 'analyst', email: 'james@traceagent.com',   status: 'active',   casesAssigned: 7,    lastActive: 'Feb 27, 2026' },
  { id: 'user-002',     name: 'Sarah Chen',     initials: 'SC', role: 'lead',    email: 'sarah@traceagent.com',   status: 'active',   casesAssigned: 3,    lastActive: 'Feb 27, 2026' },
  { id: 'user-emp-001', name: 'Emma Wilson',    initials: 'EW', role: 'analyst', email: 'emma@traceagent.com',    status: 'active',   casesAssigned: 2,    lastActive: 'Feb 24, 2026' },
  { id: 'user-emp-002', name: 'Grace Lee',      initials: 'GL', role: 'analyst', email: 'grace@traceagent.com',   status: 'active',   casesAssigned: 1,    lastActive: 'Dec 15, 2025' },
  { id: 'user-emp-003', name: 'Michael Torres', initials: 'MT', role: 'analyst', email: 'michael@traceagent.com', status: 'inactive', casesAssigned: 0,    lastActive: 'Jan 10, 2026' },
  { id: 'user-003',     name: 'David Kim',      initials: 'DK', role: 'admin',   email: 'david@traceagent.com',   status: 'active',   casesAssigned: null, lastActive: 'Feb 27, 2026' },
  { id: 'user-inv-001', name: 'Nina Torres',    initials: 'NT', role: 'analyst', email: 'nina@traceagent.com',    status: 'pending',  casesAssigned: 0,    lastActive: '—' },
  { id: 'user-inv-002', name: 'Alex Bradford',  initials: 'AB', role: 'lead',    email: 'alex@traceagent.com',    status: 'pending',  casesAssigned: 0,    lastActive: '—' },
];

const AUDIT_ENTRIES = [
  { id: 'audit-01', timestamp: '2026-02-27 16:42', user: 'Sarah Chen',     role: 'Lead',    action: 'Case approved',              caseId: 'CASE-007',      details: 'Case approved — no violations found',                        tag: 'green'  },
  { id: 'audit-02', timestamp: '2026-02-27 15:42', user: 'Sarah Chen',     role: 'Lead',    action: 'Case returned',              caseId: 'CASE-006',      details: 'Returned — additional OFAC evidence needed',                 tag: 'red'    },
  { id: 'audit-03', timestamp: '2026-02-27 14:28', user: 'James Analyst',  role: 'Analyst', action: 'Note added',                 caseId: 'CASE-2026-0011',details: 'Bridge activity traced via Hop Protocol',                    tag: 'blue'   },
  { id: 'audit-04', timestamp: '2026-02-27 14:15', user: 'James Analyst',  role: 'Analyst', action: 'Note added',                 caseId: 'CASE-2026-0011',details: 'Sanctions match confirmed against OFAC list',                tag: 'blue'   },
  { id: 'audit-05', timestamp: '2026-02-27 14:05', user: 'James Analyst',  role: 'Analyst', action: 'Case opened',                caseId: 'CASE-2026-0011',details: 'New case — Critical risk, sanctions evasion',               tag: 'blue'   },
  { id: 'audit-06', timestamp: '2026-02-27 10:30', user: 'James Analyst',  role: 'Analyst', action: 'Case submitted for approval',caseId: 'CASE-004',      details: 'Submitted to Sarah Chen for review',                        tag: 'amber'  },
  { id: 'audit-07', timestamp: '2026-02-26 16:15', user: 'Emma Wilson',    role: 'Analyst', action: 'Case submitted for approval',caseId: 'CASE-005',      details: 'Submitted to Sarah Chen for review',                        tag: 'amber'  },
  { id: 'audit-08', timestamp: '2026-02-26 14:00', user: 'James Analyst',  role: 'Analyst', action: 'Status changed',             caseId: 'CASE-003',      details: 'Changed from Open to Under Review',                         tag: 'amber'  },
  { id: 'audit-09', timestamp: '2026-02-25 11:30', user: 'David Kim',      role: 'Admin',   action: 'Case reassigned',            caseId: 'CASE-002',      details: 'Analyst reassigned from Grace Lee to James Analyst',         tag: 'purple' },
  { id: 'audit-10', timestamp: '2026-02-24 09:15', user: 'David Kim',      role: 'Admin',   action: 'Lead assigned',              caseId: 'CASE-011',      details: 'Sarah Chen assigned as lead',                               tag: 'purple' },
  { id: 'audit-11', timestamp: '2026-02-22 14:45', user: 'David Kim',      role: 'Admin',   action: 'User deactivated',           caseId: '—',             details: 'Michael Torres deactivated — 0 cases reassigned',           tag: 'purple' },
  { id: 'audit-12', timestamp: '2026-02-20 10:00', user: 'Sarah Chen',     role: 'Lead',    action: 'Case returned',              caseId: 'CASE-008',      details: 'Returned — incomplete risk assessment',                     tag: 'red'    },
  { id: 'audit-13', timestamp: '2026-02-18 16:30', user: 'James Analyst',  role: 'Analyst', action: 'Report downloaded',          caseId: 'CASE-001',      details: 'Full case report exported as PDF',                          tag: 'grey'   },
  { id: 'audit-14', timestamp: '2026-02-15 08:45', user: 'David Kim',      role: 'Admin',   action: 'Login',                     caseId: '—',             details: 'Admin session started',                                     tag: 'grey'   },
  { id: 'audit-15', timestamp: '2026-02-10 09:00', user: 'James Analyst',  role: 'Analyst', action: 'Case opened',                caseId: 'CASE-001',      details: 'New case — Critical risk, sanctions evasion',               tag: 'blue'   },
];

const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  analyst: { bg: COLORS.role.analyst.bg, color: COLORS.role.analyst.color },
  lead:    { bg: COLORS.role.lead.bg,    color: COLORS.role.lead.color    },
  admin:   { bg: COLORS.role.admin.bg,   color: COLORS.role.admin.color   },
};

const ACTION_TAG: Record<string, { bg: string; color: string }> = {
  blue:   { bg: 'rgba(96,165,250,0.15)',  color: '#60A5FA' },
  amber:  { bg: 'rgba(251,191,36,0.15)',  color: '#FBBF24' },
  green:  { bg: 'rgba(34,197,94,0.15)',   color: '#22C55E' },
  red:    { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
  purple: { bg: 'rgba(167,139,250,0.15)',color: '#A78BFA' },
  grey:   { bg: 'rgba(156,163,175,0.12)', color: '#9CA3AF' },
};

const TH: React.CSSProperties = { padding: TABLE.density.relaxed.headerPadding, textAlign: 'left', fontSize: TABLE.header.fontSize, fontWeight: TABLE.header.fontWeight, color: TABLE.header.color, textTransform: TABLE.header.textTransform as React.CSSProperties['textTransform'], letterSpacing: TABLE.header.letterSpacing, borderBottom: TABLE.header.borderBottom, background: TABLE.header.bg };
const TD: React.CSSProperties = { padding: TABLE.density.relaxed.rowPadding, fontSize: TABLE.row.fontSize, color: TABLE.row.color, borderBottom: TABLE.row.borderBottom, verticalAlign: 'middle' };

// ── Light modal field tokens ────────────────────────────────────────────────
const LBL: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: COLORS.text.light, marginBottom: 6, display: 'block' };
const selStyle: React.CSSProperties = { width: '100%', background: INPUT.bg, border: INPUT.border, borderRadius: INPUT.borderRadius, padding: INPUT.padding, fontSize: 13, color: INPUT.color, outline: 'none', height: INPUT.height, boxShadow: INPUT.shadow, transition: INPUT.transition, boxSizing: 'border-box' };
const fieldEvents = {
  onMouseEnter: (e: React.MouseEvent<HTMLInputElement>) => Object.assign((e.currentTarget as HTMLInputElement).style, { border: INPUT.hover.border, boxShadow: INPUT.hover.shadow }),
  onMouseLeave: (e: React.MouseEvent<HTMLInputElement>) => Object.assign((e.currentTarget as HTMLInputElement).style, { border: INPUT.border, boxShadow: INPUT.shadow }),
  onFocus:      (e: React.FocusEvent<HTMLInputElement>) => Object.assign((e.currentTarget as HTMLInputElement).style, { border: INPUT.focus.border, boxShadow: INPUT.focus.shadow }),
  onBlur:       (e: React.FocusEvent<HTMLInputElement>) => Object.assign((e.currentTarget as HTMLInputElement).style, { border: INPUT.border, boxShadow: INPUT.shadow }),
};

interface EscalationRule { id: number; label: string; desc: string; active: boolean; }
const ESCALATION_RULES: EscalationRule[] = [
  { id: 1, label: 'Pending Approval Timeout', desc: 'Auto-escalate cases pending approval for more than 48 hours', active: true },
  { id: 2, label: 'Critical Case Alert',      desc: 'Notify lead when critical risk case is opened',              active: true },
  { id: 3, label: 'Auto-close Returned',      desc: 'Close returned cases after 30 days of inactivity',           active: false },
];

interface EmailNotif { id: string; label: string; active: boolean; }
const EMAIL_NOTIFS: EmailNotif[] = [
  { id: 'case-submitted',  label: 'Case submitted for approval', active: true  },
  { id: 'case-approved',   label: 'Case approved',               active: true  },
  { id: 'case-returned',   label: 'Case returned',               active: true  },
  { id: 'critical-flagged',label: 'Critical case flagged',       active: true  },
  { id: 'daily-digest',    label: 'Daily case digest',           active: false },
  { id: 'weekly-report',   label: 'Weekly compliance report',    active: false },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── All state declarations first ─────────────────────────────────────────
  const [sidebarExpanded,   setSidebarExpanded]   = useState(false);
  const [activeTab,         setActiveTab]          = useState('Manage Users');
  const [fromDashboard,     setFromDashboard]      = useState(false);
  const [users,             setUsers]              = useState<AdminUser[]>(ADMIN_USERS);
  const [userRoleFilter,    setUserRoleFilter]     = useState('All');
  const [userStatusFilter,  setUserStatusFilter]   = useState('All');
  const [userSearch,        setUserSearch]         = useState('');
  const [toastState, toast]                        = useToast();
  const [showAddUserModal,  setShowAddUserModal]   = useState(false);
  const [newUserName,       setNewUserName]        = useState('');
  const [newUserEmail,      setNewUserEmail]       = useState('');
  const [newUserRole,       setNewUserRole]        = useState('analyst');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateTarget,  setDeactivateTarget]  = useState<AdminUser | null>(null);
  const [reassignTarget,    setReassignTarget]     = useState('');
  const [showDeleteModal,   setShowDeleteModal]    = useState(false);
  const [deleteTarget,      setDeleteTarget]       = useState<AdminUser | null>(null);
  const [auditUserFilter,   setAuditUserFilter]    = useState('All');
  const [auditRoleFilter,   setAuditRoleFilter]    = useState('All');
  const [auditActionFilter, setAuditActionFilter]  = useState('All');
  const [auditCaseFilter,   setAuditCaseFilter]    = useState('');
  const [rules,             setRules]              = useState<EscalationRule[]>(ESCALATION_RULES);
  const [notifs,            setNotifs]             = useState<EmailNotif[]>(EMAIL_NOTIFS);

  // ── Deep-link from dashboard ─────────────────────────────────────────────
  useEffect(() => {
    const state = location.state as { tab?: string; openInvite?: boolean } | null;
    if (!state) return;
    if (state.tab)        setActiveTab(state.tab);
    if (state.openInvite) { setShowAddUserModal(true); setFromDashboard(true); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const closeInviteModal = () => {
    setShowAddUserModal(false);
    setNewUserName(''); setNewUserEmail(''); setNewUserRole('analyst');
    if (fromDashboard) { setFromDashboard(false); navigate('/dashboard'); }
  };

  const activeAnalysts = users.filter((u) => u.status === 'active' && u.role !== 'admin');

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const initials = newUserName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    setUsers(prev => [...prev, {
      id: `user-inv-${Date.now()}`, name: newUserName.trim(), initials,
      role: newUserRole, email: newUserEmail.trim(),
      status: 'pending', casesAssigned: 0, lastActive: '—',
    }]);
    toast(`Invite sent to ${newUserEmail.trim()}`);
    closeInviteModal();
  };

  const openDeactivate = (user: AdminUser) => {
    setDeactivateTarget(user);
    setReassignTarget('');
    setShowDeactivateModal(true);
  };

  const handleDeactivate = () => {
    if (!deactivateTarget) return;
    const openCases = deactivateTarget.casesAssigned || 0;
    const targetName = activeAnalysts.find((a) => a.id === reassignTarget)?.name || 'selected analyst';
    setUsers((prev) => prev.map((u) => u.id === deactivateTarget.id ? { ...u, status: 'inactive' } : u));
    toast(`User deactivated. ${openCases} case${openCases !== 1 ? 's' : ''} reassigned to ${targetName}`);
    setShowDeactivateModal(false);
    setDeactivateTarget(null);
  };

  const handleReactivate = (user: AdminUser) => {
    setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: 'active' } : u));
    toast(`${user.name} reactivated`);
  };

  const openDeleteModal = (user: AdminUser) => { setDeleteTarget(user); setShowDeleteModal(true); };
  const handleDelete = () => {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    toast(`${deleteTarget.name} has been removed`, 'error');
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const tabs = ['Manage Users', 'Audit Trail', 'Configuration'];

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'All' && u.role !== userRoleFilter) return false;
    if (userStatusFilter !== 'All' && u.status !== userStatusFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredAudit = AUDIT_ENTRIES.filter((e) => {
    if (auditUserFilter !== 'All' && e.user !== auditUserFilter) return false;
    if (auditRoleFilter !== 'All' && e.role?.toLowerCase() !== auditRoleFilter) return false;
    if (auditActionFilter !== 'All' && e.action !== auditActionFilter) return false;
    if (auditCaseFilter.trim()) {
      const q = auditCaseFilter.toLowerCase();
      if (!e.caseId.toLowerCase().includes(q) && !e.user.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: SURFACE.frame.bg, padding: SURFACE.frame.padding, gap: SURFACE.frame.padding, boxSizing: 'border-box' }}>
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: SURFACE.frame.padding, overflow: 'hidden' }}>

        <main style={{ flex: 1, overflow: 'hidden', background: SURFACE.content.bg, borderRadius: SURFACE.content.borderRadius, boxShadow: SURFACE.content.shadow, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flexShrink: 0 }}>
            <CaseHeader
              title="Admin Panel"
              showStatusRow={false}
              compact
              tabs={{ items: tabs, active: tabs.indexOf(activeTab), onChange: (i) => setActiveTab(tabs[i]) }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, background: SURFACE.content.bodyBg, padding: SURFACE.content.padding, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ── Users Tab ────────────────────────────────────────────── */}
              {activeTab === 'Manage Users' && (
                <>
                  <div>
                    <div style={{ fontSize: 13, color: COLORS.text.light }}>Manage users and access roles within your organisation</div>
                  </div>
                  {/* Filter panel */}
                  <div style={{ background: SURFACE.panel.bg, borderRadius: SURFACE.panel.borderRadius, border: SURFACE.panel.border, boxShadow: SURFACE.panel.shadow, padding: SURFACE.panel.padding }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <Filter size={16} style={{ color: COLORS.icon.restMuted, flexShrink: 0 }} />
                      <FormField label="Role" labelLayout="left">
                        <CustomSelect
                          value={userRoleFilter}
                          onChange={setUserRoleFilter}
                          options={[
                            { value: 'All',      label: 'All Roles' },
                            { value: 'analyst',  label: 'Analyst'   },
                            { value: 'lead',     label: 'Lead'      },
                            { value: 'admin',    label: 'Admin'     },
                          ]}
                        />
                      </FormField>
                      <FormField label="Status" labelLayout="left">
                        <CustomSelect
                          value={userStatusFilter}
                          onChange={setUserStatusFilter}
                          options={[
                            { value: 'All',      label: 'All'                 },
                            { value: 'active',   label: 'Active'              },
                            { value: 'inactive', label: 'Inactive'            },
                            { value: 'pending',  label: 'Invitation Pending'  },
                          ]}
                        />
                      </FormField>
                      <FormField labelLayout="left" style={{ flex: 2 }}>
                        <FilterSearchInput
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search by name or email..."
                        />
                      </FormField>
                      {(() => {
                        const dirty = userRoleFilter !== 'All' || userStatusFilter !== 'All' || userSearch !== '';
                        return (
                          <button type="button" title="Reset filters"
                            onClick={() => { setUserRoleFilter('All'); setUserStatusFilter('All'); setUserSearch(''); }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: COLORS.icon.dim, height: COLORS.icon.dim, borderRadius: RADIUS.md, border: 'none', background: 'none', cursor: 'pointer', color: dirty ? COLORS.icon.active : COLORS.icon.restMuted, opacity: dirty ? 1 : 0.4, transition: 'background 0.15s, color 0.15s, opacity 0.15s', flexShrink: 0 }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = dirty ? COLORS.icon.activeBg : COLORS.icon.mutedBg; (e.currentTarget as HTMLButtonElement).style.color = dirty ? COLORS.icon.activeHover : COLORS.icon.hover; (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = dirty ? COLORS.icon.active : COLORS.icon.restMuted; (e.currentTarget as HTMLButtonElement).style.opacity = dirty ? '1' : '0.4'; }}
                            onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.button.ghost.bgPress; (e.currentTarget as HTMLButtonElement).style.color = COLORS.icon.press; }}
                            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.background = dirty ? COLORS.icon.activeBg : COLORS.icon.mutedBg; (e.currentTarget as HTMLButtonElement).style.color = dirty ? COLORS.icon.activeHover : COLORS.icon.hover; }}
                          >
                            <RotateCcw size={COLORS.icon.size} />
                          </button>
                        );
                      })()}
                      <div style={{ width: 1, alignSelf: 'stretch', background: COLORS.bg.lighter, flexShrink: 0 }} />
                      <Btn variant="dark" icon={UserPlus} onClick={() => setShowAddUserModal(true)}>Add User</Btn>
                    </div>
                  </div>
                  {/* Table */}
                  <div style={{ background: TABLE.bg, borderRadius: TABLE.borderRadius, border: TABLE.border, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['User', 'Role', 'Email', 'Status', 'Cases', 'Last Active', ''].map((h) => (
                          <th key={h} style={{ ...TH, ...(h === '' ? { textAlign: 'right' } : {}) }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const rb = ROLE_BADGE[u.role] || ROLE_BADGE.analyst;
                        return (
                          <tr key={u.id} style={{ transition: 'background 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = TABLE.row.hoverBg}
                            onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                            <td style={TD}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(37,99,235,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#2563EB', flexShrink: 0 }}>{u.initials}</div>
                                <span style={{ fontWeight: 500 }}>{u.name}</span>
                              </div>
                            </td>
                            <td style={TD}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: rb.bg, color: rb.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{u.role}</span>
                            </td>
                            <td style={{ ...TD, color: COLORS.text.light }}>{u.email}</td>
                            <td style={TD}>
                              <span style={{
                                fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20,
                                background: u.status === 'active' ? 'rgba(34,197,94,0.12)' : u.status === 'pending' ? 'rgba(245,158,11,0.12)' : 'rgba(156,163,175,0.12)',
                                color:      u.status === 'active' ? '#22C55E'              : u.status === 'pending' ? '#F59E0B'               : '#9CA3AF',
                              }}>
                                {u.status === 'pending' ? 'Invite Pending' : u.status}
                              </span>
                            </td>
                            <td style={{ ...TD, color: COLORS.text.light }}>{u.casesAssigned ?? '—'}</td>
                            <td style={{ ...TD, ...(TABLE.cell.mono as React.CSSProperties) }}>{u.lastActive}</td>
                            <td style={{ ...TD, textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                {u.status === 'pending' && (
                                  <Btn variant="danger" size="sm" onClick={() => openDeleteModal(u)}>Remove Invite</Btn>
                                )}
                                {u.status === 'active' && u.role !== 'admin' && (
                                  <Btn variant="danger" size="sm" onClick={() => openDeactivate(u)}>Deactivate</Btn>
                                )}
                                {u.status === 'inactive' && (
                                  <Btn variant="outline" size="sm" onClick={() => handleReactivate(u)}>Reactivate</Btn>
                                )}
                                {u.role !== 'admin' && (
                                  <>
                                    <span style={{ width: 1, height: 16, background: COLORS.bg.lighter, flexShrink: 0, marginLeft: 4 }} />
                                    <button
                                      title={u.status === 'pending' ? `Cancel invitation for ${u.name}` : `Delete ${u.name}`}
                                      onClick={(e) => { e.stopPropagation(); openDeleteModal(u); }}
                                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.10)'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
                                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#C4C9D4'; }}
                                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '4px 6px', color: '#C4C9D4', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </>
              )}

              {/* ── Audit Trail Tab ───────────────────────────────────────── */}
              {activeTab === 'Audit Trail' && (
                <>
                  <div>
                    <div style={{ fontSize: 13, color: COLORS.text.light }}>Monitor all system and user activity across cases and the team</div>
                  </div>
                  {/* Filter panel */}
                  <div style={{ background: SURFACE.panel.bg, borderRadius: SURFACE.panel.borderRadius, border: SURFACE.panel.border, boxShadow: SURFACE.panel.shadow, padding: SURFACE.panel.padding }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <Filter size={16} style={{ color: COLORS.icon.restMuted, flexShrink: 0 }} />
                      <FormField label="User" labelLayout="left">
                        <CustomSelect
                          value={auditUserFilter}
                          onChange={setAuditUserFilter}
                          options={[
                            { value: 'All',            label: 'All Users'     },
                            { value: 'James Analyst',  label: 'James Analyst' },
                            { value: 'Sarah Chen',     label: 'Sarah Chen'    },
                            { value: 'David Kim',      label: 'David Kim'     },
                            { value: 'Emma Wilson',    label: 'Emma Wilson'   },
                            { value: 'Grace Lee',      label: 'Grace Lee'     },
                          ]}
                        />
                      </FormField>
                      <FormField label="Action Type" labelLayout="left">
                        <CustomSelect
                          value={auditActionFilter}
                          onChange={setAuditActionFilter}
                          options={[
                            { value: 'All',                            label: 'All Actions'                  },
                            { value: 'Case opened',                    label: 'Case opened'                  },
                            { value: 'Note added',                     label: 'Note added'                   },
                            { value: 'Status changed',                 label: 'Status changed'               },
                            { value: 'Case submitted for approval',    label: 'Case submitted for approval'  },
                            { value: 'Case approved',                  label: 'Case approved'                },
                            { value: 'Case returned',                  label: 'Case returned'                },
                            { value: 'Case reassigned',                label: 'Case reassigned'              },
                            { value: 'Lead assigned',                  label: 'Lead assigned'                },
                            { value: 'User deactivated',               label: 'User deactivated'             },
                            { value: 'Report downloaded',              label: 'Report downloaded'            },
                            { value: 'Login',                          label: 'Login'                        },
                          ]}
                        />
                      </FormField>
                      <FormField label="Role" labelLayout="left">
                        <CustomSelect
                          value={auditRoleFilter}
                          onChange={setAuditRoleFilter}
                          options={[
                            { value: 'All',      label: 'All Roles' },
                            { value: 'analyst',  label: 'Analyst'   },
                            { value: 'lead',     label: 'Lead'      },
                            { value: 'admin',    label: 'Admin'     },
                          ]}
                        />
                      </FormField>
                      <FormField labelLayout="left" style={{ flex: 2 }}>
                        <FilterSearchInput
                          value={auditCaseFilter}
                          onChange={(e) => setAuditCaseFilter(e.target.value)}
                          placeholder="Search by case ID, user..."
                        />
                      </FormField>
                      {(() => {
                        const dirty = auditUserFilter !== 'All' || auditRoleFilter !== 'All' || auditActionFilter !== 'All' || auditCaseFilter !== '';
                        return (
                          <button type="button" title="Reset filters"
                            onClick={() => { setAuditUserFilter('All'); setAuditRoleFilter('All'); setAuditActionFilter('All'); setAuditCaseFilter(''); }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: COLORS.icon.dim, height: COLORS.icon.dim, borderRadius: RADIUS.md, border: 'none', background: 'none', cursor: 'pointer', color: dirty ? COLORS.icon.active : COLORS.icon.restMuted, opacity: dirty ? 1 : 0.4, transition: 'background 0.15s, color 0.15s, opacity 0.15s', flexShrink: 0 }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = dirty ? COLORS.icon.activeBg : COLORS.icon.mutedBg; (e.currentTarget as HTMLButtonElement).style.color = dirty ? COLORS.icon.activeHover : COLORS.icon.hover; (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = dirty ? COLORS.icon.active : COLORS.icon.restMuted; (e.currentTarget as HTMLButtonElement).style.opacity = dirty ? '1' : '0.4'; }}
                            onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.button.ghost.bgPress; (e.currentTarget as HTMLButtonElement).style.color = COLORS.icon.press; }}
                            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.background = dirty ? COLORS.icon.activeBg : COLORS.icon.mutedBg; (e.currentTarget as HTMLButtonElement).style.color = dirty ? COLORS.icon.activeHover : COLORS.icon.hover; }}
                          >
                            <RotateCcw size={COLORS.icon.size} />
                          </button>
                        );
                      })()}
                      <div style={{ width: 1, alignSelf: 'stretch', background: COLORS.bg.lighter, flexShrink: 0 }} />
                      <Btn variant="outline" size="sm" icon={Download}>Export CSV</Btn>
                    </div>
                  </div>
                  {/* Table card */}
                  <div style={{ background: TABLE.bg, borderRadius: TABLE.borderRadius, border: TABLE.border, overflow: 'hidden' }}>
                  {filteredAudit.length === 0 ? (
                    <div style={EMPTY_STATE.wrapper as React.CSSProperties}>
                      <Search size={EMPTY_STATE.icon.size} style={{ color: EMPTY_STATE.icon.color }} />
                      <p style={EMPTY_STATE.title as React.CSSProperties}>No audit entries match your filters</p>
                      <p style={EMPTY_STATE.subtitle as React.CSSProperties}>Try adjusting the User, Action Type or Case ID filters</p>
                    </div>
                  ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Timestamp', 'User', 'Role', 'Action', 'Case ID', 'Details'].map((h) => (
                          <th key={h} style={TH}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAudit.map((e) => {
                        const at = ACTION_TAG[e.tag] || ACTION_TAG.grey;
                        const rb = ROLE_BADGE[e.role?.toLowerCase()] || ROLE_BADGE.analyst;
                        return (
                          <tr key={e.id}
                            onMouseEnter={ev => (ev.currentTarget as HTMLTableRowElement).style.background = TABLE.row.hoverBg}
                            onMouseLeave={ev => (ev.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                            <td style={{ ...TD, fontFamily: TYPOGRAPHY.fontMono, fontSize: 11, color: '#B0B8C8', whiteSpace: 'nowrap' }}>{e.timestamp}</td>
                            <td style={{ ...TD, fontWeight: 500, color: COLORS.text.dark }}>{e.user}</td>
                            <td style={TD}>
                              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: rb.bg, color: rb.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{e.role}</span>
                            </td>
                            <td style={TD}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: at.bg, color: at.color }}>{e.action}</span>
                            </td>
                            <td style={{ ...TD, fontFamily: TYPOGRAPHY.fontMono, fontSize: 11 }}>{e.caseId}</td>
                            <td style={{ ...TD, color: COLORS.text.light, maxWidth: 300 }}>{e.details}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  )}
                  </div>
                </>
              )}

              {/* ── Settings Tab ──────────────────────────────────────────── */}
              {activeTab === 'Configuration' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, color: COLORS.text.light }}>Configure escalation rules and notification preferences</div>
                  </div>
                  {/* Escalation Rules */}
                  <div style={{ background: TABLE.bg, borderRadius: TABLE.borderRadius, border: TABLE.border, overflow: 'hidden' }}>
                    <div style={{ padding: TABLE.density.relaxed.rowPadding, borderBottom: TABLE.header.borderBottom }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.dark }}>Approval Escalation Rules</div>
                      <div style={{ fontSize: 12, color: COLORS.text.light, marginTop: 2 }}>Automated case escalation thresholds</div>
                    </div>
                    {rules.map((r) => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: TABLE.density.relaxed.rowPadding, borderBottom: TABLE.row.borderBottom }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text.body, marginBottom: 2 }}>{r.label}</div>
                          <div style={{ fontSize: 12, color: COLORS.text.light }}>{r.desc}</div>
                        </div>
                        <button onClick={() => setRules(rules.map((x) => x.id === r.id ? { ...x, active: !x.active } : x))}
                          style={{ width: 34, height: 20, borderRadius: 11, border: 'none', cursor: 'pointer', background: r.active ? 'rgba(37,99,235,0.14)' : COLORS.bg.lighter, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                          <span style={{ position: 'absolute', top: 3, left: r.active ? 17 : 3, width: 14, height: 14, borderRadius: '50%', background: r.active ? '#2563EB' : '#9CA3AF', transition: 'left 0.2s' }} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Email Notifications */}
                  <div style={{ background: TABLE.bg, borderRadius: TABLE.borderRadius, border: TABLE.border, overflow: 'hidden' }}>
                    <div style={{ padding: TABLE.density.relaxed.rowPadding, borderBottom: TABLE.header.borderBottom }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.dark }}>Email Notifications</div>
                      <div style={{ fontSize: 12, color: COLORS.text.light, marginTop: 2 }}>Configure which events trigger email alerts</div>
                    </div>
                    {notifs.map((n) => (
                      <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: TABLE.density.relaxed.rowPadding, borderBottom: TABLE.row.borderBottom }}>
                        <span style={{ fontSize: 13, color: COLORS.text.body }}>{n.label}</span>
                        <button onClick={() => setNotifs(notifs.map((x) => x.id === n.id ? { ...x, active: !x.active } : x))}
                          style={{ width: 34, height: 20, borderRadius: 11, border: 'none', cursor: 'pointer', background: n.active ? 'rgba(37,99,235,0.14)' : COLORS.bg.lighter, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                          <span style={{ position: 'absolute', top: 3, left: n.active ? 17 : 3, width: 14, height: 14, borderRadius: '50%', background: n.active ? '#2563EB' : '#9CA3AF', transition: 'left 0.2s' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* Toast */}
      <Toast {...toastState} />

      {/* ── Add User Modal ────────────────────────────────────────── */}
      <Modal open={showAddUserModal} theme="light" title="Add Team Member" onClose={closeInviteModal}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Full Name', value: newUserName, onChange: setNewUserName, placeholder: 'e.g. Jane Smith' },
            { label: 'Email Address', value: newUserEmail, onChange: setNewUserEmail, placeholder: 'e.g. jane@traceagent.com' },
          ].map(({ label, value, onChange, placeholder }) => (
            <div key={label}>
              <span style={LBL}>{label}</span>
              <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                style={selStyle} {...fieldEvents}
              />
            </div>
          ))}
          <div>
            <span style={LBL}>Role</span>
            <CustomSelect
              value={newUserRole}
              onChange={setNewUserRole}
              options={[
                { value: 'analyst', label: 'Analyst' },
                { value: 'lead',    label: 'Lead' },
                { value: 'admin',   label: 'Admin' },
              ]}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={closeInviteModal}>Cancel</Btn>
          <Btn variant="primary" icon={UserPlus} onClick={handleAddUser} disabled={!newUserName.trim() || !newUserEmail.trim()}>Send Invite</Btn>
        </div>
      </Modal>

      {/* ── Delete / Cancel Invite Modal ──────────────────────────── */}
      <Modal
        open={showDeleteModal && !!deleteTarget}
        theme="light"
        title={deleteTarget?.status === 'pending' ? 'Cancel Invitation?' : 'Remove User?'}
        onClose={() => setShowDeleteModal(false)}
      >
        <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
          <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: ALERT.danger.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={18} style={{ color: ALERT.danger.iconColor }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: ALERT.danger.titleColor, marginBottom: 6 }}>
              {deleteTarget?.status === 'pending'
                ? <>Cancel invitation for <strong>{deleteTarget?.name}</strong>?</>
                : <>Permanently remove <strong>{deleteTarget?.name}</strong>?</>}
            </div>
            <div style={{ fontSize: 13, color: ALERT.danger.bodyColor, lineHeight: 1.55 }}>
              {deleteTarget?.status === 'pending'
                ? 'The invitation link will be revoked. You can re-invite this person at any time.'
                : 'This action cannot be undone. The user will lose all access immediately and will be removed from your organisation.'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Btn>
          <Btn variant="danger" icon={Trash2} onClick={handleDelete}>
            {deleteTarget?.status === 'pending' ? 'Cancel Invite' : 'Remove User'}
          </Btn>
        </div>
      </Modal>

      {/* ── Deactivate Modal ──────────────────────────────────────── */}
      <Modal open={showDeactivateModal && !!deactivateTarget} theme="light" title={`Deactivate ${deactivateTarget?.name ?? ''}?`} onClose={() => setShowDeactivateModal(false)}>
        <div style={{ fontSize: 13, color: COLORS.text.body, lineHeight: 1.55, marginBottom: 20 }}>
          This user has <strong style={{ color: COLORS.text.dark }}>{deactivateTarget?.casesAssigned ?? 0} open case{deactivateTarget?.casesAssigned !== 1 ? 's' : ''}</strong>.
          {(deactivateTarget?.casesAssigned ?? 0) > 0 && ' Please reassign before deactivating.'}
        </div>
        {(deactivateTarget?.casesAssigned ?? 0) > 0 && (
          <div style={{ marginBottom: 20 }}>
            <span style={LBL}>Reassign cases to</span>
            <CustomSelect
              value={reassignTarget}
              onChange={setReassignTarget}
              placeholder="Select analyst..."
              options={activeAnalysts.filter((a) => a.id !== deactivateTarget?.id).map((a) => ({ value: a.id, label: a.name }))}
            />
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setShowDeactivateModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleDeactivate} disabled={(deactivateTarget?.casesAssigned ?? 0) > 0 && !reassignTarget}>Deactivate</Btn>
        </div>
      </Modal>
    </div>
  );
}
