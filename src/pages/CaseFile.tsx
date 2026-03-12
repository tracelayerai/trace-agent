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
import { SURFACE, INPUT, TABLE, COLORS, SHADOWS } from '@/tokens/designTokens';
import { useAuth, MOCK_USERS, ROLES } from '@/context/AuthContext';
import { mockCases } from '@/data/mock/cases';
import { mockTransactions } from '@/data/mock/transactions';
import type { Transaction } from '@/data/mock/transactions';
import { mockCaseNotes, mockStatusHistory } from '@/data/mock/caseNotes';
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
const TA_BASE: React.CSSProperties = {
  width: '100%', background: INPUT.bg as string, border: INPUT.border as string,
  borderRadius: INPUT.borderRadius as number, padding: INPUT.padding as string,
  fontSize: 13, color: INPUT.color as string, resize: 'vertical', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5,
  transition: INPUT.transition as string, boxShadow: INPUT.shadow as string,
};

interface TAProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}

function TA({ value, onChange, placeholder, rows = 4 }: TAProps) {
  const [hov, setHov] = useState(false);
  const [foc, setFoc] = useState(false);
  const stateStyle: React.CSSProperties = foc
    ? { border: INPUT.focus.border as string, boxShadow: INPUT.focus.shadow as string }
    : hov
    ? { border: INPUT.hover.border as string, boxShadow: INPUT.hover.shadow as string }
    : { border: INPUT.border as string, boxShadow: INPUT.shadow as string };
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setFoc(true)}
      onBlur={() => setFoc(false)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...TA_BASE, ...stateStyle }}
    />
  );
}

const LBL: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: COLORS.text.light as string, marginBottom: 6, display: 'block' };


const moreItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
  padding: '9px 14px', fontSize: 13, color: COLORS.text.dark as string,
  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
};

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
  const [notesFieldHov, setNotesFieldHov] = useState(false);
  const [notesFieldFocus, setNotesFieldFocus] = useState(false);
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
    { key: 'hash',       label: 'TX Hash',    render: (v: unknown): ReactNode => <span style={TABLE.cell.mono as React.CSSProperties}>{String(v).slice(0,10)}…{String(v).slice(-6)}</span> },
    { key: 'dateTime',   label: 'Date',        render: (v: unknown): ReactNode => <span style={TABLE.cell.mono as React.CSSProperties}>{fmtDT(String(v))}</span> },
    { key: 'amount',     label: 'Amount',      render: (v: unknown, r: Record<string, unknown>): ReactNode => <span style={{ ...(TABLE.cell.numeric as React.CSSProperties), color: r.type === 'Receive' ? '#10B981' : '#EF4444' }}>{r.type === 'Receive' ? '+' : '-'}{String(v)} {String(r.token)}</span> },
    { key: 'flagReason', label: 'Flag Reason', render: (v: unknown): ReactNode => v ? <span style={TABLE.cell.plain as React.CSSProperties}>{String(v)}</span> : <span style={TABLE.cell.muted as React.CSSProperties}>—</span> },
    { key: 'compliance', label: 'Compliance',  render: (v: unknown): ReactNode => <StatusChip status={v as string} size="sm" /> },
  ];

  const flagColor: Record<string, string> = { Critical: '#EF4444', High: '#F97316', Medium: '#F59E0B' };

  const selStyle: React.CSSProperties = {
    width: '100%', background: INPUT.bg as string, border: INPUT.border as string,
    borderRadius: INPUT.borderRadius as number, padding: INPUT.padding as string,
    fontSize: 13, color: INPUT.color as string, outline: 'none', height: INPUT.height as number,
    boxShadow: INPUT.shadow as string, transition: INPUT.transition as string, boxSizing: 'border-box',
  };

  const fieldEvents = {
    onMouseEnter: (e: React.MouseEvent<HTMLInputElement>) => Object.assign(e.currentTarget.style, { border: INPUT.hover.border, boxShadow: INPUT.hover.shadow }),
    onMouseLeave: (e: React.MouseEvent<HTMLInputElement>) => Object.assign(e.currentTarget.style, { border: INPUT.border, boxShadow: INPUT.shadow }),
    onFocus:      (e: React.FocusEvent<HTMLInputElement>) => Object.assign(e.currentTarget.style, { border: INPUT.focus.border, boxShadow: INPUT.focus.shadow }),
    onBlur:       (e: React.FocusEvent<HTMLInputElement>) => Object.assign(e.currentTarget.style, { border: INPUT.border, boxShadow: INPUT.shadow }),
  };

  const TABS = ['Overview', 'Transactions', 'Analysis', 'Report'];

  const SF = SURFACE.frame as unknown as { bg: string; padding: number | string; borderRadius: number };
  const SC = SURFACE.content as unknown as { bg: string; bodyBg: string; borderRadius: number | string; shadow: string; padding: number | string };
  const SP = SURFACE.panel as unknown as { bg: string; border: string; borderRadius: number | string; shadow: string };
  const SCard = SURFACE.card as unknown as { bg: string; border: string; borderRadius: number | string; shadow: string; padding: number | string };
  const CL = COLORS as unknown as { text: { dark: string; light: string; body: string } };
  const SO = SURFACE.overlay as unknown as {
    width: number | string; bg: string; borderLeft: string; shadow: string; separator: string;
    header: { padding: number | string; titleSize: number; titleWeight: number; titleColor: string; subtitleSize: number; subtitleColor: string };
    body: { padding: number | string };
    footer: { padding: number | string; bg: string };
    close: { color: string };
    bodyText: React.CSSProperties;
    sectionLabel: React.CSSProperties;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: SF.bg, padding: SF.padding, gap: SF.padding, boxSizing: 'border-box' }}>
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: SF.padding, overflow: 'hidden' }}>

        <div style={{ flex: 1, display: 'flex', gap: SF.padding, overflow: 'hidden', position: 'relative' }}>

        <main style={{ flex: 1, overflow: 'hidden', background: SC.bg, borderRadius: SC.borderRadius, boxShadow: SC.shadow, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          <div style={{ flexShrink: 0 }}>
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
                    <div ref={notesBtnRef} style={{ position: 'relative', display: 'inline-flex' }}>
                      <Btn variant="outline" icon={MessageSquare} onClick={() => setNotesOpen(v => !v)} active={notesOpen}>
                        Notes
                      </Btn>
                      {allNotes.filter(n => !n.isStatusChange).length > 0 && (
                        <span style={{ position: 'absolute', top: -7, right: -7, minWidth: 20, height: 20, borderRadius: 9999, background: '#1B2D58', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', border: '2px solid #fff', lineHeight: 1, pointerEvents: 'none' }}>
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
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 11, background: '#FEF3C7', color: '#92400E', padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>Self-Approved Exception</span>
              </div>
            )}

            {showLeadDrop && (
              <div style={{ position: 'absolute', zIndex: 50, background: '#fff', border: SP.border, borderRadius: 10, boxShadow: (SHADOWS as unknown as { elevated: string }).elevated, minWidth: 160, marginTop: 4 }}>
                {leadUsers.map(lu => (
                  <button key={lu.id} onClick={() => handleAssignLead(lu)} style={moreItemStyle}>{lu.name}</button>
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ flex: 1, background: SC.bodyBg, padding: SC.padding, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* OVERVIEW */}
            {activeTab === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <Callout
                  severity={caseData.riskScore >= 90 ? 'critical' : caseData.riskScore >= 70 ? 'warning' : caseData.riskScore >= 40 ? 'info' : 'success'}
                  label="✦ AI Summary"
                >
                  The wallet at <code style={{ fontSize: 12, padding: '1px 5px', borderRadius: 4, background: 'rgba(0,0,0,0.06)' }}>0x7a3d…6c7d</code> exhibits a sophisticated layering pattern consistent with sanctions evasion. Funds originating from mixer-associated clusters were bridged cross-chain via Hop Protocol and systematically fragmented across 12 sub-wallets before consolidation and transfer to a non-cooperative VASP. A direct 2-hop connection to OFAC-sanctioned address <code style={{ fontSize: 12, padding: '1px 5px', borderRadius: 4, background: 'rgba(239,68,68,0.12)', color: 'inherit' }}>0x4f2a…9e1b</code> has been confirmed. Immediate escalation and SAR filing are recommended.
                </Callout>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  <MetricCard label="Risk Score" value={caseData.riskScore} max={100} type="gradient-bar" color="#EF4444" />
                  <GaugeMetric value={91} label="AI Confidence" />
                  <MetricCard label="Risk Exposure" value={caseData.exposurePercent} max={100} type="vertical-bar" displayValue={`${caseData.exposurePercent}%`} color="#F97316" />
                  <MetricCard label="Hops Traced" value={HOP_TRACE.length} max={HOP_TRACE.length} type="dots" visual={{ total: HOP_TRACE.length, current: HOP_TRACE.length, colors: HOP_TRACE.map(h => hopDotColor[h.risk]) }} color="#374151" />
                  <MetricCard label="Chains" value={3} max={3} type="badges" visual={{ badges: [{ label: 'ETH', bg: '#374151' }, { label: 'ARB', bg: '#2563EB' }, { label: 'POL', bg: '#7C3AED' }] }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: CL.text.dark }}>Flagged Transactions</span>
                    <span style={{ fontSize: 12, color: CL.text.light }}>{flaggedTxns.length} records</span>
                  </div>
                  <Btn variant="outline" size="sm" icon={ChevronRight} onClick={() => setShowWalletOverlay(true)}>
                    View full wallet explorer
                  </Btn>
                </div>
                <div style={{ background: SP.bg, border: SP.border, borderRadius: SP.borderRadius, boxShadow: SP.shadow, overflow: 'hidden' }}>
                  <Table density="relaxed" columns={txColumns} data={flaggedTxns as unknown as Record<string, unknown>[]} />
                </div>
              </div>
            )}

            {/* ANALYSIS */}
            {activeTab === 2 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
                <div style={{ background: SCard.bg, border: SCard.border, borderRadius: SCard.borderRadius, boxShadow: SCard.shadow, padding: SCard.padding }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: CL.text.dark, marginBottom: 14 }}>Hop Trace</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {HOP_TRACE.map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: hopDotColor[h.risk], color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{h.n}</div>
                          {i < HOP_TRACE.length - 1 && (
                            <div style={{ flex: 1, minHeight: 8, width: 0, borderLeft: '1.5px dotted #CBD5E1', marginTop: 4 }} />
                          )}
                        </div>
                        <div style={{ flex: 1, display: 'flex', gap: 12, paddingBottom: i < HOP_TRACE.length - 1 ? 14 : 0, paddingTop: 2 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: CL.text.light, marginBottom: 2 }}>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{h.from}</span>
                              {' → '}
                              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{h.to}</span>
                            </div>
                            <div style={{ fontSize: 13, color: CL.text.dark }}>{h.action}</div>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: CL.text.body, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>{h.amount}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: SCard.bg, border: SCard.border, borderRadius: SCard.borderRadius, boxShadow: SCard.shadow, padding: SCard.padding }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: CL.text.dark, marginBottom: 14 }}>Risk Flags</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {TOP_FLAGS.map((f, i) => {
                      const col = flagColor[f.severity];
                      const isFirst = i === 0;
                      return (
                        <div key={i} style={{
                          display: 'flex', gap: 10, padding: '10px 12px 10px 10px',
                          borderLeft: `3px solid ${col}`,
                          borderRadius: '0 8px 8px 0',
                          background: isFirst ? 'rgba(239,68,68,0.04)' : 'rgba(249,115,22,0.03)',
                          alignItems: 'flex-start',
                        }}>
                          <AlertCircle size={13} style={{ color: col, flexShrink: 0, marginTop: 2 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 13, color: CL.text.dark, lineHeight: 1.5 }}>{f.text}</span>
                            {f.detail && (
                              <code style={{ display: 'block', fontSize: 11, color: col, fontFamily: "'JetBrains Mono', monospace", marginTop: 3, opacity: 0.75 }}>{f.detail}</code>
                            )}
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                            background: isFirst ? '#FEE2E2' : '#FFEDD5', color: col,
                            padding: '2px 8px', borderRadius: 9999, flexShrink: 0, alignSelf: 'flex-start', marginTop: 1,
                          }}>{f.severity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* REPORT */}
            {activeTab === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, paddingBottom: 14, marginBottom: 16, borderBottom: SP.border }}>
                  <div style={{ display: 'flex', border: SP.border, borderRadius: 8, padding: 3, background: SP.bg, gap: 2, marginRight: 'auto' }}>
                    {(['basic', 'analysis', 'full'] as const).map(t => (
                      <Btn key={t} variant="segment" size="sm" active={reportType === t} onClick={() => setReportType(t)}>
                        {t === 'basic' ? 'Basic' : t === 'analysis' ? 'Analysis' : 'Full'}
                      </Btn>
                    ))}
                  </div>
                  <Btn variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>Print</Btn>
                  <Btn variant="dark" size="sm" icon={Download} onClick={() => { /* TODO: wire to PDF export API */ }}>Export PDF</Btn>
                </div>

                <div style={{ maxWidth: 800, margin: '0 auto', width: '100%', background: '#FFFFFF', border: SP.border, borderRadius: SP.borderRadius, boxShadow: SP.shadow, overflow: 'hidden' }}>
                  <div style={{ padding: '32px 40px', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

                    <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 24, marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={logo} alt="TraceAgent" style={{ height: 32 }} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: CL.text.light }}>
                            {reportType === 'basic' ? 'Basic' : reportType === 'analysis' ? 'Analysis' : 'Full'} Investigative Report
                          </div>
                          <div style={{ fontSize: 11, color: CL.text.light, marginTop: 3 }}>Generated: Feb 27, 2026 at 14:32 UTC</div>
                          <div style={{ fontSize: 11, color: CL.text.light }}>Generated by: James Analyst — Senior Analyst</div>
                        </div>
                      </div>
                      <div style={{ paddingTop: 16, marginTop: 16, borderTop: '1px solid #E5E7EB' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: CL.text.dark, marginBottom: 4 }}>Case ID: {caseData.id}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: CL.text.body, marginBottom: 10 }}>Subject: {caseData.walletAddress}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 12, color: CL.text.body }}>Chain: {caseData.chain}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, background: '#FEE2E2', color: '#B91C1C', padding: '2px 10px', borderRadius: 20 }}>CRITICAL</span>
                          <span style={{ fontSize: 12, color: CL.text.body }}>Typology: {caseData.typology}</span>
                        </div>
                      </div>
                    </div>

                    {/* Analysis metrics */}
                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 20, marginBottom: 28 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: 14 }}>
                        Analysis Complete
                      </div>
                      {reportType === 'basic' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <MetricCard label="Risk Score"    value={91} max={100} type="gradient-bar" compact />
                          <MetricCard label="AI Confidence" value={88} max={100} type="vertical-bar"  displayValue="88%" compact />
                          <MetricCard label="Hops Traced"   value={5}  max={100} type="dots"          compact visual={{ total: 7, current: 5, colors: ['#22C55E','#F59E0B','#F59E0B','#EF4444','#EF4444'] }} />
                          <MetricCard label="Chains"        value={2}  max={100} type="badges"        compact visual={{ badges: [{ label: 'ETH', bg: '#454A75' }, { label: 'MATIC', bg: '#7B3FE4' }] }} />
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                            <MetricCard label="Risk Score"    value={94} max={100} type="gradient-bar" />
                            <MetricCard label="AI Confidence" value={91} max={100} type="gauge"        displayValue="91%" />
                            <MetricCard label="Risk Exposure" value={94} max={100} type="vertical-bar" displayValue="94%" />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                            <MetricCard label="Hops Traced" value={7} max={100} type="dots" visual={{ total: 9, current: 7, colors: ['#F97316','#F97316','#2D3142','#F97316','#F97316','#2D3142','#EF4444'] }} />
                            <MetricCard label="Chains"      value={3} max={100} type="badges" visual={{ badges: [{ label: 'ETH', bg: '#454A75' }, { label: 'ARB', bg: '#2B6CB0' }, { label: 'POL', bg: '#7B3FE4' }] }} />
                          </div>
                        </>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24, marginBottom: 28 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: CL.text.light, marginBottom: 12 }}>01 — Executive Summary</div>
                      <p style={{ fontSize: 13, lineHeight: 1.75, color: '#374151', margin: 0 }}>
                        Wallet {caseData.walletAddress} was identified as high-risk following autonomous multi-chain tracing initiated on February 27, 2026. The subject wallet received 284.50 ETH from a mixer-associated cluster and executed systematic cross-chain layering via Hop Protocol bridge. TraceAgent confirmed a 2-hop connection to OFAC-sanctioned address 0x4f2a…9e1b. Transaction frequency of 200/hr is inconsistent with declared retail trader profile. Case escalated for SAR filing with FinCEN.
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24, marginBottom: 28 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: CL.text.light, marginBottom: 6 }}>02 — Fund Flow Trace</div>
                      <div style={{ fontSize: 12, color: CL.text.light, marginBottom: 16 }}>{REPORT_HOPS.length} hops traced across 3 chains — Ethereum, Arbitrum, Polygon</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {REPORT_HOPS.map(hop => (
                          <div key={hop.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: hopDotColor[HOP_TRACE[hop.n - 1]?.risk ?? 'neutral'], color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {String(hop.n).padStart(2, '0')}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: CL.text.body }}>{hop.from} → {hop.to} | {hop.amount}</div>
                              <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{hop.action}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <span style={{ fontSize: 11, background: '#F3F4F6', color: CL.text.body, padding: '1px 8px', borderRadius: 4, fontWeight: 500 }}>{hop.chain}</span>
                                {hop.n === 7 && <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>● Final destination</span>}
                                {hop.n !== 7 && hop.warn && <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>⚠ Flagged</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24, marginBottom: 28 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: CL.text.light, marginBottom: 16 }}>03 — Risk Flags &amp; Indicators</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {[
                          { sev: 'CRITICAL', color: '#EF4444', title: 'SANCTIONS EXPOSURE',    body: 'Direct 2-hop connection to OFAC-sanctioned address 0x4f2a...9e1b. Source: OFAC SDN List March 2024. Constitutes reportable sanctions exposure under 31 CFR Part 501.', evidence: '0xf0e1d2c3...8f7a6b5c' },
                          { sev: 'HIGH',     color: '#F97316', title: 'TECHNICAL OBFUSCATION', body: 'Non-custodial mixer combined with cross-chain bridge usage across 3 networks within 47 minutes. Consistent with professional money laundering tradecraft.', evidence: 'Hops 1–3 above' },
                          { sev: 'HIGH',     color: '#F97316', title: 'BEHAVIORAL ANOMALY',    body: 'Transaction frequency 200/hr inconsistent with declared retail trader profile. Automated execution strongly suggested. Matches FinCEN FIN-2023-A001.', evidence: 'Transaction cluster Jan 13, 2024' },
                        ].map((f, i) => (
                          <div key={i} style={{ borderLeft: `4px solid ${f.color}`, paddingLeft: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, background: f.color + '20', color: f.color, padding: '2px 8px', borderRadius: 4 }}>{f.sev}</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: CL.text.dark }}>{f.title}</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: '0 0 6px' }}>{f.body}</p>
                            <p style={{ fontSize: 11, color: CL.text.light, fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>Evidence: {f.evidence}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {['analysis', 'full'].includes(reportType) && (
                      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24, marginBottom: 28 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: CL.text.light, marginBottom: 16 }}>04 — Risk Assessment</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {([
                            ['Compliance Rationale',   'Deliberate fund fragmentation across 12 wallets combined with cross-chain bridging in compressed timeframe indicates calculated attempt to defeat automated monitoring systems.'],
                            ['Threat Actor Assessment', 'Technical sophistication, mixer-adjacent infrastructure, and non-cooperative VASP destination suggest professionally managed operation or state-sponsored actor bypassing economic sanctions.'],
                            ['Regulatory Impact',       'Failure to freeze and report constitutes violation of FinCEN 2024 Stablecoin Guidance and OFAC regulations. Immediate SAR filing recommended.'],
                          ] as [string, string][]).map(([label, text]) => (
                            <div key={label}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: CL.text.dark, marginBottom: 4 }}>{label}:</div>
                              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>{text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {['analysis', 'full'].includes(reportType) && (
                      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24, marginBottom: 28 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: CL.text.light, marginBottom: 16 }}>05 — Analyst Notes</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {mockCaseNotes.map((note, i) => (
                            <div key={note.id} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < mockCaseNotes.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: CL.text.dark }}>{note.author} — {note.role}</span>
                                <span style={{ fontSize: 11, color: CL.text.light }}>{new Date(note.timestamp).toLocaleString()}</span>
                              </div>
                              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, margin: 0 }}>{note.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {reportType === 'full' && (
                      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24, marginBottom: 28 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: CL.text.light, marginBottom: 16 }}>06 — Chain of Custody</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                              {['Timestamp', 'Action', 'Performed By', 'Details'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '6px 12px 8px 0', fontSize: 11, fontWeight: 600, color: CL.text.light }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {CHAIN_OF_CUSTODY.map((row, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 1 ? '#FAFAFA' : 'transparent' }}>
                                <td style={{ padding: '8px 12px 8px 0', color: CL.text.light, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>{row.timestamp}</td>
                                <td style={{ padding: '8px 12px 8px 0', color: CL.text.dark, fontWeight: 500 }}>{row.action}</td>
                                <td style={{ padding: '8px 12px 8px 0', color: CL.text.body }}>{row.by}</td>
                                <td style={{ padding: '8px 0', color: CL.text.light }}>{row.details}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 20, textAlign: 'center', fontSize: 11, color: CL.text.light }}>
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
          <div ref={notesRef} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: SO.width, zIndex: 50, display: 'flex', flexDirection: 'column', background: SO.bg, borderLeft: SO.borderLeft, boxShadow: SO.shadow, overflow: 'hidden', borderTopRightRadius: SC.borderRadius, borderBottomRightRadius: SC.borderRadius }}>

            <div style={{ padding: SO.header.padding, borderBottom: SO.separator, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={14} style={{ color: '#1B2D58' }} />
                <span style={{ fontSize: SO.header.titleSize, fontWeight: SO.header.titleWeight, color: SO.header.titleColor }}>Investigation Notes</span>
                <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(27,45,88,0.08)', color: '#1B2D58', padding: '3px 9px', borderRadius: 9999, lineHeight: 1.4 }}>
                  {allNotes.filter(n => !n.isStatusChange).length}
                </span>
              </div>
              <GhostIcon icon={X} size="sm" onClick={() => setNotesOpen(false)} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
              {allNotes.length === 0 ? (
                <p style={{ ...SO.bodyText, fontSize: 12, color: SO.header.subtitleColor, textAlign: 'center', padding: '24px 20px', margin: 0 }}>No notes yet — add one below</p>
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

            <div style={{ flexShrink: 0, borderTop: SO.separator }}>
              <button
                type="button"
                onClick={() => setAuditTrailExpanded(v => !v)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <Clock size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', flex: 1 }}>Audit Trail</span>
                {auditTrailExpanded
                  ? <ChevronDown size={14} style={{ color: '#9CA3AF' }} />
                  : <ChevronRight size={14} style={{ color: '#9CA3AF' }} />}
              </button>
              {auditTrailExpanded && (
                <div style={{ padding: '2px 16px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {auditEntries.map(e => (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#D1D5DB', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: CL.text.body, flex: 1 }}>{e.action} — {e.author}</span>
                      <span style={{ fontSize: 10, color: CL.text.light, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                        {new Date(e.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!['archived', 'closed'].includes(status) && (
              <div style={{ borderTop: SO.separator, padding: SO.footer.padding, flexShrink: 0, background: SO.footer.bg }}>
                <style>{`.notes-ta::placeholder{color:#B0B8C8;}`}</style>
                {editingNoteId && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '5px 9px', background: 'rgba(22,48,64,0.05)', border: '1px solid rgba(22,48,64,0.12)', borderRadius: 7 }}>
                    <span style={{ fontSize: 10, color: '#1B2D58', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Pencil size={9} /> Editing note
                    </span>
                    <button onClick={() => { setEditingNoteId(null); setNewNote(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: SO.close.color, fontSize: 13, padding: '0 2px', lineHeight: 1 }}>×</button>
                  </div>
                )}
                <textarea
                  ref={notesComposerRef}
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleAddNote(); }}
                  onMouseEnter={() => setNotesFieldHov(true)}
                  onMouseLeave={() => setNotesFieldHov(false)}
                  onFocus={() => setNotesFieldFocus(true)}
                  onBlur={() => setNotesFieldFocus(false)}
                  placeholder={editingNoteId ? 'Edit your note…' : 'Add investigation note…'}
                  className="notes-ta"
                  rows={3}
                  style={{
                    width: '100%', resize: 'none', borderRadius: 10, padding: '10px 12px',
                    fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5,
                    color: SO.header.titleColor, caretColor: '#1B2D58',
                    background: notesFieldFocus ? '#FFFFFF' : INPUT.bg as string,
                    border: notesFieldFocus ? INPUT.focus.border as string : notesFieldHov ? INPUT.hover.border as string : INPUT.border as string,
                    boxShadow: notesFieldFocus ? INPUT.focus.shadow as string : notesFieldHov ? INPUT.hover.shadow as string : INPUT.shadow as string,
                    transition: 'border 0.15s, background 0.15s, box-shadow 0.15s',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: SO.header.subtitleColor }}>⌘↵ to {editingNoteId ? 'save' : 'post'}</span>
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    onMouseEnter={e => { if (newNote.trim()) (e.currentTarget as HTMLButtonElement).style.background = '#0A1E28'; }}
                    onMouseLeave={e => { if (newNote.trim()) (e.currentTarget as HTMLButtonElement).style.background = '#1B2D58'; }}
                    style={{ padding: '7px 16px', background: newNote.trim() ? '#1B2D58' : '#E5E7EB', color: newNote.trim() ? '#FFFFFF' : '#9CA3AF', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: newNote.trim() ? 'pointer' : 'default', fontFamily: 'inherit', transition: 'background 0.15s' }}
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
        <p style={{ fontSize: 13, color: CL.text.light, marginBottom: 12 }}>Submitting to <strong>{assignedLeadUser?.name || 'Lead'}</strong>. Provide a summary of your findings.</p>
        <label style={LBL}>Summary *</label>
        <TA value={submitNote} onChange={setSubmitNote} placeholder="Sanctions match confirmed — recommend SAR filing…" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleSubmit} disabled={!submitNote.trim()}>Submit</Btn>
        </div>
      </Modal>

      <Modal open={showResubmitModal} theme="light" title="Resubmit for Approval" onClose={() => setShowResubmitModal(false)}>
        <p style={{ fontSize: 13, color: CL.text.light, marginBottom: 12 }}>Resubmitting to <strong>{assignedLeadUser?.name || 'Lead'}</strong>. Describe what was addressed.</p>
        <label style={LBL}>Update Summary *</label>
        <TA value={submitNote} onChange={setSubmitNote} placeholder="Addressed lead feedback — additional evidence attached…" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="outline" onClick={() => setShowResubmitModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleResubmit} disabled={!submitNote.trim()}>Resubmit</Btn>
        </div>
      </Modal>

      <Modal open={showRevokeModal} theme="light" title="Revoke Submission" onClose={() => setShowRevokeModal(false)}>
        <p style={{ fontSize: 13, color: '#B45309', marginBottom: 12 }}>This will return the case to Under Review. You can only revoke once.</p>
        <label style={LBL}>Reason *</label>
        <TA value={revokeReason} onChange={setRevokeReason} placeholder="Need to add additional evidence before review…" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="outline" onClick={() => setShowRevokeModal(false)}>Cancel</Btn>
          <Btn variant="secondary" onClick={handleRevoke} disabled={!revokeReason.trim()}>Revoke</Btn>
        </div>
      </Modal>

      <Modal open={showApproveModal} theme="light" title="Approve Case" onClose={() => setShowApproveModal(false)}>
        {isSelfAssigned && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#92400E' }}>
            ⚠ You are approving your own case. This exception will be logged.
          </div>
        )}
        <label style={LBL}>Approval Note (optional)</label>
        <TA value={approvalNote} onChange={setApprovalNote} placeholder="Case meets all requirements for SAR filing…" rows={3} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="outline" onClick={() => setShowApproveModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleApprove}>Approve</Btn>
        </div>
      </Modal>

      <Modal open={showReturnModal} theme="light" title="Return to Analyst" onClose={() => setShowReturnModal(false)}>
        <label style={LBL}>Feedback *</label>
        <TA value={returnFeedback} onChange={setReturnFeedback} placeholder="Please provide additional on-chain evidence for hops 3-5…" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="outline" onClick={() => setShowReturnModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleReturn} disabled={!returnFeedback.trim()}>Return</Btn>
        </div>
      </Modal>

      <Modal open={showCloseModal} theme="light" title="Close Case" onClose={() => setShowCloseModal(false)}>
        <label style={LBL}>Reason *</label>
        <TA value={closeReason} onChange={setCloseReason} placeholder="SAR filed — case resolved…" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="outline" onClick={() => setShowCloseModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleClose} disabled={!closeReason.trim()}>Close Case</Btn>
        </div>
      </Modal>

      <Modal open={showReopenModal} theme="light" title="Reopen Case" onClose={() => setShowReopenModal(false)}>
        <label style={LBL}>Reason *</label>
        <TA value={reopenReason} onChange={setReopenReason} placeholder="New evidence identified…" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="outline" onClick={() => setShowReopenModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleReopen} disabled={!reopenReason.trim()}>Reopen</Btn>
        </div>
      </Modal>

      <Modal open={showUnarchiveModal} theme="light" title="Unarchive Case" onClose={() => setShowUnarchiveModal(false)}>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55, margin: '0 0 20px' }}>
          This case will be restored to active status and reassigned for investigation.
        </p>
        <label style={LBL}>Reason *</label>
        <TA value={unarchiveReason} onChange={setUnarchiveReason} placeholder="New evidence discovered…" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="outline" onClick={() => setShowUnarchiveModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleUnarchive} disabled={!unarchiveReason.trim()}>Unarchive</Btn>
        </div>
      </Modal>

      <Modal open={showArchiveModal} theme="light" title="Archive Case" onClose={() => setShowArchiveModal(false)}>
        <label style={LBL}>Reason *</label>
        <TA value={archiveReason} onChange={setArchiveReason} placeholder="Case resolved and archived per retention policy…" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="outline" onClick={() => setShowArchiveModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleArchive} disabled={!archiveReason.trim()}>Archive</Btn>
        </div>
      </Modal>

      <Modal open={showDeleteModal} theme="light" title="Delete Case" onClose={() => setShowDeleteModal(false)}>
        <p style={{ fontSize: 13, color: '#EF4444', marginBottom: 12 }}>This is irreversible. Type <strong>{caseData.id}</strong> to confirm.</p>
        <label style={LBL}>Confirm Case ID</label>
        <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={caseData.id} style={{ ...selStyle, marginBottom: 12 }} {...fieldEvents} />
        <label style={LBL}>Reason *</label>
        <TA value={deleteReason} onChange={setDeleteReason} placeholder="Duplicate case entry…" rows={2} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleDelete} disabled={deleteConfirm !== caseData.id || !deleteReason.trim()}>Delete Forever</Btn>
        </div>
      </Modal>

      <Modal open={showChangeLeadModal} theme="light" title="Change Lead" onClose={() => setShowChangeLeadModal(false)}>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55, margin: '0 0 20px' }}>
          The selected lead becomes the approver for this case and will be notified when you submit for approval.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={LBL}>New Lead *</label>
            <CustomSelect
              value={changeLeadSelected}
              onChange={setChangeLeadSelected}
              placeholder="Select lead…"
              options={leadUsers.map(u => ({ value: u.id, label: u.name }))}
            />
          </div>
          <div>
            <label style={LBL}>Reason (optional)</label>
            <TA value={changeLeadReason} onChange={setChangeLeadReason} placeholder="Workload balancing…" rows={2} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <Btn variant="outline" onClick={() => setShowChangeLeadModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleChangeLead} disabled={!changeLeadSelected}>Confirm</Btn>
        </div>
      </Modal>

      <Modal open={showChangeAnalystModal} theme="light" title="Change Analyst" onClose={() => setShowChangeAnalystModal(false)}>
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55, margin: '0 0 20px' }}>
          The new analyst will take over the investigation and will be notified of the reassignment.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={LBL}>New Analyst *</label>
            <CustomSelect
              value={changeAnalystSelected}
              onChange={setChangeAnalystSelected}
              placeholder="Select analyst…"
              options={analystUsers.map(u => ({ value: u.id, label: u.name }))}
            />
          </div>
          <div>
            <label style={LBL}>Reason (optional)</label>
            <TA value={changeAnalystReason} onChange={setChangeAnalystReason} placeholder="Workload balancing, conflict of interest…" rows={2} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <Btn variant="outline" onClick={() => setShowChangeAnalystModal(false)}>Cancel</Btn>
          <Btn variant="dark" onClick={handleChangeAnalyst} disabled={!changeAnalystSelected}>Confirm</Btn>
        </div>
      </Modal>

      <Modal open={showAdminReassignModal} theme="light" title="Reassign Case" onClose={() => setShowAdminReassignModal(false)} size="lg">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={LBL}>New Analyst *</label>
            <CustomSelect
              value={adminAnalyst}
              onChange={setAdminAnalyst}
              placeholder="Select…"
              options={ANALYST_LIST.map(a => ({ value: a.id, label: a.name }))}
            />
          </div>
          <div>
            <label style={LBL}>New Lead *</label>
            <CustomSelect
              value={adminLead}
              onChange={setAdminLead}
              placeholder="Select…"
              options={leadUsers.map(u => ({ value: u.id, label: u.name }))}
            />
          </div>
        </div>
        <label style={LBL}>Reason *</label>
        <TA value={adminReason} onChange={setAdminReason} placeholder="Specialist expertise required…" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
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
      <div style={{ padding: '6px 14px 10px', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: '#F0F2F7' }} />
          <span style={{
            fontSize: 10, color: '#9CA3AF', letterSpacing: '0.02em',
            textAlign: 'center', maxWidth: '76%', lineHeight: 1.45,
            background: '#F5F7FA', padding: '3px 9px',
            borderRadius: 20, border: '1px solid #E5E7EB',
          }}>
            {note.content}
          </span>
          <div style={{ flex: 1, height: 1, background: '#F0F2F7' }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 9, color: '#B0B8C8', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
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
      style={{
        position: 'relative',
        padding: '8px 14px 8px 11px',
        marginBottom: 6, marginLeft: 14, marginRight: 14,
        borderLeft: `3px solid ${roleColor}`,
        borderRadius: '0 8px 8px 0',
        background: hov ? '#F8FAFC' : '#FFFFFF',
        transition: 'background 0.12s',
      }}
    >
      {hov && (onEdit || onDelete) && (
        <div style={{ position: 'absolute', top: 7, right: 8, display: 'flex', gap: 4 }}>
          {onEdit && (
            <button
              onClick={() => onEdit(note)}
              title="Edit note"
              style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 5, cursor: 'pointer', padding: '3px 5px', display: 'flex', alignItems: 'center', color: '#9CA3AF', transition: 'all 0.12s' }}
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
              style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 5, cursor: 'pointer', padding: '3px 5px', display: 'flex', alignItems: 'center', color: '#9CA3AF', transition: 'all 0.12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; }}
            >
              <Trash2 size={9} />
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: roleColor, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials}</div>
        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text.dark as string }}>{note.author}</span>
      </div>
      {note.role && (
        <div style={{ fontSize: 10, color: COLORS.text.light as string, marginBottom: 5, paddingLeft: 27 }}>{note.role}</div>
      )}
      <div style={{ fontSize: 12, color: COLORS.text.body as string, lineHeight: 1.55, paddingLeft: 27 }}>{note.content}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, paddingLeft: 27 }}>
        <span style={{ fontSize: 10, color: '#B0B8C8', fontFamily: "'JetBrains Mono', monospace" }}>
          {new Date(note.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
        {note.edited && (
          <span style={{ fontSize: 9, color: '#CBD5E1', fontStyle: 'italic' }}>Edited</span>
        )}
      </div>
    </div>
  );
}

