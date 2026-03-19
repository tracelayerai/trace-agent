import { useState, useMemo, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare, XCircle, RefreshCw, X, Send, CornerDownLeft,
  CheckCircle, MoreHorizontal, Archive, Trash2, RotateCcw, ChevronDown,
  ChevronRight, AlertCircle, Printer, Download, Pencil, Clock,
} from 'lucide-react';
import logo from '@/assets/images/ta_full_logo.svg';
import { Table } from '@/components/core/Table';
import { StatusChip } from '@/components/core/StatusChip';
import { CaseHeader, Btn, GhostIcon } from '@/components/core/CaseHeader';
import { MetricCard, DetailsCard, Callout } from '@/components/core/MetricCard';
import { Modal } from '@/components/core/Modal';
import { CustomSelect } from '@/components/core/CustomSelect';
import { Toast, useToast } from '@/components/core/Toast';
import GaugeMetric from '@/components/GaugeMetric';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth, MOCK_USERS, ROLES } from '@/context/AuthContext';
import { mockCases } from '@/services/casesService';
import { mockTransactions } from '@/services/transactionsService';
import type { Transaction } from '@/services/transactionsService';
import { mockCaseNotes, mockStatusHistory } from '@/services/notesService';
import { WalletOverlay } from '@/components/core/WalletOverlay';

// ── Static data ──────────────────────────────────────────────────────────────
const HOP_TRACE = [
  { n: 1, from: '0x8f3a...2b1c', to: '0x7a3d...6c7d', amount: '+142.88 ETH', action: 'Received from mixer-associated cluster', risk: 'high' },
  { n: 2, from: '0x7a3d...6c7d', to: 'Hop Bridge',    amount: '142.88 ETH',  action: 'Cross-chain bridge initiated',           risk: 'medium' },
  { n: 3, from: 'Hop Protocol',  to: '0x9c4e...7f2a', amount: '142.75 ETH',  action: 'Funds arrived on Arbitrum',              risk: 'neutral' },
  { n: 4, from: '0x9c4e...7f2a', to: 'DEX Aggregator', amount: '142.75 ETH', action: 'Swapped to USDC via 1inch',             risk: 'medium' },
  { n: 5, from: 'DEX',           to: '12 wallets',    amount: '~11.9 ETH ea', action: 'Systematic fragmentation',             risk: 'high' },
  { n: 6, from: 'Fragmentation', to: '0xb4e2...c021', amount: '138.20 ETH',  action: 'Consolidation — 92% recovery',          risk: 'neutral' },
  { n: 7, from: '0xb4e2...c021', to: 'VASP (non-coop)', amount: '138.20 ETH', action: 'Final destination',                    risk: 'critical' },
];
const hopDotColor: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#F59E0B', neutral: '#2D3142' };

const REPORT_HOPS = [
  { n: 1, from: '0x8f3a...2b1c', to: '0x7a3d...6c7d',          amount: '+142.88 ETH',   action: 'Received from mixer-associated cluster',             chain: 'Ethereum',             warn: true  },
  { n: 2, from: '0x7a3d...6c7d', to: 'Hop Protocol Bridge',    amount: '142.88 ETH',    action: 'Cross-chain bridge initiated',                       chain: 'Ethereum → Arbitrum', warn: true  },
  { n: 3, from: 'Hop Protocol',  to: '0x9c4e...7f2a',          amount: '142.75 ETH',    action: 'Funds arrived on Arbitrum',                          chain: 'Arbitrum',             warn: false },
  { n: 4, from: '0x9c4e...7f2a', to: 'DEX Aggregator',         amount: '142.75 ETH',    action: 'Swapped to USDC via 1inch',                          chain: 'Arbitrum',             warn: false },
  { n: 5, from: 'DEX',           to: '12 fragmentation wallets', amount: '~11.9 ETH each', action: 'Systematic fragmentation — structuring pattern', chain: 'Arbitrum',             warn: true  },
  { n: 6, from: 'Fragmentation wallets', to: '0xb4e2...c021',  amount: '138.20 ETH',    action: 'Consolidation — 92% recovery rate',                  chain: 'Arbitrum',             warn: false },
  { n: 7, from: '0xb4e2...c021', to: 'VASP (non-coop)',        amount: '138.20 ETH',    action: 'Final destination — hosted VASP',                    chain: 'Arbitrum',             warn: true  },
];

const CHAIN_OF_CUSTODY = [
  { timestamp: 'Feb 27, 2026 13:58', action: 'Wallet Searched',       by: 'James Analyst', details: 'Initial search via TraceAgent platform' },
  { timestamp: 'Feb 27, 2026 14:02', action: 'Detailed Analysis Run', by: 'James Analyst', details: 'AI trace initiated — 8 hops analyzed' },
  { timestamp: 'Feb 27, 2026 14:05', action: 'Case Opened',           by: 'James Analyst', details: 'Case CASE-2026-0011 created, risk: Critical' },
  { timestamp: 'Feb 27, 2026 14:15', action: 'Note Added',            by: 'James Analyst', details: 'Sanctions match confirmed' },
  { timestamp: 'Feb 27, 2026 14:28', action: 'Note Added',            by: 'James Analyst', details: 'Bridge activity traced' },
  { timestamp: 'Feb 27, 2026 15:42', action: 'Status Updated',        by: 'Sarah Chen',    details: 'Escalated to Critical' },
  { timestamp: 'Feb 27, 2026 15:43', action: 'Note Added',            by: 'Sarah Chen',    details: 'SAR filing approved' },
];

const TOP_FLAGS = [
  { severity: 'Critical', text: 'Direct 2-hop connection to OFAC-sanctioned address', detail: '0x4f2a...9e1b' },
  { severity: 'High',     text: 'Cross-chain obfuscation via Hop Protocol bridge' },
  { severity: 'High',     text: 'Transaction frequency 200/hr — inconsistent with retail profile' },
];

const ANALYST_LIST = [
  { name: 'James Analyst', id: 'user-001' },
  { name: 'Emma Wilson',   id: 'user-emp-001' },
  { name: 'Grace Lee',     id: 'user-emp-002' },
];

// ── Shared types ─────────────────────────────────────────────────────────────
interface NoteEntry {
  id: string;
  author?: string;
  role?: string;
  timestamp: string;
  content: string;
  type: string;
  isStatusChange?: boolean;
  action?: string;
  note?: string;
  edited?: boolean;
}

interface CaseData {
  id: string;
  walletAddress: string;
  chain: string;
  riskLevel: string;
  riskScore: number;
  typology: string;
  status: string;
  assignedAnalyst: string;
  dateOpened: string;
  lastUpdated: string;
  sanctions: boolean;
  exposurePercent: number;
  assignedTo?: string;
  assignedLead?: string;
  firstActive?: string;
  lastActive?: string;
  totalVolume?: string;
  chainsInvolved?: string[];
}

// ── Shared inline helpers ────────────────────────────────────────────────────
interface TAProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}

function TA({ value, onChange, placeholder, rows = 4 }: TAProps) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white border border-[#D1D5DB] rounded-[10px] px-[14px] py-[9px] text-[13px] text-[#111827] resize-y outline-none box-border font-[inherit] leading-[1.5] transition-[border-color,box-shadow] duration-150 hover:border-[#B0BCC8] focus:border-[#4B7AC7] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.10),0_1px_4px_rgba(0,0,0,0.05)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
    />
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CaseFile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAnalyst, isLead, isAdmin } = useAuth();

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [status, setStatus]       = useState('open');
  const [riskLevel, _setRiskLevel] = useState('Critical');

  const [notes, setNotes]               = useState<NoteEntry[]>([...mockCaseNotes as NoteEntry[]]);
  const [newNote, setNewNote]           = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [statusHistory, setStatusHistory] = useState<NoteEntry[]>([...mockStatusHistory as NoteEntry[]]);
  const notesComposerRef = useRef<HTMLTextAreaElement>(null);
  const notesBtnRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  const [toastState, toast_] = useToast();
  const [notesOpen, setNotesOpen] = useState(false);
  const [auditTrailExpanded, setAuditTrailExpanded] = useState(false);

  const [caseAssignedLead, setCaseAssignedLead] = useState<string | null>(null);
  const [showLeadDrop, setShowLeadDrop] = useState(false);
  const [showChangeLeadModal, setShowChangeLeadModal] = useState(false);
  const [changeLeadSelected, setChangeLeadSelected] = useState('');
  const [changeLeadReason, setChangeLeadReason] = useState('');

  const [showChangeAnalystModal, setShowChangeAnalystModal] = useState(false);
  const [changeAnalystSelected, setChangeAnalystSelected] = useState('');
  const [changeAnalystReason, setChangeAnalystReason] = useState('');

  const [showSubmitModal, setShowSubmitModal]       = useState(false);
  const [showResubmitModal, setShowResubmitModal]   = useState(false);
  const [submitNote, setSubmitNote]                 = useState('');

  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason]       = useState('');

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalNote, setApprovalNote]         = useState('');
  const [showReturnModal, setShowReturnModal]   = useState(false);
  const [returnFeedback, setReturnFeedback]     = useState('');
  const [selfApproved, setSelfApproved]         = useState(false);

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason]       = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason]     = useState('');
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [unarchiveReason, setUnarchiveReason] = useState('');

  const [showMoreMenu, setShowMoreMenu]       = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveReason, setArchiveReason]     = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason]       = useState('');
  const [deleteConfirm, setDeleteConfirm]     = useState('');

  const [showAdminReassignModal, setShowAdminReassignModal] = useState(false);
  const [adminAnalyst, setAdminAnalyst]   = useState('');
  const [adminLead, setAdminLead]         = useState('');
  const [adminReason, setAdminReason]     = useState('');

  const [_showStatusChangeModal, _setShowStatusChangeModal] = useState(false);
  const [_statusChangeTo, _setStatusChangeTo]   = useState('');
  const [_statusChangeReason, _setStatusChangeReason] = useState('');

  const [assignedAnalyst, setAssignedAnalyst] = useState<string | null>(null);

  const [reportType, setReportType] = useState('full');

  const [showWalletOverlay, setShowWalletOverlay] = useState(false);

  const leadUsers     = Object.values(MOCK_USERS).filter(u => u.role === ROLES.LEAD);
  const analystUsers  = Object.values(MOCK_USERS).filter(u => u.role === ROLES.ANALYST);

  // ── Derived data ───────────────────────────────────────────────────────────
  const caseData = (mockCases.find(c => c.id === id) || {
    id: id || 'CASE-2026-0011',
    walletAddress: '0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f4a5b6c7d',
    chain: 'Ethereum', riskLevel: 'Critical', riskScore: 94,
    typology: 'Sanctions Evasion & Layering', status: 'open',
    assignedAnalyst: 'James Analyst', dateOpened: '2026-02-27',
    lastUpdated: '2026-02-27', sanctions: true, exposurePercent: 94,
  }) as CaseData;

  const isAssignedAnalyst = currentUser?.id === caseData?.assignedTo && isAnalyst;
  const hasBeenRevoked    = notes.some(n => n.type === 'revoked');
  const isSelfAssigned    = isLead && currentUser?.id === caseData?.assignedTo;

  const assignedLeadUser = caseAssignedLead
    ? Object.values(MOCK_USERS).find(u => u.id === caseAssignedLead)
    : null;

  const canEditLead = (() => {
    if (isAdmin) return true;
    if (isAnalyst) return ['open', 'under-review', 'pending-approval', 'returned'].includes(status);
    if (isLead) return !caseAssignedLead || caseAssignedLead === currentUser?.id;
    return false;
  })();

  const canEditAnalyst = isAdmin || isLead;

  const flaggedTxns = useMemo(
    () => mockTransactions.filter((t: Transaction) => t.compliance === 'flagged').slice(0, 4),
    []
  );

  const allNotes = useMemo(() => {
    const statusItems = statusHistory.map(s => ({ ...s, content: s.note || s.action || '', isStatusChange: true }));
    return [...statusItems, ...notes].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [notes, statusHistory]);

  const auditEntries = useMemo(() =>
    allNotes.map(n => ({
      id: n.id,
      action: n.isStatusChange ? (n.action || n.type) : 'Note Added',
      author: n.author,
      timestamp: n.timestamp,
    }))
  , [allNotes]);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => { if (caseData?.status) setStatus(caseData.status); }, [caseData?.status]);
  useEffect(() => { if (caseData?.assignedAnalyst) setAssignedAnalyst(caseData.assignedAnalyst); }, [caseData?.assignedAnalyst]);
  useEffect(() => { setCaseAssignedLead(caseData?.assignedLead || null); }, [caseData?.assignedLead]);

  useEffect(() => {
    if (!notesOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        notesRef.current && !notesRef.current.contains(e.target as Node) &&
        notesBtnRef.current && !notesBtnRef.current.contains(e.target as Node)
      ) setNotesOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notesOpen]);

  useEffect(() => {
    const state = location.state as { initialCaseNote?: string } | null;
    const note = state?.initialCaseNote;
    if (note?.trim()) {
      setStatusHistory(prev => {
        const opened = prev.find(s => s.action === 'Case Opened');
        const rest   = prev.filter(s => s.id !== opened?.id);
        return opened
          ? [{ ...opened, note: note.trim() }, ...rest]
          : [{ id: 'status-0', action: 'Case Opened', author: currentUser?.name, role: currentUser?.title, timestamp: new Date().toISOString(), note: note.trim(), type: 'Status Change', content: note.trim() }, ...rest];
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────────────────
  const pushNote = (content: string, type = 'Status Change') =>
    setNotes(prev => [...prev, { id: `note-${Date.now()}`, author: currentUser?.name, role: currentUser?.title, timestamp: new Date().toISOString(), content, type, isStatusChange: type !== 'Investigation Note' }]);

  const pushStatus = (action: string, note: string) =>
    setStatusHistory(prev => [...prev, { id: `status-${Date.now()}`, action, author: currentUser?.name, role: currentUser?.title, timestamp: new Date().toISOString(), note, type: 'Status Change', content: note }]);

  const handleSubmit = () => {
    if (!submitNote.trim()) return;
    setStatus('pending-approval');
    pushNote(`Case submitted for approval to ${assignedLeadUser?.name || 'Lead'} — ${submitNote.trim()}`);
    pushStatus('Submitted for Approval', submitNote.trim());
    toast_(`Case submitted to ${assignedLeadUser?.name || 'Lead'} for review`);
    setSubmitNote(''); setShowSubmitModal(false);
  };

  const handleResubmit = () => {
    if (!submitNote.trim()) return;
    setStatus('pending-approval');
    pushNote(`Case resubmitted for approval to ${assignedLeadUser?.name || 'Lead'} — ${submitNote.trim()}`);
    pushStatus('Resubmitted for Approval', submitNote.trim());
    toast_(`Case resubmitted to ${assignedLeadUser?.name || 'Lead'} for review`);
    setSubmitNote(''); setShowResubmitModal(false);
  };

  const handleRevoke = () => {
    if (!revokeReason.trim()) return;
    setStatus('under-review');
    pushNote(`Submission revoked by ${currentUser?.name} — ${revokeReason.trim()}. Case returned to Under Review.`, 'revoked');
    pushStatus('Submission Revoked', revokeReason.trim());
    toast_('Submission revoked — case returned to Under Review');
    setRevokeReason(''); setShowRevokeModal(false);
  };

  const handleApprove = () => {
    const prefix = isSelfAssigned ? '[SELF-APPROVAL EXCEPTION] ' : '';
    const content = `${prefix}Case approved by ${currentUser?.name}${approvalNote.trim() ? ` — ${approvalNote.trim()}` : ''}`;
    setStatus('approved');
    if (isSelfAssigned) setSelfApproved(true);
    pushNote(content); pushStatus('Case Approved', content);
    toast_(`Case approved — ${caseData.assignedAnalyst} notified`);
    setApprovalNote(''); setShowApproveModal(false);
  };

  const handleReturn = () => {
    if (!returnFeedback.trim()) return;
    setStatus('returned');
    pushNote(returnFeedback.trim()); pushStatus('Case Returned', returnFeedback.trim());
    toast_(`Case returned to ${caseData.assignedAnalyst}`);
    setReturnFeedback(''); setShowReturnModal(false);
  };

  const handleAssignLead = (lu: { id: string; name: string }) => {
    setCaseAssignedLead(lu.id); setShowLeadDrop(false);
    pushNote(`Lead assigned — ${lu.name} assigned by ${currentUser?.name}`);
    pushStatus('Lead Assigned', `${lu.name} assigned by ${currentUser?.name}`);
  };

  const handleChangeLead = () => {
    const newLead = leadUsers.find(u => u.id === changeLeadSelected);
    if (!newLead) return;
    const isFirst = !caseAssignedLead;
    const wasPending = status === 'pending-approval';
    if (wasPending && !isFirst) setStatus('under-review');
    const content = wasPending && !isFirst
      ? `Lead reassigned from ${assignedLeadUser?.name} to ${newLead.name}. Case returned to Under Review.`
      : isFirst ? `Lead assigned — ${newLead.name} assigned by ${currentUser?.name}`
      : `Lead changed — from ${assignedLeadUser?.name} to ${newLead.name}${changeLeadReason ? ` — ${changeLeadReason}` : ''}`;
    setCaseAssignedLead(newLead.id);
    pushNote(content); pushStatus(isFirst ? 'Lead Assigned' : 'Lead Changed', content);
    toast_(wasPending && !isFirst ? 'Lead updated — case returned to Under Review.' : `${newLead.name} assigned as lead`);
    setShowChangeLeadModal(false); setChangeLeadSelected(''); setChangeLeadReason('');
  };

  const handleChangeAnalyst = () => {
    const newAnalyst = analystUsers.find(u => u.id === changeAnalystSelected);
    if (!newAnalyst) return;
    const prev = assignedAnalyst || caseData.assignedAnalyst;
    const content = `Analyst reassigned from ${prev} to ${newAnalyst.name}${changeAnalystReason ? ` — ${changeAnalystReason}` : ''}`;
    setAssignedAnalyst(newAnalyst.name);
    pushNote(content); pushStatus('Analyst Reassigned', content);
    toast_(`${newAnalyst.name} assigned as analyst`);
    setShowChangeAnalystModal(false); setChangeAnalystSelected(''); setChangeAnalystReason('');
  };

  const handleClose = () => {
    if (!closeReason.trim()) return;
    setStatus('closed');
    pushNote(`Case closed by ${currentUser?.name} — ${closeReason.trim()}`);
    pushStatus('Case Closed', closeReason.trim());
    setCloseReason(''); setShowCloseModal(false);
  };

  const handleReopen = () => {
    if (!reopenReason.trim()) return;
    setStatus('open');
    pushNote(`Case reopened by ${currentUser?.name} — ${reopenReason.trim()}`);
    pushStatus('Case Reopened', reopenReason.trim());
    setReopenReason(''); setShowReopenModal(false);
  };

  const handleUnarchive = () => {
    if (!unarchiveReason.trim()) return;
    setStatus('open');
    pushNote(`Case unarchived by ${currentUser?.name} — ${unarchiveReason.trim()}`);
    pushStatus('Case Unarchived', unarchiveReason.trim());
    setUnarchiveReason(''); setShowUnarchiveModal(false);
  };

  const handleArchive = () => {
    if (!archiveReason.trim()) return;
    setStatus('archived');
    pushNote(`Case archived by ${currentUser?.name} — ${archiveReason.trim()}`);
    pushStatus('Case Archived', archiveReason.trim());
    setArchiveReason(''); setShowArchiveModal(false); setShowMoreMenu(false);
  };

  const handleDelete = () => {
    if (deleteConfirm !== caseData.id) return;
    toast_('Case deleted');
    setTimeout(() => navigate('/cases'), 1500);
    setShowDeleteModal(false);
  };

  const handleAdminReassign = () => {
    if (!adminReason.trim() || !adminAnalyst || !adminLead) return;
    const newName = ANALYST_LIST.find(a => a.id === adminAnalyst)?.name || adminAnalyst;
    const newLead = leadUsers.find(u => u.id === adminLead);
    setAssignedAnalyst(newName);
    setCaseAssignedLead(adminLead);
    pushNote(`Case reassigned by ${currentUser?.name} — Analyst: ${newName}, Lead: ${newLead?.name} — ${adminReason.trim()}`);
    pushStatus('Case Reassigned', `Analyst: ${newName}, Lead: ${newLead?.name}`);
    toast_('Case successfully reassigned');
    setShowAdminReassignModal(false); setAdminAnalyst(''); setAdminLead(''); setAdminReason('');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    if (editingNoteId) {
      setNotes(prev => prev.map(n =>
        n.id === editingNoteId ? { ...n, content: newNote.trim(), edited: true } : n
      ));
      setEditingNoteId(null);
    } else {
      setNotes(prev => [{ id: `note-${Date.now()}`, author: currentUser?.name, role: currentUser?.title, timestamp: new Date().toISOString(), content: newNote.trim(), type: 'Investigation Note' }, ...prev]);
    }
    setNewNote('');
  };

  const handleEditNote = (note: NoteEntry) => {
    setEditingNoteId(note.id);
    setNewNote(note.content);
    setNotesOpen(true);
    setTimeout(() => notesComposerRef.current?.focus(), 80);
  };

  const handleDeleteNote = (noteId: string) => {
    if (editingNoteId === noteId) { setEditingNoteId(null); setNewNote(''); }
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const fmtDate   = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fmtDT     = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // ── Tab content ────────────────────────────────────────────────────────────
  const txColumns = [
    { key: 'hash',       label: 'TX Hash',    render: (v: unknown): ReactNode => <span className="font-mono text-[12px] text-[#4A5568]">{String(v).slice(0,10)}…{String(v).slice(-6)}</span> },
    { key: 'dateTime',   label: 'Date',        render: (v: unknown): ReactNode => <span className="font-mono text-[12px] text-[#4A5568]">{fmtDT(String(v))}</span> },
    { key: 'amount',     label: 'Amount',      render: (v: unknown, r: Record<string, unknown>): ReactNode => <span className="font-mono text-[14px] font-bold" style={{ color: r.type === 'Receive' ? '#10B981' : '#EF4444' }}>{r.type === 'Receive' ? '+' : '-'}{String(v)} {String(r.token)}</span> },
    { key: 'flagReason', label: 'Flag Reason', render: (v: unknown): ReactNode => v ? <span className="text-[13px] text-[#374151]">{String(v)}</span> : <span className="inline-flex items-center gap-[4px] text-[12px] text-[#9CA3AF] italic">—</span> },
    { key: 'compliance', label: 'Compliance',  render: (v: unknown): ReactNode => <StatusChip status={v as string} size="sm" /> },
  ];

  const flagColor: Record<string, string> = { Critical: '#EF4444', High: '#F97316', Medium: '#F59E0B' };

  const TABS = ['Overview', 'Transactions', 'Analysis', 'Report'];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden p-[8px] gap-[8px] box-border bg-[linear-gradient(160deg,#060C1A_0%,#0C1D3C_55%,#091630_100%)]">
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div className="flex-1 flex flex-col gap-[8px] overflow-hidden">

        <div className="flex-1 flex gap-[8px] overflow-hidden relative">

        <main className="flex-1 overflow-hidden bg-white rounded-[16px] flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_2px_8px_rgba(0,0,0,0.03),inset_0_-2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex-1 overflow-y-auto flex flex-col">

          <div className="shrink-0">
            <CaseHeader
              title={caseData.id}
              walletAddress={caseData.walletAddress}
              chips={[
                { chain: caseData.chain.toLowerCase() },
                { label: caseData.typology },
              ]}
              actions={[
                {
                  render: () => (
                    <div ref={notesBtnRef} className="relative inline-flex">
                      <Btn variant="outline" icon={MessageSquare} onClick={() => setNotesOpen(v => !v)} active={notesOpen}>
                        Notes
                      </Btn>
                      {allNotes.filter(n => !n.isStatusChange).length > 0 && (
                        <span className="absolute top-[-7px] right-[-7px] min-w-[20px] h-[20px] rounded-full bg-[#1B2D58] text-white text-[11px] font-bold flex items-center justify-center px-[5px] border-2 border-white leading-none pointer-events-none">
                          {allNotes.filter(n => !n.isStatusChange).length}
                        </span>
                      )}
                    </div>
                  ),
                },
                ...(isAssignedAnalyst && ['open', 'under-review'].includes(status)
                  ? [{ variant: 'dark' as const, icon: Send, label: 'Submit for Approval', disabled: !caseAssignedLead, onClick: () => { setSubmitNote(''); setShowSubmitModal(true); } }]
                  : []),
                ...(isAssignedAnalyst && status === 'returned'
                  ? [{ variant: 'dark' as const, icon: Send, label: 'Resubmit for Approval', disabled: !caseAssignedLead, onClick: () => { setSubmitNote(''); setShowResubmitModal(true); } }]
                  : []),
                ...(isLead && status === 'pending-approval'
                  ? [{ variant: 'danger' as const, icon: CornerDownLeft, label: 'Return', onClick: () => { setReturnFeedback(''); setShowReturnModal(true); } }]
                  : []),
                ...(isLead && status === 'pending-approval'
                  ? [{ variant: 'dark' as const, icon: CheckCircle, label: 'Approve', onClick: () => { setApprovalNote(''); setShowApproveModal(true); } }]
                  : []),
                ...(isAdmin
                  ? [{ variant: 'outline' as const, icon: RefreshCw, label: 'Reassign', onClick: () => { setAdminAnalyst(''); setAdminLead(''); setAdminReason(''); setShowAdminReassignModal(true); } }]
                  : []),
                ...(isAssignedAnalyst && !isLead && !isAdmin && status === 'pending-approval' && !hasBeenRevoked
                  ? [{ variant: 'ghost' as const, icon: RotateCcw, label: 'Revoke', onClick: () => { setRevokeReason(''); setShowRevokeModal(true); } }]
                  : []),
                ...(status === 'closed'
                  ? [{ variant: 'outline' as const, icon: RefreshCw, label: 'Reopen', onClick: () => setShowReopenModal(true) }]
                  : []),
                ...(status === 'archived'
                  ? [{ variant: 'outline' as const, icon: RotateCcw, label: 'Unarchive', onClick: () => { setUnarchiveReason(''); setShowUnarchiveModal(true); } }]
                  : []),
                { variant: 'ghost' as const, icon: MoreHorizontal, separator: true, active: showMoreMenu, onClick: () => setShowMoreMenu(v => !v) },
              ]}
              showStatusRow
              status={status}
              risk={riskLevel}
              assignedTo={{
                name: assignedAnalyst || caseData.assignedAnalyst,
                onEdit: canEditAnalyst ? () => { setChangeAnalystSelected(''); setChangeAnalystReason(''); setShowChangeAnalystModal(true); } : undefined,
                showEdit: canEditAnalyst,
              }}
              lead={
                assignedLeadUser
                  ? { name: assignedLeadUser.name, onEdit: canEditLead ? () => { setChangeLeadSelected(caseAssignedLead ?? ''); setChangeLeadReason(''); setShowChangeLeadModal(true); } : undefined, showEdit: true }
                  : canEditLead
                  ? { name: 'Unassigned — assign', onEdit: () => setShowLeadDrop(v => !v) }
                  : { name: '—' }
              }
              openedDate={fmtDate(caseData.dateOpened)}
              lastUpdated={fmtDate(caseData.lastUpdated)}
              tabs={{ items: TABS, active: activeTab, onChange: setActiveTab }}
              moreMenu={{
                open: showMoreMenu,
                onClose: () => setShowMoreMenu(false),
                items: [
                  ...((isLead || isAdmin) && !['closed', 'archived'].includes(status)
                    ? [{ label: 'Close Case', icon: XCircle, color: '#EF4444', onClick: () => setShowCloseModal(true) }]
                    : isAssignedAnalyst && !isLead && !isAdmin && ['open', 'under-review', 'pending-approval', 'returned'].includes(status)
                    ? [{ label: 'Close Case', icon: XCircle, color: '#EF4444', onClick: () => setShowCloseModal(true) }]
                    : []),
                  ...(status !== 'archived' ? [{
                    label: 'Archive Case', icon: Archive,
                    onClick: () => { setShowArchiveModal(true); },
                  }] : []),
                  {
                    label: 'Delete Case', icon: Trash2, color: '#EF4444',
                    onClick: () => { setShowDeleteModal(true); },
                  },
                ],
              }}
            />

            {selfApproved && (
              <div className="mt-[8px]">
                <span className="text-[11px] bg-[#FEF3C7] text-[#92400E] px-[10px] py-[2px] rounded-[20px] font-semibold">Self-Approved Exception</span>
              </div>
            )}

            {showLeadDrop && (
              <div className="absolute z-50 bg-white border border-[#ECEEF2] rounded-[10px] min-w-[160px] mt-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                {leadUsers.map(lu => (
                  <button key={lu.id} onClick={() => handleAssignLead(lu)}
                    className="flex items-center gap-[8px] w-full px-[14px] py-[9px] text-[13px] text-[#111827] bg-none border-none cursor-pointer text-left hover:bg-[#F8F9FB]">{lu.name}</button>
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 px-[32px] py-[24px] flex flex-col gap-[16px] bg-[linear-gradient(180deg,#F5F6FA_0%,#EAEBF0_60%,#E3E4EA_100%)]">

            {/* OVERVIEW */}
            {activeTab === 0 && (
              <div className="flex flex-col gap-[16px]">

                <Callout
                  severity={caseData.riskScore >= 90 ? 'critical' : caseData.riskScore >= 70 ? 'warning' : caseData.riskScore >= 40 ? 'info' : 'success'}
                  label="✦ AI Summary"
                >
                  The wallet at <code className="text-[12px] px-[5px] py-[1px] rounded-[4px] bg-[rgba(0,0,0,0.06)]">0x7a3d…6c7d</code> exhibits a sophisticated layering pattern consistent with sanctions evasion. Funds originating from mixer-associated clusters were bridged cross-chain via Hop Protocol and systematically fragmented across 12 sub-wallets before consolidation and transfer to a non-cooperative VASP. A direct 2-hop connection to OFAC-sanctioned address <code className="text-[12px] px-[5px] py-[1px] rounded-[4px] bg-[rgba(239,68,68,0.12)]">0x4f2a…9e1b</code> has been confirmed. Immediate escalation and SAR filing are recommended.
                </Callout>

                <div className="grid grid-cols-[repeat(5,1fr)] gap-[8px]">
                  <MetricCard label="Risk Score" value={caseData.riskScore} max={100} type="gradient-bar" color="#EF4444" />
                  <GaugeMetric value={91} label="AI Confidence" />
                  <MetricCard label="Risk Exposure" value={caseData.exposurePercent} max={100} type="vertical-bar" displayValue={`${caseData.exposurePercent}%`} color="#F97316" />
                  <MetricCard label="Hops Traced" value={HOP_TRACE.length} max={HOP_TRACE.length} type="dots" visual={{ total: HOP_TRACE.length, current: HOP_TRACE.length, colors: HOP_TRACE.map(h => hopDotColor[h.risk]) }} color="#374151" />
                  <MetricCard label="Chains" value={3} max={3} type="badges" visual={{ badges: [{ label: 'ETH', bg: '#374151' }, { label: 'ARB', bg: '#2563EB' }, { label: 'POL', bg: '#7C3AED' }] }} />
                </div>

                <div className="grid grid-cols-[1fr_1fr] gap-[16px]">
                  <DetailsCard title="Risk Indicators" layout="horizontal" items={[
                    { label: 'Sanctions', type: 'badge', badge: caseData.sanctions ? 'FLAGGED' : 'CLEAR', badgeBg: caseData.sanctions ? '#FEE2E2' : '#D1FAE5', badgeColor: caseData.sanctions ? '#B91C1C' : '#065F46' },
                    { label: 'Typology', value: caseData.typology },
                    { label: 'Exposure', type: 'progress', progress: caseData.exposurePercent || 76, value: `${caseData.exposurePercent || 76}%` },
                  ]} />
                  <DetailsCard title="On-Chain Summary" layout="horizontal" items={[
                    { label: 'First Seen',    value: caseData.firstActive  || 'Jan 3, 2024' },
                    { label: 'Last Active',   value: caseData.lastActive   || 'Feb 18, 2026' },
                    { label: 'Total Volume',  value: caseData.totalVolume  || '284,500 USDT equivalent' },
                    { label: 'Chains',        value: caseData.chainsInvolved?.join(', ') || 'Ethereum, Arbitrum, Polygon' },
                  ]} />
                </div>
              </div>
            )}

            {/* TRANSACTIONS */}
            {activeTab === 1 && (
              <div className="flex flex-col gap-[12px]">
                <div className="flex justify-between items-center">
                  <div className="flex items-baseline gap-[8px]">
                    <span className="text-[13px] font-semibold text-[#111827]">Flagged Transactions</span>
                    <span className="text-[12px] text-[#5C6578]">{flaggedTxns.length} records</span>
                  </div>
                  <Btn variant="outline" size="sm" icon={ChevronRight} onClick={() => setShowWalletOverlay(true)}>
                    View full wallet explorer
                  </Btn>
                </div>
                <div className="bg-white border border-[#ECEEF2] rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
                  <Table density="relaxed" columns={txColumns} data={flaggedTxns as unknown as Record<string, unknown>[]} />
                </div>
              </div>
            )}

            {/* ANALYSIS */}
            {activeTab === 2 && (
              <div className="grid grid-cols-[1fr_1fr] gap-[16px] items-start">
                <div className="bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-[16px]">
                  <div className="text-[14px] font-semibold text-[#111827] mb-[14px]">Hop Trace</div>
                  <div className="flex flex-col">
                    {HOP_TRACE.map((h, i) => (
                      <div key={i} className="flex gap-[12px]">
                        <div className="flex flex-col items-center w-[24px] shrink-0">
                          <div className="w-[24px] h-[24px] rounded-full text-white text-[11px] font-bold flex items-center justify-center" style={{ background: hopDotColor[h.risk] }}>{h.n}</div>
                          {i < HOP_TRACE.length - 1 && (
                            <div className="flex-1 min-h-[8px] w-0 border-l-[1.5px] border-dotted border-[#CBD5E1] mt-[4px]" />
                          )}
                        </div>
                        <div className="flex-1 flex gap-[12px] pt-[2px]" style={{ paddingBottom: i < HOP_TRACE.length - 1 ? 14 : 0 }}>
                          <div className="flex-1">
                            <div className="text-[12px] text-[#5C6578] mb-[2px]">
                              <span className="font-mono">{h.from}</span>
                              {' → '}
                              <span className="font-mono">{h.to}</span>
                            </div>
                            <div className="text-[13px] text-[#111827]">{h.action}</div>
                          </div>
                          <div className="text-[12px] font-semibold text-[#374151] font-mono whitespace-nowrap">{h.amount}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-[16px]">
                  <div className="text-[14px] font-semibold text-[#111827] mb-[14px]">Risk Flags</div>
                  <div className="flex flex-col gap-[6px]">
                    {TOP_FLAGS.map((f, i) => {
                      const col = flagColor[f.severity];
                      const isFirst = i === 0;
                      return (
                        <div key={i} className="flex gap-[10px] px-[12px] pt-[10px] pb-[10px] pl-[10px] rounded-[0_8px_8px_0] items-start" style={{ borderLeft: `3px solid ${col}`, background: isFirst ? 'rgba(239,68,68,0.04)' : 'rgba(249,115,22,0.03)' }}>
                          <AlertCircle size={13} className="shrink-0 mt-[2px]" style={{ color: col }} />
                          <div className="flex-1 min-w-0">
                            <span className="text-[13px] text-[#111827] leading-[1.5]">{f.text}</span>
                            {f.detail && (
                              <code className="block text-[11px] font-mono mt-[3px] opacity-75" style={{ color: col }}>{f.detail}</code>
                            )}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.06em] px-[8px] py-[2px] rounded-full shrink-0 self-start mt-[1px]" style={{ background: isFirst ? '#FEE2E2' : '#FFEDD5', color: col }}>{f.severity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* REPORT */}
            {activeTab === 3 && (
              <div className="flex flex-col">
                <div className="flex items-center justify-end gap-[10px] pb-[14px] mb-[16px] border-b border-[#ECEEF2]">
                  <div className="flex border border-[#ECEEF2] rounded-[8px] p-[3px] bg-white gap-[2px] mr-auto">
                    {(['basic', 'analysis', 'full'] as const).map(t => (
                      <Btn key={t} variant="segment" size="sm" active={reportType === t} onClick={() => setReportType(t)}>
                        {t === 'basic' ? 'Basic' : t === 'analysis' ? 'Analysis' : 'Full'}
                      </Btn>
                    ))}
                  </div>
                  <Btn variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>Print</Btn>
                  <Btn variant="dark" size="sm" icon={Download} onClick={() => { /* TODO: wire to PDF export API */ }}>Export PDF</Btn>
                </div>

                <div className="max-w-[800px] mx-auto w-full bg-white border border-[#ECEEF2] rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="px-[40px] py-[32px]">

                    <div className="bg-[#F9FAFB] rounded-[8px] p-[24px] mb-[32px]">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-[8px]">
                          <img src={logo} alt="TraceAgent" className="h-[32px]" />
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6578]">
                            {reportType === 'basic' ? 'Basic' : reportType === 'analysis' ? 'Analysis' : 'Full'} Investigative Report
                          </div>
                          <div className="text-[11px] text-[#5C6578] mt-[3px]">Generated: Feb 27, 2026 at 14:32 UTC</div>
                          <div className="text-[11px] text-[#5C6578]">Generated by: James Analyst — Senior Analyst</div>
                        </div>
                      </div>
                      <div className="pt-[16px] mt-[16px] border-t border-[#E5E7EB]">
                        <div className="text-[20px] font-bold text-[#111827] mb-[4px]">Case ID: {caseData.id}</div>
                        <div className="font-mono text-[12px] text-[#374151] mb-[10px]">Subject: {caseData.walletAddress}</div>
                        <div className="flex flex-wrap items-center gap-[10px]">
                          <span className="text-[12px] text-[#374151]">Chain: {caseData.chain}</span>
                          <span className="text-[11px] font-bold bg-[#FEE2E2] text-[#B91C1C] px-[10px] py-[2px] rounded-[20px]">CRITICAL</span>
                          <span className="text-[12px] text-[#374151]">Typology: {caseData.typology}</span>
                        </div>
                      </div>
                    </div>

                    {/* Analysis metrics */}
                    <div className="border-t border-[#E5E7EB] pt-[20px] mb-[28px]">
                      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-[14px]">
                        Analysis Complete
                      </div>
                      {reportType === 'basic' ? (
                        <div className="grid grid-cols-[1fr_1fr] gap-[12px]">
                          <MetricCard label="Risk Score"    value={91} max={100} type="gradient-bar" compact />
                          <MetricCard label="AI Confidence" value={88} max={100} type="vertical-bar"  displayValue="88%" compact />
                          <MetricCard label="Hops Traced"   value={5}  max={100} type="dots"          compact visual={{ total: 7, current: 5, colors: ['#22C55E','#F59E0B','#F59E0B','#EF4444','#EF4444'] }} />
                          <MetricCard label="Chains"        value={2}  max={100} type="badges"        compact visual={{ badges: [{ label: 'ETH', bg: '#454A75' }, { label: 'MATIC', bg: '#7B3FE4' }] }} />
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-[repeat(3,1fr)] gap-[12px] mb-[12px]">
                            <MetricCard label="Risk Score"    value={94} max={100} type="gradient-bar" />
                            <MetricCard label="AI Confidence" value={91} max={100} type="gauge"        displayValue="91%" />
                            <MetricCard label="Risk Exposure" value={94} max={100} type="vertical-bar" displayValue="94%" />
                          </div>
                          <div className="grid grid-cols-[repeat(2,1fr)] gap-[12px]">
                            <MetricCard label="Hops Traced" value={7} max={100} type="dots" visual={{ total: 9, current: 7, colors: ['#F97316','#F97316','#2D3142','#F97316','#F97316','#2D3142','#EF4444'] }} />
                            <MetricCard label="Chains"      value={3} max={100} type="badges" visual={{ badges: [{ label: 'ETH', bg: '#454A75' }, { label: 'ARB', bg: '#2B6CB0' }, { label: 'POL', bg: '#7B3FE4' }] }} />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="border-t border-[#E5E7EB] pt-[24px] mb-[28px]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C6578] mb-[12px]">01 — Executive Summary</div>
                      <p className="text-[13px] leading-[1.75] text-[#374151] m-0">
                        Wallet {caseData.walletAddress} was identified as high-risk following autonomous multi-chain tracing initiated on February 27, 2026. The subject wallet received 284.50 ETH from a mixer-associated cluster and executed systematic cross-chain layering via Hop Protocol bridge. TraceAgent confirmed a 2-hop connection to OFAC-sanctioned address 0x4f2a…9e1b. Transaction frequency of 200/hr is inconsistent with declared retail trader profile. Case escalated for SAR filing with FinCEN.
                      </p>
                    </div>

                    <div className="border-t border-[#E5E7EB] pt-[24px] mb-[28px]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C6578] mb-[6px]">02 — Fund Flow Trace</div>
                      <div className="text-[12px] text-[#5C6578] mb-[16px]">{REPORT_HOPS.length} hops traced across 3 chains — Ethereum, Arbitrum, Polygon</div>
                      <div className="flex flex-col gap-[14px]">
                        {REPORT_HOPS.map(hop => (
                          <div key={hop.n} className="flex gap-[12px] items-start">
                            <div className="w-[24px] h-[24px] rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0" style={{ background: hopDotColor[HOP_TRACE[hop.n - 1]?.risk ?? 'neutral'] }}>
                              {String(hop.n).padStart(2, '0')}
                            </div>
                            <div className="flex-1">
                              <div className="font-mono text-[11px] text-[#374151]">{hop.from} → {hop.to} | {hop.amount}</div>
                              <div className="text-[13px] text-[#374151] mt-[2px]">{hop.action}</div>
                              <div className="flex items-center gap-[8px] mt-[4px]">
                                <span className="text-[11px] bg-[#F3F4F6] text-[#374151] px-[8px] py-[1px] rounded-[4px] font-medium">{hop.chain}</span>
                                {hop.n === 7 && <span className="text-[11px] text-[#EF4444] font-semibold">● Final destination</span>}
                                {hop.n !== 7 && hop.warn && <span className="text-[11px] text-[#F59E0B] font-semibold">⚠ Flagged</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-[#E5E7EB] pt-[24px] mb-[28px]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C6578] mb-[16px]">03 — Risk Flags &amp; Indicators</div>
                      <div className="flex flex-col gap-[20px]">
                        {[
                          { sev: 'CRITICAL', color: '#EF4444', title: 'SANCTIONS EXPOSURE',    body: 'Direct 2-hop connection to OFAC-sanctioned address 0x4f2a...9e1b. Source: OFAC SDN List March 2024. Constitutes reportable sanctions exposure under 31 CFR Part 501.', evidence: '0xf0e1d2c3...8f7a6b5c' },
                          { sev: 'HIGH',     color: '#F97316', title: 'TECHNICAL OBFUSCATION', body: 'Non-custodial mixer combined with cross-chain bridge usage across 3 networks within 47 minutes. Consistent with professional money laundering tradecraft.', evidence: 'Hops 1–3 above' },
                          { sev: 'HIGH',     color: '#F97316', title: 'BEHAVIORAL ANOMALY',    body: 'Transaction frequency 200/hr inconsistent with declared retail trader profile. Automated execution strongly suggested. Matches FinCEN FIN-2023-A001.', evidence: 'Transaction cluster Jan 13, 2024' },
                        ].map((f, i) => (
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

                    {['analysis', 'full'].includes(reportType) && (
                      <div className="border-t border-[#E5E7EB] pt-[24px] mb-[28px]">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C6578] mb-[16px]">04 — Risk Assessment</div>
                        <div className="flex flex-col gap-[16px]">
                          {([
                            ['Compliance Rationale',   'Deliberate fund fragmentation across 12 wallets combined with cross-chain bridging in compressed timeframe indicates calculated attempt to defeat automated monitoring systems.'],
                            ['Threat Actor Assessment', 'Technical sophistication, mixer-adjacent infrastructure, and non-cooperative VASP destination suggest professionally managed operation or state-sponsored actor bypassing economic sanctions.'],
                            ['Regulatory Impact',       'Failure to freeze and report constitutes violation of FinCEN 2024 Stablecoin Guidance and OFAC regulations. Immediate SAR filing recommended.'],
                          ] as [string, string][]).map(([label, text]) => (
                            <div key={label}>
                              <div className="text-[13px] font-semibold text-[#111827] mb-[4px]">{label}:</div>
                              <p className="text-[13px] text-[#374151] leading-[1.65] m-0">{text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {['analysis', 'full'].includes(reportType) && (
                      <div className="border-t border-[#E5E7EB] pt-[24px] mb-[28px]">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C6578] mb-[16px]">05 — Analyst Notes</div>
                        <div className="flex flex-col">
                          {mockCaseNotes.map((note, i) => (
                            <div key={note.id} className="pb-[16px] mb-[16px]" style={{ borderBottom: i < mockCaseNotes.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                              <div className="flex justify-between items-start mb-[4px]">
                                <span className="text-[13px] font-semibold text-[#111827]">{note.author} — {note.role}</span>
                                <span className="text-[11px] text-[#5C6578]">{new Date(note.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-[13px] text-[#374151] leading-[1.65] m-0">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {reportType === 'full' && (
                      <div className="border-t border-[#E5E7EB] pt-[24px] mb-[28px]">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C6578] mb-[16px]">06 — Chain of Custody</div>
                        <table className="w-full border-collapse text-[12px]">
                          <thead>
                            <tr className="border-b border-[#E5E7EB]">
                              {['Timestamp', 'Action', 'Performed By', 'Details'].map(h => (
                                <th key={h} className="text-left pr-[12px] pt-[6px] pb-[8px] text-[11px] font-semibold text-[#5C6578]">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {CHAIN_OF_CUSTODY.map((row, i) => (
                              <tr key={i} className="border-b border-[#F3F4F6]" style={{ background: i % 2 === 1 ? '#FAFAFA' : 'transparent' }}>
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

                    <div className="border-t border-[#E5E7EB] pt-[20px] text-center text-[11px] text-[#5C6578]">
                      Generated by TraceAgent — Trace Layer Inc. | CONFIDENTIAL — Regulatory Use Only | Case {caseData.id}
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>{/* closes body */}
          </div>{/* closes inner scroll wrapper */}
        </main>

        {/* Notes Overlay */}
        {notesOpen && (
          <div ref={notesRef} className="absolute top-0 right-0 bottom-0 w-[360px] z-50 flex flex-col bg-white overflow-hidden rounded-tr-[16px] rounded-br-[16px] border-l border-[#ECEEF2] shadow-[-6px_0_28px_rgba(0,0,0,0.09),-1px_0_4px_rgba(0,0,0,0.04)]">

            <div className="px-[20px] py-[16px] flex items-center justify-between shrink-0 border-b border-[#ECEEF2]">
              <div className="flex items-center gap-[8px]">
                <MessageSquare size={14} className="text-[#1B2D58]" />
                <span className="text-[14px] font-bold text-[#0A0A0F]">Investigation Notes</span>
                <span className="text-[12px] font-bold bg-[rgba(27,45,88,0.08)] text-[#1B2D58] px-[9px] py-[3px] rounded-full leading-[1.4]">
                  {allNotes.filter(n => !n.isStatusChange).length}
                </span>
              </div>
              <GhostIcon icon={X} size="sm" onClick={() => setNotesOpen(false)} />
            </div>

            <div className="flex-1 overflow-y-auto py-[10px]">
              {allNotes.length === 0 ? (
                <p className="text-[12px] text-[#9CA3AF] text-center px-[20px] py-[24px] m-0">No notes yet — add one below</p>
              ) : (
                allNotes.map(n => (
                  <ThreadNote
                    key={n.id}
                    note={n}
                    isAudit={!!n.isStatusChange}
                    onEdit={!n.isStatusChange && n.type === 'Investigation Note' ? handleEditNote : undefined}
                    onDelete={!n.isStatusChange && n.type === 'Investigation Note' ? handleDeleteNote : undefined}
                  />
                ))
              )}
            </div>

            <div className="shrink-0 border-t border-[#ECEEF2]">
              <button
                type="button"
                onClick={() => setAuditTrailExpanded(v => !v)}
                className="w-full flex items-center gap-[8px] px-[16px] py-[10px] bg-none border-none cursor-pointer text-left"
              >
                <Clock size={14} className="text-[#9CA3AF] shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] flex-1">Audit Trail</span>
                {auditTrailExpanded
                  ? <ChevronDown size={14} className="text-[#9CA3AF]" />
                  : <ChevronRight size={14} className="text-[#9CA3AF]" />}
              </button>
              {auditTrailExpanded && (
                <div className="px-[16px] pt-[2px] pb-[12px] flex flex-col gap-[7px]">
                  {auditEntries.map(e => (
                    <div key={e.id} className="flex items-center gap-[8px]">
                      <span className="w-[5px] h-[5px] rounded-full bg-[#D1D5DB] shrink-0" />
                      <span className="text-[11px] text-[#374151] flex-1">{e.action} — {e.author}</span>
                      <span className="text-[10px] text-[#5C6578] font-mono whitespace-nowrap">
                        {new Date(e.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!['archived', 'closed'].includes(status) && (
              <div className="border-t border-[#ECEEF2] px-[16px] py-[12px] shrink-0 bg-[#FAFBFC]">
                <style>{`.notes-ta::placeholder{color:#B0B8C8;}`}</style>
                {editingNoteId && (
                  <div className="flex items-center justify-between mb-[8px] px-[9px] py-[5px] bg-[rgba(22,48,64,0.05)] border border-[rgba(22,48,64,0.12)] rounded-[7px]">
                    <span className="text-[10px] text-[#1B2D58] flex items-center gap-[5px]">
                      <Pencil size={9} /> Editing note
                    </span>
                    <button onClick={() => { setEditingNoteId(null); setNewNote(''); }} className="bg-none border-none cursor-pointer text-[#9CA3AF] text-[13px] px-[2px] leading-[1]">×</button>
                  </div>
                )}
                <textarea
                  ref={notesComposerRef}
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleAddNote(); }}
                  placeholder={editingNoteId ? 'Edit your note…' : 'Add investigation note…'}
                  className="notes-ta w-full resize-none rounded-[10px] px-[12px] py-[10px] text-[13px] text-[#0A0A0F] font-[inherit] outline-none box-border leading-[1.5] transition-[border,background,box-shadow] duration-150 border border-[#D1D5DB] bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#B0BCC8] focus:border-[#4B7AC7] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.10),0_1px_4px_rgba(0,0,0,0.05)] [caret-color:#1B2D58]"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-[10px]">
                  <span className="text-[11px] text-[#9CA3AF]">⌘↵ to {editingNoteId ? 'save' : 'post'}</span>
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-[16px] py-[7px] border-none rounded-[8px] text-[12px] font-bold font-[inherit] transition-colors duration-150"
                    style={{ background: newNote.trim() ? '#1B2D58' : '#E5E7EB', color: newNote.trim() ? '#FFFFFF' : '#9CA3AF', cursor: newNote.trim() ? 'pointer' : 'default' }}
                  >
                    {editingNoteId ? 'Save' : 'Post'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        </div>{/* end bottom row */}
      </div>

      <Toast {...toastState} />

      {/* Modals */}
      <Modal open={showSubmitModal} theme="light" title="Submit for Approval" onClose={() => setShowSubmitModal(false)}>
        <p className="text-[13px] text-[#5C6578] mb-[12px]">Submitting to <strong>{assignedLeadUser?.name || 'Lead'}</strong>. Provide a summary of your findings.</p>
        <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Summary *</label>
        <TA value={submitNote} onChange={setSubmitNote} placeholder="Sanctions match confirmed — recommend SAR filing…" />
        <div className="flex justify-end gap-[8px] mt-[16px]">
          <Btn variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleSubmit} disabled={!submitNote.trim()}>Submit</Btn>
        </div>
      </Modal>

      <Modal open={showResubmitModal} theme="light" title="Resubmit for Approval" onClose={() => setShowResubmitModal(false)}>
        <p className="text-[13px] text-[#5C6578] mb-[12px]">Resubmitting to <strong>{assignedLeadUser?.name || 'Lead'}</strong>. Describe what was addressed.</p>
        <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Update Summary *</label>
        <TA value={submitNote} onChange={setSubmitNote} placeholder="Addressed lead feedback — additional evidence attached…" />
        <div className="flex justify-end gap-[8px] mt-[16px]">
          <Btn variant="outline" onClick={() => setShowResubmitModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleResubmit} disabled={!submitNote.trim()}>Resubmit</Btn>
        </div>
      </Modal>

      <Modal open={showRevokeModal} theme="light" title="Revoke Submission" onClose={() => setShowRevokeModal(false)}>
        <p className="text-[13px] text-[#B45309] mb-[12px]">This will return the case to Under Review. You can only revoke once.</p>
        <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Reason *</label>
        <TA value={revokeReason} onChange={setRevokeReason} placeholder="Need to add additional evidence before review…" />
        <div className="flex justify-end gap-[8px] mt-[16px]">
          <Btn variant="outline" onClick={() => setShowRevokeModal(false)}>Cancel</Btn>
          <Btn variant="secondary" onClick={handleRevoke} disabled={!revokeReason.trim()}>Revoke</Btn>
        </div>
      </Modal>

      <Modal open={showApproveModal} theme="light" title="Approve Case" onClose={() => setShowApproveModal(false)}>
        {isSelfAssigned && (
          <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-[8px] px-[12px] py-[10px] mb-[12px] text-[12px] text-[#92400E]">
            ⚠ You are approving your own case. This exception will be logged.
          </div>
        )}
        <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Approval Note (optional)</label>
        <TA value={approvalNote} onChange={setApprovalNote} placeholder="Case meets all requirements for SAR filing…" rows={3} />
        <div className="flex justify-end gap-[8px] mt-[16px]">
          <Btn variant="outline" onClick={() => setShowApproveModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleApprove}>Approve</Btn>
        </div>
      </Modal>

      <Modal open={showReturnModal} theme="light" title="Return to Analyst" onClose={() => setShowReturnModal(false)}>
        <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Feedback *</label>
        <TA value={returnFeedback} onChange={setReturnFeedback} placeholder="Please provide additional on-chain evidence for hops 3-5…" />
        <div className="flex justify-end gap-[8px] mt-[16px]">
          <Btn variant="outline" onClick={() => setShowReturnModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleReturn} disabled={!returnFeedback.trim()}>Return</Btn>
        </div>
      </Modal>

      <Modal open={showCloseModal} theme="light" title="Close Case" onClose={() => setShowCloseModal(false)}>
        <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Reason *</label>
        <TA value={closeReason} onChange={setCloseReason} placeholder="SAR filed — case resolved…" />
        <div className="flex justify-end gap-[8px] mt-[16px]">
          <Btn variant="outline" onClick={() => setShowCloseModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleClose} disabled={!closeReason.trim()}>Close Case</Btn>
        </div>
      </Modal>

      <Modal open={showReopenModal} theme="light" title="Reopen Case" onClose={() => setShowReopenModal(false)}>
        <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Reason *</label>
        <TA value={reopenReason} onChange={setReopenReason} placeholder="New evidence identified…" />
        <div className="flex justify-end gap-[8px] mt-[16px]">
          <Btn variant="outline" onClick={() => setShowReopenModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleReopen} disabled={!reopenReason.trim()}>Reopen</Btn>
        </div>
      </Modal>

      <Modal open={showUnarchiveModal} theme="light" title="Unarchive Case" onClose={() => setShowUnarchiveModal(false)}>
        <p className="text-[13px] text-[#6B7280] leading-[1.55] m-0 mb-[20px]">
          This case will be restored to active status and reassigned for investigation.
        </p>
        <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Reason *</label>
        <TA value={unarchiveReason} onChange={setUnarchiveReason} placeholder="New evidence discovered…" />
        <div className="flex justify-end gap-[8px] mt-[16px]">
          <Btn variant="outline" onClick={() => setShowUnarchiveModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleUnarchive} disabled={!unarchiveReason.trim()}>Unarchive</Btn>
        </div>
      </Modal>

      <Modal open={showArchiveModal} theme="light" title="Archive Case" onClose={() => setShowArchiveModal(false)}>
        <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Reason *</label>
        <TA value={archiveReason} onChange={setArchiveReason} placeholder="Case resolved and archived per retention policy…" />
        <div className="flex justify-end gap-[8px] mt-[16px]">
          <Btn variant="outline" onClick={() => setShowArchiveModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleArchive} disabled={!archiveReason.trim()}>Archive</Btn>
        </div>
      </Modal>

      <Modal open={showDeleteModal} theme="light" title="Delete Case" onClose={() => setShowDeleteModal(false)}>
        <p className="text-[13px] text-[#EF4444] mb-[12px]">This is irreversible. Type <strong>{caseData.id}</strong> to confirm.</p>
        <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Confirm Case ID</label>
        <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={caseData.id}
          className="w-full h-[38px] bg-white border border-[#D1D5DB] rounded-[10px] px-[14px] py-[9px] text-[13px] text-[#111827] outline-none box-border mb-[12px] transition-[border-color,box-shadow] duration-150 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#B0BCC8] focus:border-[#4B7AC7] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.10),0_1px_4px_rgba(0,0,0,0.05)]"
        />
        <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Reason *</label>
        <TA value={deleteReason} onChange={setDeleteReason} placeholder="Duplicate case entry…" rows={2} />
        <div className="flex justify-end gap-[8px] mt-[16px]">
          <Btn variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleDelete} disabled={deleteConfirm !== caseData.id || !deleteReason.trim()}>Delete Forever</Btn>
        </div>
      </Modal>

      <Modal open={showChangeLeadModal} theme="light" title="Change Lead" onClose={() => setShowChangeLeadModal(false)}>
        <p className="text-[13px] text-[#6B7280] leading-[1.55] m-0 mb-[20px]">
          The selected lead becomes the approver for this case and will be notified when you submit for approval.
        </p>
        <div className="flex flex-col gap-[16px]">
          <div>
            <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">New Lead *</label>
            <CustomSelect
              value={changeLeadSelected}
              onChange={setChangeLeadSelected}
              placeholder="Select lead…"
              options={leadUsers.map(u => ({ value: u.id, label: u.name }))}
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Reason (optional)</label>
            <TA value={changeLeadReason} onChange={setChangeLeadReason} placeholder="Workload balancing…" rows={2} />
          </div>
        </div>
        <div className="flex justify-end gap-[8px] mt-[20px]">
          <Btn variant="outline" onClick={() => setShowChangeLeadModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleChangeLead} disabled={!changeLeadSelected}>Confirm</Btn>
        </div>
      </Modal>

      <Modal open={showChangeAnalystModal} theme="light" title="Change Analyst" onClose={() => setShowChangeAnalystModal(false)}>
        <p className="text-[13px] text-[#6B7280] leading-[1.55] m-0 mb-[20px]">
          The new analyst will take over the investigation and will be notified of the reassignment.
        </p>
        <div className="flex flex-col gap-[16px]">
          <div>
            <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">New Analyst *</label>
            <CustomSelect
              value={changeAnalystSelected}
              onChange={setChangeAnalystSelected}
              placeholder="Select analyst…"
              options={analystUsers.map(u => ({ value: u.id, label: u.name }))}
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Reason (optional)</label>
            <TA value={changeAnalystReason} onChange={setChangeAnalystReason} placeholder="Workload balancing, conflict of interest…" rows={2} />
          </div>
        </div>
        <div className="flex justify-end gap-[8px] mt-[20px]">
          <Btn variant="outline" onClick={() => setShowChangeAnalystModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleChangeAnalyst} disabled={!changeAnalystSelected}>Confirm</Btn>
        </div>
      </Modal>

      <Modal open={showAdminReassignModal} theme="light" title="Reassign Case" onClose={() => setShowAdminReassignModal(false)} size="lg">
        <div className="grid grid-cols-[1fr_1fr] gap-[12px] mb-[12px]">
          <div>
            <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">New Analyst *</label>
            <CustomSelect
              value={adminAnalyst}
              onChange={setAdminAnalyst}
              placeholder="Select…"
              options={ANALYST_LIST.map(a => ({ value: a.id, label: a.name }))}
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">New Lead *</label>
            <CustomSelect
              value={adminLead}
              onChange={setAdminLead}
              placeholder="Select…"
              options={leadUsers.map(u => ({ value: u.id, label: u.name }))}
            />
          </div>
        </div>
        <label className="text-[12px] font-semibold text-[#5C6578] mb-[6px] block">Reason *</label>
        <TA value={adminReason} onChange={setAdminReason} placeholder="Specialist expertise required…" />
        <div className="flex justify-end gap-[8px] mt-[16px]">
          <Btn variant="outline" onClick={() => setShowAdminReassignModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleAdminReassign} disabled={!adminAnalyst || !adminLead || !adminReason.trim()}>Reassign</Btn>
        </div>
      </Modal>

      {showWalletOverlay && (
        <WalletOverlay
          walletAddress={caseData.walletAddress}
          caseId={caseData.id}
          onClose={() => setShowWalletOverlay(false)}
        />
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface NoteEntry2 {
  id: string;
  author?: string;
  role?: string;
  timestamp: string;
  content: string;
  type: string;
  isStatusChange?: boolean;
  action?: string;
  note?: string;
  edited?: boolean;
}

interface ThreadNoteProps {
  note: NoteEntry2;
  isAudit: boolean;
  onEdit?: (note: NoteEntry2) => void;
  onDelete?: (id: string) => void;
}

function ThreadNote({ note, isAudit, onEdit, onDelete }: ThreadNoteProps) {
  const [hov, setHov] = useState(false);

  if (isAudit) {
    return (
      <div className="px-[14px] pt-[6px] pb-[10px] select-none">
        <div className="flex items-center gap-[8px]">
          <div className="flex-1 h-[1px] bg-[#F0F2F7]" />
          <span className="text-[10px] text-[#9CA3AF] tracking-[0.02em] text-center max-w-[76%] leading-[1.45] bg-[#F5F7FA] px-[9px] py-[3px] rounded-[20px] border border-[#E5E7EB]">
            {note.content}
          </span>
          <div className="flex-1 h-[1px] bg-[#F0F2F7]" />
        </div>
        <div className="text-center text-[9px] text-[#B0B8C8] mt-[4px] font-mono">
          {note.author} · {new Date(note.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  }

  const roleColor = note.role?.toLowerCase().includes('lead') || note.role?.toLowerCase().includes('manager')
    ? '#8B5CF6' : '#3B82F6';
  const initials  = note.author?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative pt-[8px] pr-[14px] pb-[8px] pl-[11px] mb-[6px] mx-[14px] rounded-[0_8px_8px_0] transition-[background] duration-[120ms]"
      style={{
        borderLeft: `3px solid ${roleColor}`,
        background: hov ? '#F8FAFC' : '#FFFFFF',
      }}
    >
      {hov && (onEdit || onDelete) && (
        <div className="absolute top-[7px] right-[8px] flex gap-[4px]">
          {onEdit && (
            <button
              onClick={() => onEdit(note)}
              title="Edit note"
              className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-[5px] cursor-pointer px-[5px] py-[3px] flex items-center text-[#9CA3AF] transition-all duration-[120ms]"
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(27,45,88,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#1B2D58'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(27,45,88,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; }}
            >
              <Pencil size={9} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(note.id)}
              title="Delete note"
              className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-[5px] cursor-pointer px-[5px] py-[3px] flex items-center text-[#9CA3AF] transition-all duration-[120ms]"
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; }}
            >
              <Trash2 size={9} />
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-[7px] mb-[3px]">
        <div className="w-[20px] h-[20px] rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0" style={{ background: roleColor }}>{initials}</div>
        <span className="text-[12px] font-semibold text-[#111827]">{note.author}</span>
      </div>
      {note.role && (
        <div className="text-[10px] text-[#5C6578] mb-[5px] pl-[27px]">{note.role}</div>
      )}
      <div className="text-[12px] text-[#374151] leading-[1.55] pl-[27px]">{note.content}</div>
      <div className="flex items-center gap-[8px] mt-[5px] pl-[27px]">
        <span className="text-[10px] text-[#B0B8C8] font-mono">
          {new Date(note.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
        {note.edited && (
          <span className="text-[9px] text-[#CBD5E1] italic">Edited</span>
        )}
      </div>
    </div>
  );
}

