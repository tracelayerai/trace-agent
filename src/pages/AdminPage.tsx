import { useState, useEffect } from 'react';
import { UserPlus, Download, Filter, Search, Trash2, AlertTriangle, RotateCcw } from 'lucide-react';
import { CaseHeader, Btn } from '@/components/core/CaseHeader';
import { Modal } from '@/components/core/Modal';
import { CustomSelect } from '@/components/core/CustomSelect';
import { FormField, FilterSearchInput } from '@/components/core/FormField';
import { Toast, useToast } from '@/components/core/Toast';
import Sidebar from '@/components/layout/Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
  analyst: { bg: 'rgba(156,163,175,0.12)', color: '#9CA3AF' },
  lead:    { bg: 'rgba(96,165,250,0.12)',  color: '#60A5FA' },
  admin:   { bg: 'rgba(167,139,250,0.12)', color: '#A78BFA' },
};

const ACTION_TAG: Record<string, { bg: string; color: string }> = {
  blue:   { bg: 'rgba(96,165,250,0.15)',  color: '#60A5FA' },
  amber:  { bg: 'rgba(251,191,36,0.15)',  color: '#FBBF24' },
  green:  { bg: 'rgba(34,197,94,0.15)',   color: '#22C55E' },
  red:    { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
  purple: { bg: 'rgba(167,139,250,0.15)', color: '#A78BFA' },
  grey:   { bg: 'rgba(156,163,175,0.12)', color: '#9CA3AF' },
};

// Shared table header/cell class strings
const TH_CLS = 'px-[20px] py-[13px] text-left text-[11px] font-medium text-[#717A8C] uppercase tracking-[0.06em] border-b border-[#ECEEF2] bg-[#FAFBFC]';
const TD_CLS = 'px-[20px] py-[14px] text-[13px] text-[#374151] border-b border-[#F3F4F6] align-middle';

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
    <div className="flex h-screen overflow-hidden p-[8px] gap-[8px] box-border bg-[linear-gradient(160deg,#060C1A_0%,#0C1D3C_55%,#091630_100%)]">
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div className="flex-1 flex flex-col gap-[8px] overflow-hidden">

        <main className="flex-1 overflow-hidden rounded-[16px] flex flex-col bg-[linear-gradient(180deg,#F5F6FA_0%,#EAEBF0_60%,#E3E4EA_100%)] shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_2px_8px_rgba(0,0,0,0.03),inset_0_-2px_8px_rgba(0,0,0,0.02)]">
          <div className="shrink-0">
            <CaseHeader
              title="Admin Panel"
              showStatusRow={false}
              compact
              tabs={{ items: tabs, active: tabs.indexOf(activeTab), onChange: (i) => setActiveTab(tabs[i]) }}
            />
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1 px-[32px] py-[24px] flex flex-col gap-[16px] bg-[linear-gradient(180deg,#F5F6FA_0%,#EAEBF0_60%,#E3E4EA_100%)]">

              {/* ── Users Tab ──────────────────────────────────────────────── */}
              {activeTab === 'Manage Users' && (
                <>
                  <div className="text-[13px] text-[#5C6578]">Manage users and access roles within your organisation</div>

                  {/* Filter panel */}
                  <div className="bg-white rounded-[12px] border border-[#ECEEF2] px-[16px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-[16px]">
                      <Filter size={16} className="text-[#7B90AA] shrink-0" />
                      <FormField label="Role" labelLayout="left">
                        <CustomSelect
                          value={userRoleFilter}
                          onChange={setUserRoleFilter}
                          options={[
                            { value: 'All',     label: 'All Roles' },
                            { value: 'analyst', label: 'Analyst'   },
                            { value: 'lead',    label: 'Lead'      },
                            { value: 'admin',   label: 'Admin'     },
                          ]}
                        />
                      </FormField>
                      <FormField label="Status" labelLayout="left">
                        <CustomSelect
                          value={userStatusFilter}
                          onChange={setUserStatusFilter}
                          options={[
                            { value: 'All',      label: 'All'                },
                            { value: 'active',   label: 'Active'             },
                            { value: 'inactive', label: 'Inactive'           },
                            { value: 'pending',  label: 'Invitation Pending' },
                          ]}
                        />
                      </FormField>
                      <FormField labelLayout="left" className="flex-[2]">
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
                            className={cn(
                              'flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border-none cursor-pointer transition-[background,color,opacity] duration-150 shrink-0',
                              dirty
                                ? 'text-[#2563EB] opacity-100 hover:bg-[rgba(37,99,235,0.10)] hover:text-[#1D4ED8]'
                                : 'text-[#7B90AA] opacity-40 hover:bg-[rgba(123,144,170,0.10)] hover:text-[#4A5568] hover:opacity-100',
                            )}
                          >
                            <RotateCcw size={16} />
                          </button>
                        );
                      })()}
                      <div className="w-px self-stretch bg-[#E5E7EB] shrink-0" />
                      <Btn variant="dark" icon={UserPlus} onClick={() => setShowAddUserModal(true)}>Add User</Btn>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-[12px] border border-[#ECEEF2] overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          {['User', 'Role', 'Email', 'Status', 'Cases', 'Last Active', ''].map((h) => (
                            <th key={h} className={cn(TH_CLS, h === '' ? 'text-right' : '')}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => {
                          const rb = ROLE_BADGE[u.role] || ROLE_BADGE.analyst;
                          return (
                            <tr key={u.id} className="hover:bg-[#F8F9FB] transition-colors duration-150">
                              <td className={TD_CLS}>
                                <div className="flex items-center gap-[10px]">
                                  <div className="w-[32px] h-[32px] rounded-full bg-[rgba(37,99,235,0.10)] flex items-center justify-center text-[11px] font-bold text-[#2563EB] shrink-0">{u.initials}</div>
                                  <span className="font-medium">{u.name}</span>
                                </div>
                              </td>
                              <td className={TD_CLS}>
                                <span className="text-[11px] font-semibold px-[10px] py-[2px] rounded-full uppercase tracking-[0.04em]"
                                  style={{ background: rb.bg, color: rb.color }}>{u.role}</span>
                              </td>
                              <td className={cn(TD_CLS, 'text-[#5C6578]')}>{u.email}</td>
                              <td className={TD_CLS}>
                                <span className="text-[11px] font-semibold px-[10px] py-[2px] rounded-full"
                                  style={{
                                    background: u.status === 'active' ? 'rgba(34,197,94,0.12)' : u.status === 'pending' ? 'rgba(245,158,11,0.12)' : 'rgba(156,163,175,0.12)',
                                    color:      u.status === 'active' ? '#22C55E'              : u.status === 'pending' ? '#F59E0B'               : '#9CA3AF',
                                  }}>
                                  {u.status === 'pending' ? 'Invite Pending' : u.status}
                                </span>
                              </td>
                              <td className={cn(TD_CLS, 'text-[#5C6578]')}>{u.casesAssigned ?? '—'}</td>
                              <td className={cn(TD_CLS, 'font-mono text-[12px] text-[#4A5568]')}>{u.lastActive}</td>
                              <td className={cn(TD_CLS, 'text-right')}>
                                <div className="flex items-center justify-end gap-[8px]">
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
                                      <span className="w-px h-[16px] bg-[#E5E7EB] shrink-0 ml-[4px]" />
                                      <button
                                        title={u.status === 'pending' ? `Cancel invitation for ${u.name}` : `Delete ${u.name}`}
                                        onClick={(e) => { e.stopPropagation(); openDeleteModal(u); }}
                                        className="bg-transparent border-none cursor-pointer rounded-[6px] p-[4px_6px] text-[#C4C9D4] flex items-center transition-all duration-150 hover:bg-[rgba(239,68,68,0.10)] hover:text-[#EF4444]"
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

              {/* ── Audit Trail Tab ──────────────────────────────────────────── */}
              {activeTab === 'Audit Trail' && (
                <>
                  <div className="text-[13px] text-[#5C6578]">Monitor all system and user activity across cases and the team</div>

                  {/* Filter panel */}
                  <div className="bg-white rounded-[12px] border border-[#ECEEF2] px-[16px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-[16px]">
                      <Filter size={16} className="text-[#7B90AA] shrink-0" />
                      <FormField label="User" labelLayout="left">
                        <CustomSelect
                          value={auditUserFilter}
                          onChange={setAuditUserFilter}
                          options={[
                            { value: 'All',           label: 'All Users'     },
                            { value: 'James Analyst', label: 'James Analyst' },
                            { value: 'Sarah Chen',    label: 'Sarah Chen'    },
                            { value: 'David Kim',     label: 'David Kim'     },
                            { value: 'Emma Wilson',   label: 'Emma Wilson'   },
                            { value: 'Grace Lee',     label: 'Grace Lee'     },
                          ]}
                        />
                      </FormField>
                      <FormField label="Action Type" labelLayout="left">
                        <CustomSelect
                          value={auditActionFilter}
                          onChange={setAuditActionFilter}
                          options={[
                            { value: 'All',                         label: 'All Actions'                 },
                            { value: 'Case opened',                 label: 'Case opened'                 },
                            { value: 'Note added',                  label: 'Note added'                  },
                            { value: 'Status changed',              label: 'Status changed'              },
                            { value: 'Case submitted for approval', label: 'Case submitted for approval' },
                            { value: 'Case approved',               label: 'Case approved'               },
                            { value: 'Case returned',               label: 'Case returned'               },
                            { value: 'Case reassigned',             label: 'Case reassigned'             },
                            { value: 'Lead assigned',               label: 'Lead assigned'               },
                            { value: 'User deactivated',            label: 'User deactivated'            },
                            { value: 'Report downloaded',           label: 'Report downloaded'           },
                            { value: 'Login',                       label: 'Login'                       },
                          ]}
                        />
                      </FormField>
                      <FormField label="Role" labelLayout="left">
                        <CustomSelect
                          value={auditRoleFilter}
                          onChange={setAuditRoleFilter}
                          options={[
                            { value: 'All',     label: 'All Roles' },
                            { value: 'analyst', label: 'Analyst'   },
                            { value: 'lead',    label: 'Lead'      },
                            { value: 'admin',   label: 'Admin'     },
                          ]}
                        />
                      </FormField>
                      <FormField labelLayout="left" className="flex-[2]">
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
                            className={cn(
                              'flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border-none cursor-pointer transition-[background,color,opacity] duration-150 shrink-0',
                              dirty
                                ? 'text-[#2563EB] opacity-100 hover:bg-[rgba(37,99,235,0.10)] hover:text-[#1D4ED8]'
                                : 'text-[#7B90AA] opacity-40 hover:bg-[rgba(123,144,170,0.10)] hover:text-[#4A5568] hover:opacity-100',
                            )}
                          >
                            <RotateCcw size={16} />
                          </button>
                        );
                      })()}
                      <div className="w-px self-stretch bg-[#E5E7EB] shrink-0" />
                      <Btn variant="outline" size="sm" icon={Download}>Export CSV</Btn>
                    </div>
                  </div>

                  {/* Table card */}
                  <div className="bg-white rounded-[12px] border border-[#ECEEF2] overflow-hidden">
                    {filteredAudit.length === 0 ? (
                      <div className="px-[24px] py-[48px] flex flex-col items-center justify-center gap-[8px]">
                        <Search size={28} className="text-[#D1D5DB]" />
                        <p className="text-[13px] font-semibold text-[#9CA3AF] m-0">No audit entries match your filters</p>
                        <p className="text-[12px] text-[#B0B8C8] text-center m-0">Try adjusting the User, Action Type or Case ID filters</p>
                      </div>
                    ) : (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            {['Timestamp', 'User', 'Role', 'Action', 'Case ID', 'Details'].map((h) => (
                              <th key={h} className={TH_CLS}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAudit.map((e) => {
                            const at = ACTION_TAG[e.tag] || ACTION_TAG.grey;
                            const rb = ROLE_BADGE[e.role?.toLowerCase()] || ROLE_BADGE.analyst;
                            return (
                              <tr key={e.id} className="hover:bg-[#F8F9FB] transition-colors duration-150">
                                <td className={cn(TD_CLS, 'font-mono text-[11px] text-[#B0B8C8] whitespace-nowrap')}>{e.timestamp}</td>
                                <td className={cn(TD_CLS, 'font-medium text-[#111827]')}>{e.user}</td>
                                <td className={TD_CLS}>
                                  <span className="text-[10px] font-semibold px-[8px] py-[2px] rounded-full uppercase tracking-[0.04em]"
                                    style={{ background: rb.bg, color: rb.color }}>{e.role}</span>
                                </td>
                                <td className={TD_CLS}>
                                  <span className="text-[11px] font-semibold px-[10px] py-[2px] rounded-full"
                                    style={{ background: at.bg, color: at.color }}>{e.action}</span>
                                </td>
                                <td className={cn(TD_CLS, 'font-mono text-[11px]')}>{e.caseId}</td>
                                <td className={cn(TD_CLS, 'text-[#5C6578] max-w-[300px]')}>{e.details}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {/* ── Configuration Tab ──────────────────────────────────────────── */}
              {activeTab === 'Configuration' && (
                <div className="flex flex-col gap-[16px]">
                  <div className="text-[13px] text-[#5C6578]">Configure escalation rules and notification preferences</div>

                  {/* Escalation Rules */}
                  <div className="bg-white rounded-[12px] border border-[#ECEEF2] overflow-hidden">
                    <div className="px-[20px] py-[14px] border-b border-[#ECEEF2]">
                      <div className="text-[13px] font-semibold text-[#111827]">Approval Escalation Rules</div>
                      <div className="text-[12px] text-[#5C6578] mt-[2px]">Automated case escalation thresholds</div>
                    </div>
                    {rules.map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#F3F4F6]">
                        <div>
                          <div className="text-[13px] font-medium text-[#374151] mb-[2px]">{r.label}</div>
                          <div className="text-[12px] text-[#5C6578]">{r.desc}</div>
                        </div>
                        <button onClick={() => setRules(rules.map((x) => x.id === r.id ? { ...x, active: !x.active } : x))}
                          className={cn('shrink-0 w-[34px] h-[20px] rounded-full border-none cursor-pointer relative transition-colors duration-200', r.active ? 'bg-[rgba(37,99,235,0.14)]' : 'bg-[#E5E7EB]')}>
                          <span className={cn('absolute top-[3px] w-[14px] h-[14px] rounded-full transition-[left] duration-200', r.active ? 'left-[17px] bg-[#2563EB]' : 'left-[3px] bg-[#9CA3AF]')} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Email Notifications */}
                  <div className="bg-white rounded-[12px] border border-[#ECEEF2] overflow-hidden">
                    <div className="px-[20px] py-[14px] border-b border-[#ECEEF2]">
                      <div className="text-[13px] font-semibold text-[#111827]">Email Notifications</div>
                      <div className="text-[12px] text-[#5C6578] mt-[2px]">Configure which events trigger email alerts</div>
                    </div>
                    {notifs.map((n) => (
                      <div key={n.id} className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#F3F4F6]">
                        <span className="text-[13px] text-[#374151]">{n.label}</span>
                        <button onClick={() => setNotifs(notifs.map((x) => x.id === n.id ? { ...x, active: !x.active } : x))}
                          className={cn('shrink-0 w-[34px] h-[20px] rounded-full border-none cursor-pointer relative transition-colors duration-200', n.active ? 'bg-[rgba(37,99,235,0.14)]' : 'bg-[#E5E7EB]')}>
                          <span className={cn('absolute top-[3px] w-[14px] h-[14px] rounded-full transition-[left] duration-200', n.active ? 'left-[17px] bg-[#2563EB]' : 'left-[3px] bg-[#9CA3AF]')} />
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

      <Toast {...toastState} />

      {/* ── Add User Modal ─────────────────────────────────────────────── */}
      <Modal open={showAddUserModal} theme="light" title="Add Team Member" onClose={closeInviteModal}>
        <div className="flex flex-col gap-[14px] mb-[24px]">
          {[
            { label: 'Full Name',      value: newUserName,  onChange: setNewUserName,  placeholder: 'e.g. Jane Smith' },
            { label: 'Email Address',  value: newUserEmail, onChange: setNewUserEmail, placeholder: 'e.g. jane@traceagent.com' },
          ].map(({ label, value, onChange, placeholder }) => (
            <div key={label}>
              <span className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">{label}</span>
              <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                className="w-full h-[38px] bg-white border border-[#D1D5DB] rounded-[10px] px-[14px] py-[9px] text-[14px] text-[#111827] outline-none box-border transition-[border-color,box-shadow,background] duration-150 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#B0BCC8] focus:border-[#4B7AC7] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.10),0_1px_4px_rgba(0,0,0,0.05)]"
              />
            </div>
          ))}
          <div>
            <span className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Role</span>
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
        <div className="flex gap-[8px] justify-end">
          <Btn variant="ghost" onClick={closeInviteModal}>Cancel</Btn>
          <Btn variant="primary" icon={UserPlus} onClick={handleAddUser} disabled={!newUserName.trim() || !newUserEmail.trim()}>Send Invite</Btn>
        </div>
      </Modal>

      {/* ── Delete / Cancel Invite Modal ──────────────────────────────── */}
      <Modal
        open={showDeleteModal && !!deleteTarget}
        theme="light"
        title={deleteTarget?.status === 'pending' ? 'Cancel Invitation?' : 'Remove User?'}
        onClose={() => setShowDeleteModal(false)}
      >
        <div className="flex gap-[14px] mb-[20px]">
          <div className="shrink-0 w-[40px] h-[40px] rounded-full bg-[#FEE2E2] flex items-center justify-center">
            <AlertTriangle size={18} className="text-[#EF4444]" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[#111827] mb-[6px]">
              {deleteTarget?.status === 'pending'
                ? <>Cancel invitation for <strong>{deleteTarget?.name}</strong>?</>
                : <>Permanently remove <strong>{deleteTarget?.name}</strong>?</>}
            </div>
            <div className="text-[13px] text-[#374151] leading-[1.55]">
              {deleteTarget?.status === 'pending'
                ? 'The invitation link will be revoked. You can re-invite this person at any time.'
                : 'This action cannot be undone. The user will lose all access immediately and will be removed from your organisation.'}
            </div>
          </div>
        </div>
        <div className="flex gap-[8px] justify-end">
          <Btn variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Btn>
          <Btn variant="danger" icon={Trash2} onClick={handleDelete}>
            {deleteTarget?.status === 'pending' ? 'Cancel Invite' : 'Remove User'}
          </Btn>
        </div>
      </Modal>

      {/* ── Deactivate Modal ──────────────────────────────────────────── */}
      <Modal open={showDeactivateModal && !!deactivateTarget} theme="light" title={`Deactivate ${deactivateTarget?.name ?? ''}?`} onClose={() => setShowDeactivateModal(false)}>
        <div className="text-[13px] text-[#374151] leading-[1.55] mb-[20px]">
          This user has <strong className="text-[#111827]">{deactivateTarget?.casesAssigned ?? 0} open case{deactivateTarget?.casesAssigned !== 1 ? 's' : ''}</strong>.
          {(deactivateTarget?.casesAssigned ?? 0) > 0 && ' Please reassign before deactivating.'}
        </div>
        {(deactivateTarget?.casesAssigned ?? 0) > 0 && (
          <div className="mb-[20px]">
            <span className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Reassign cases to</span>
            <CustomSelect
              value={reassignTarget}
              onChange={setReassignTarget}
              placeholder="Select analyst..."
              options={activeAnalysts.filter((a) => a.id !== deactivateTarget?.id).map((a) => ({ value: a.id, label: a.name }))}
            />
          </div>
        )}
        <div className="flex gap-[8px] justify-end">
          <Btn variant="ghost" onClick={() => setShowDeactivateModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleDeactivate} disabled={(deactivateTarget?.casesAssigned ?? 0) > 0 && !reassignTarget}>Deactivate</Btn>
        </div>
      </Modal>
    </div>
  );
}
