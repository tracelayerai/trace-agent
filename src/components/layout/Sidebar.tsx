import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, FolderOpen, FileText, Shield,
  Bell, Settings, LogOut, Zap, X,
} from 'lucide-react';
import type { ElementType } from 'react';
import { cn } from '@/lib/utils';
import logoIcon    from '@/assets/images/ta_bw_logo_icon.svg';
import colorLogo   from '@/assets/images/ta_color_logo_text.svg';
import mascot      from '@/assets/images/masc2.jpg';
import avatarAdmin   from '@/assets/images/admin_ava.jpg';
import avatarLead    from '@/assets/images/lead_ava.jpg';
import avatarAnalyst from '@/assets/images/analyst_ava.jpg';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/context/AuthContext';
import { mockAnalysisQueue } from '@/services/analysisService';

// ── Constants ─────────────────────────────────────────────────────────────────
const CW = 64;
const EW = 210;

const ROLE_AVATAR: Record<Role, string> = { admin: avatarAdmin, lead: avatarLead, analyst: avatarAnalyst };
const ROLE_LABEL:  Record<Role, string> = { admin: 'Administrator', lead: 'Lead Analyst', analyst: 'Analyst' };
const ROLE_COLORS: Record<Role, { color: string; bg: string }> = {
  admin:   { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  lead:    { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
  analyst: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
};

interface NavItem { icon: ElementType; label: string; path: string }
const BASE_NAV: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Search,          label: 'Search',    path: '/search'    },
  { icon: FolderOpen,      label: 'Cases',     path: '/cases'     },
  { icon: FileText,        label: 'Reports',   path: '/reports'   },
];

interface Notif { id: number; color: string; message: string; time: string }
const ANALYST_NOTIFS: Notif[] = [
  { id: 1, color: '#EF4444', message: 'Case #CASE-001 escalated to Critical',  time: '5 minutes ago' },
  { id: 2, color: '#F59E0B', message: 'New compliance flag on 0x4f2a…9e1b',   time: '1 hour ago'    },
  { id: 3, color: '#3B82F6', message: 'Analysis complete — CASE-2026-0011',    time: '2 hours ago'   },
];
const LEAD_NOTIFS: Notif[] = [
  { id: 1, color: '#F59E0B', message: 'CASE-004 submitted for approval by James Analyst', time: '5 minutes ago' },
  { id: 2, color: '#F59E0B', message: 'CASE-005 submitted for approval by Emma Wilson',   time: '1 hour ago'    },
  { id: 3, color: '#EF4444', message: 'Critical case CASE-001 unactioned for 4+ hours',  time: '2 hours ago'   },
  { id: 4, color: '#3B82F6', message: 'CASE-007 approved — Grace Lee notified',           time: 'Yesterday'     },
];
const ADMIN_NOTIFS: Notif[] = [
  { id: 1, color: '#EF4444', message: 'Pending approval >24hrs — CASE-007 unactioned',       time: '30 minutes ago' },
  { id: 2, color: '#F59E0B', message: 'Michael Torres deactivated — cases need reassignment', time: '1 hour ago'     },
  { id: 3, color: '#EF4444', message: 'Critical CASE-001 unactioned 4+ hours',               time: '2 hours ago'    },
  { id: 4, color: '#3B82F6', message: 'Emma Wilson added by David Kim',                       time: 'Yesterday'      },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function truncate(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}`; }

function relTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function duration(startIso: string, endIso: string | null): string {
  if (!endIso) return '';
  const s = Math.floor((new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000);
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

// ── Reusable panel style ──────────────────────────────────────────────────────
const PANEL_CLASS = 'bg-[#0F1C3A] border border-[rgba(255,255,255,0.07)] shadow-[0_2px_8px_rgba(0,0,0,0.25)] rounded-lg p-[8px] flex flex-col gap-[2px] box-border transition-[background,border-color,box-shadow] duration-300';

// ── NavBtn ────────────────────────────────────────────────────────────────────
interface NavBtnProps {
  icon: ElementType;
  label: string;
  subtitle?: string;
  active?: boolean;
  onClick?: () => void;
  expanded?: boolean;
  countBadge?: number;
  badgeColor?: string;
}

function NavBtn({ icon: Icon, label, subtitle, active, onClick, expanded, countBadge, badgeColor = '#10B981' }: NavBtnProps) {
  return (
    <button
      onClick={onClick}
      data-active={active ? 'true' : undefined}
      className={cn(
        'flex items-center gap-[14px] w-full rounded-[10px] border-none cursor-pointer font-sans',
        'px-[13px] py-[14px] whitespace-nowrap text-left',
        'transition-[background,color] duration-[180ms]',
        active
          ? 'bg-[rgba(198,255,0,0.15)] text-[#C6FF00]'
          : 'bg-transparent text-[rgba(255,255,255,0.5)] hover:bg-[rgba(198,255,0,0.08)] hover:text-[rgba(255,255,255,0.85)]',
      )}
    >
      {/* Icon wrapper with optional badge */}
      <div className="w-[22px] h-[22px] shrink-0 flex items-center justify-center relative">
        <Icon size={22} />
        {countBadge != null && (
          <div
            className="absolute -top-[5px] -right-[7px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none px-[3px]"
            style={{ background: badgeColor, border: `2px solid #0A1528` }}
          >
            {countBadge}
          </div>
        )}
      </div>

      {/* Label — slides in/out */}
      <div
        className="flex flex-col justify-center shrink-0 overflow-hidden pointer-events-none"
        style={{
          width: expanded ? 140 : 0,
          opacity: expanded ? 1 : 0,
          transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease',
        }}
      >
        <span className={cn('text-[13px] whitespace-nowrap leading-[1.3]', active ? 'font-semibold' : 'font-normal')}>
          {label}
        </span>
        {subtitle && (
          <span className="text-[11px] text-[rgba(255,255,255,0.4)] whitespace-nowrap leading-[1.3] mt-[1px]">
            {subtitle}
          </span>
        )}
      </div>
    </button>
  );
}

// ── AnalysisQueueItem type ────────────────────────────────────────────────────
interface AnalysisQueueItem {
  id: string; wallet: string; chain: string; status: string;
  initiatedAt: string; completedAt: string | null; riskScore: number | null;
}

// ── AIAnalysisPanel ───────────────────────────────────────────────────────────
interface AIAnalysisPanelProps {
  w: number; top?: number; onClose: () => void;
  onOpenAnalysis: (item: AnalysisQueueItem) => void;
}

function AIAnalysisPanel({ w, top, onClose, onOpenAnalysis }: AIAnalysisPanelProps) {
  const running   = (mockAnalysisQueue as AnalysisQueueItem[]).filter(q => q.status === 'running');
  const completed = (mockAnalysisQueue as AnalysisQueueItem[]).filter(q => q.status === 'completed');

  return (
    <div
      className="absolute w-[320px] bg-[linear-gradient(160deg,#060C1A_0%,#0C1D3C_55%,#091630_100%)] rounded-lg border border-[rgba(255,255,255,0.07)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden z-[9999]"
      style={{ left: w + 8, top: top ?? 0, animation: 'notifIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <style>{`
        @keyframes notifIn { from { opacity:0; transform:translateX(-10px) } to { opacity:1; transform:translateX(0) } }
        @keyframes pulse2  { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes scanBar { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <span className="text-[14px] font-bold text-white">AI Analysis</span>
          <p className="text-[11px] text-[rgba(255,255,255,0.4)] mt-[2px] mb-0 font-mono">
            {running.length} running · {completed.length} completed
          </p>
        </div>
        <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-[rgba(255,255,255,0.4)] hover:text-white flex p-[4px] rounded-[6px] transition-colors duration-150">
          <X size={14} />
        </button>
      </div>

      {running.length > 0 && (
        <div>
          <div className="px-[20px] pt-[10px] pb-[6px] text-[10px] font-bold uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]">
            Running · {running.length}
          </div>
          {running.map((item, i) => (
            <div
              key={item.id}
              onClick={() => onOpenAnalysis(item)}
              className={cn(
                'px-[20px] py-[12px] flex items-start gap-[12px] cursor-pointer',
                'hover:bg-[rgba(198,255,0,0.05)] transition-colors duration-150',
                i < running.length - 1 ? 'border-b border-[rgba(255,255,255,0.07)]' : '',
              )}
            >
              <div className="mt-[5px] shrink-0 relative w-[8px] h-[8px]">
                <div className="absolute inset-0 rounded-full bg-[#10B981] opacity-35 scale-[2]" style={{ animation: 'pulse2 1.6s ease-in-out infinite' }} />
                <div className="absolute inset-0 rounded-full bg-[#10B981]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-white font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                  {truncate(item.wallet)}
                </div>
                <div className="text-[11px] text-[rgba(255,255,255,0.4)] mt-[2px]">{item.chain} · {relTime(item.initiatedAt)}</div>
                <div className="mt-[6px] h-[2px] rounded-[2px] bg-[rgba(16,185,129,0.15)] overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full w-[40%] bg-gradient-to-r from-transparent via-[#10B981] to-transparent"
                    style={{ animation: 'scanBar 1.8s ease-in-out infinite' }} />
                </div>
                <div className="text-[10px] text-[rgba(16,185,129,0.7)] mt-[4px]">Risk score pending…</div>
              </div>
              <span className="text-[10px] font-bold text-[#10B981] bg-[rgba(16,185,129,0.12)] rounded-[6px] px-[7px] py-[2px] shrink-0">
                Live
              </span>
            </div>
          ))}
          <div className="mx-[12px] mb-[8px] p-[8px_12px] rounded-[8px] bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.15)] flex gap-[8px] items-start">
            <Zap size={12} className="text-[#10B981] shrink-0 mt-[1px]" />
            <span className="text-[11px] text-[rgba(255,255,255,0.5)] leading-[1.4]">
              Analysis runs in the background — you can close this and check back later.
            </span>
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <div className={cn('px-[20px] pt-[10px] pb-[6px] text-[10px] font-bold uppercase tracking-[0.07em] text-[rgba(255,255,255,0.3)]', running.length > 0 ? 'border-t border-[rgba(255,255,255,0.07)]' : '')}>
            Completed
          </div>
          {completed.map((item, i) => (
            <div
              key={item.id}
              onClick={() => onOpenAnalysis(item)}
              className={cn(
                'px-[20px] py-[12px] flex items-start gap-[12px] cursor-pointer opacity-70',
                'hover:bg-[rgba(198,255,0,0.05)] hover:opacity-100 transition-all duration-150',
                i < completed.length - 1 ? 'border-b border-[rgba(255,255,255,0.07)]' : '',
              )}
            >
              <div className="mt-[4px] shrink-0 w-[8px] h-[8px] rounded-full bg-[rgba(255,255,255,0.2)]" />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-white font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                  {truncate(item.wallet)}
                </div>
                <div className="text-[11px] text-[rgba(255,255,255,0.4)] mt-[2px]">
                  {item.chain} · {relTime(item.initiatedAt)} · {duration(item.initiatedAt, item.completedAt)}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className="text-[12px] font-bold"
                  style={{ color: (item.riskScore ?? 0) >= 80 ? '#EF4444' : (item.riskScore ?? 0) >= 50 ? '#F59E0B' : '#10B981' }}
                >
                  {item.riskScore}
                </div>
                <div className="text-[9px] text-[rgba(255,255,255,0.3)]">risk</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ProfilePanel ──────────────────────────────────────────────────────────────
interface ProfilePanelProps {
  w: number;
  user: { name?: string; email?: string } | null;
  role: Role;
  onClose: () => void;
}

function ProfilePanel({ w, user, role, onClose }: ProfilePanelProps) {
  const avatar = ROLE_AVATAR[role] ?? ROLE_AVATAR.analyst;
  const { color: roleColor, bg: roleBg } = ROLE_COLORS[role] ?? ROLE_COLORS.analyst;

  return (
    <div
      className="absolute w-[280px] bg-[linear-gradient(160deg,#060C1A_0%,#0C1D3C_55%,#091630_100%)] rounded-lg border border-[rgba(255,255,255,0.07)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden z-[9999]"
      style={{ left: w + 8, bottom: 0, animation: 'notifIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-[rgba(255,255,255,0.07)]">
        <span className="text-[13px] font-semibold text-[rgba(255,255,255,0.7)]">Profile</span>
        <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-[rgba(255,255,255,0.4)] hover:text-white flex p-[4px] rounded-[6px] transition-colors duration-150">
          <X size={13} />
        </button>
      </div>

      <div className="flex flex-col items-center px-[20px] pt-[28px] pb-[20px] gap-[14px]">
        {/* Avatar with hover overlay */}
        <div className="group relative w-[88px] h-[88px] rounded-full shrink-0 cursor-pointer">
          <img
            src={avatar}
            alt={user?.name ?? 'Avatar'}
            className="w-[88px] h-[88px] rounded-full object-cover border-2 border-[rgba(255,255,255,0.10)] block"
          />
          <div className="absolute inset-0 rounded-full bg-[rgba(0,0,0,0.52)] flex flex-col items-center justify-center gap-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-[180ms]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span className="text-[9px] font-semibold text-[rgba(255,255,255,0.85)] tracking-[0.04em] uppercase">Change</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-[15px] font-bold text-white mb-[6px] tracking-[-0.2px]">{user?.name ?? 'User'}</div>
          <span
            className="text-[11px] font-semibold px-[10px] py-[3px] rounded-full uppercase tracking-[0.05em]"
            style={{ color: roleColor, background: roleBg }}
          >
            {ROLE_LABEL[role]}
          </span>
          {user?.email && (
            <div className="text-[11px] text-[rgba(255,255,255,0.4)] mt-[8px] font-mono">{user.email}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
interface SidebarProps {
  expanded: boolean;
  setExpanded: (updater: boolean | ((prev: boolean) => boolean)) => void;
  activeOverride?: string;
}

export default function Sidebar({ expanded, setExpanded }: SidebarProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { currentUser, isAdmin, isLead, logout } = useAuth();
  const ref    = useRef<HTMLDivElement>(null);
  const zapRef = useRef<HTMLDivElement>(null);

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [aiQueueOpen, setAiQueueOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [panelTop,    setPanelTop]    = useState(0);

  const notifs    = isAdmin ? ADMIN_NOTIFS : isLead ? LEAD_NOTIFS : ANALYST_NOTIFS;
  const navItems: NavItem[] = isAdmin ? [...BASE_NAV, { icon: Shield, label: 'Admin', path: '/admin' }] : BASE_NAV;

  const runningCount = (mockAnalysisQueue as AnalysisQueueItem[]).filter(q => q.status === 'running').length;
  const w = expanded ? EW : CW;

  useEffect(() => {
    const onKey  = (e: KeyboardEvent) => { if (e.key === 'Escape') { setNotifOpen(false); setAiQueueOpen(false); setProfileOpen(false); } };
    const onDown = (e: MouseEvent)    => { if (ref.current && !ref.current.contains(e.target as Node)) { setNotifOpen(false); setAiQueueOpen(false); setProfileOpen(false); } };
    document.addEventListener('keydown',   onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, []);

  const handleSignOut = () => {
    void logout?.();
  };

  const handleOpenAnalysis = (item: AnalysisQueueItem) => {
    setAiQueueOpen(false);
    navigate(`/analysis?q=${encodeURIComponent(item.wallet)}&status=${item.status === 'running' ? 'running' : 'complete'}`);
  };

  return (
    <div
      ref={ref}
      className="flex flex-col gap-[8px] h-full relative overflow-visible shrink-0"
      style={{
        width: w, minWidth: w,
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* LOGO */}
      <div className={cn(PANEL_CLASS, 'shrink-0 overflow-hidden')}>
        <div
          onClick={() => setExpanded((e: boolean) => !e)}
          className="h-[44px] flex items-center gap-[10px] cursor-pointer select-none overflow-hidden"
        >
          <div
            className="flex items-center justify-center shrink-0 h-[44px] bg-[#C6FF00] rounded-[10px]"
            style={{
              width: expanded ? 44 : '100%',
              transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), border-radius 0.28s ease',
            }}
          >
            <img src={logoIcon} className="w-[36px] h-[36px] object-contain brightness-0 saturate-0" alt="" />
          </div>
          <div
            className="flex items-center overflow-hidden shrink-0"
            style={{ width: expanded ? 120 : 0, opacity: expanded ? 1 : 0, transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease' }}
          >
            <img src={colorLogo} className="h-[16px] object-contain object-left block shrink-0" alt="TraceAgent" />
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <div className={cn(PANEL_CLASS, 'flex-1 relative overflow-hidden')}>
        {/* Mascot fade */}
        <div
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 58%, rgba(0,0,0,0.03) 64%, rgba(0,0,0,0.12) 69%, rgba(0,0,0,0.4) 75%, black 82%, black 88%, rgba(0,0,0,0.4) 93%, rgba(0,0,0,0.1) 97%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 58%, rgba(0,0,0,0.03) 64%, rgba(0,0,0,0.12) 69%, rgba(0,0,0,0.4) 75%, black 82%, black 88%, rgba(0,0,0,0.4) 93%, rgba(0,0,0,0.1) 97%, transparent 100%)',
          }}
        >
          <img src={mascot} alt="" className="absolute bottom-[-160px] h-[450px] max-w-none w-auto left-[40%] -translate-x-1/2" />
        </div>

        <div className="relative z-[1] flex flex-col gap-[2px]">
          {navItems.map(({ icon, label, path }) => (
            <NavBtn key={path} icon={icon} label={label}
              active={location.pathname === path}
              expanded={expanded}
              onClick={() => {
                if (path === '/search') {
                  const saved = sessionStorage.getItem('traceSearchQuery');
                  navigate(saved ? `/search?q=${encodeURIComponent(saved)}` : '/search');
                } else {
                  navigate(path);
                }
              }}
            />
          ))}

          <div className="h-px bg-[rgba(255,255,255,0.07)] my-[4px] mx-[6px]" />

          <div ref={zapRef}>
            <NavBtn
              icon={Zap}
              label="AI Analysis"
              subtitle={`${runningCount} running · ${(mockAnalysisQueue as AnalysisQueueItem[]).filter(q => q.status === 'completed').length} completed`}
              active={aiQueueOpen || location.pathname === '/analysis'}
              expanded={expanded}
              countBadge={runningCount}
              onClick={() => {
                if (!aiQueueOpen && zapRef.current && ref.current) {
                  const btn     = zapRef.current.getBoundingClientRect();
                  const sidebar = ref.current.getBoundingClientRect();
                  setPanelTop(btn.top - sidebar.top);
                }
                setAiQueueOpen(o => !o);
                setNotifOpen(false);
              }}
            />
          </div>
        </div>
      </div>

      {/* BOTTOM PANEL */}
      <div className={cn(PANEL_CLASS, 'shrink-0')}>
        <NavBtn icon={Bell} label="Notifications" active={notifOpen} expanded={expanded} countBadge={3} badgeColor="#EF4444"
          onClick={() => { setNotifOpen(o => !o); setAiQueueOpen(false); }}
        />
        <NavBtn icon={Settings} label="Settings" active={location.pathname === '/settings'} expanded={expanded}
          onClick={() => navigate('/settings')}
        />

        <div className="h-px bg-[rgba(255,255,255,0.07)] my-[4px] mx-[6px]" />

        {/* Profile row */}
        <div
          onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); setAiQueueOpen(false); }}
          className={cn(
            'flex items-center gap-[10px] px-[8px] py-[8px] rounded-[10px] cursor-pointer overflow-hidden',
            'transition-colors duration-[180ms] hover:bg-[rgba(198,255,0,0.08)]',
          )}
        >
          <div
            className={cn(
              'w-[32px] h-[32px] rounded-full overflow-hidden shrink-0 box-border border-2 transition-[border-color] duration-[180ms]',
              profileOpen ? 'border-white/25' : 'border-transparent',
            )}
          >
            <img
              src={ROLE_AVATAR[currentUser?.role ?? 'analyst'] ?? ROLE_AVATAR.analyst}
              alt=""
              className="w-full h-full object-cover block"
            />
          </div>
          <div
            className="overflow-hidden shrink-0"
            style={{ width: expanded ? 130 : 0, opacity: expanded ? 1 : 0, transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease' }}
          >
            <div className="text-[13px] font-semibold text-[rgba(255,255,255,0.9)] whitespace-nowrap">{currentUser?.name ?? 'Guest'}</div>
            <div className="text-[11px] text-[rgba(255,255,255,0.4)] whitespace-nowrap">{currentUser?.title ?? '—'}</div>
          </div>
        </div>

        <NavBtn icon={LogOut} label="Sign Out" active={false} expanded={expanded} onClick={handleSignOut} />
      </div>

      {/* NOTIFICATIONS PANEL */}
      {notifOpen && (
        <div
          className="absolute w-[300px] bg-[linear-gradient(160deg,#060C1A_0%,#0C1D3C_55%,#091630_100%)] rounded-lg border border-[rgba(255,255,255,0.07)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden z-[9999]"
          style={{ left: w + 8, bottom: 0, animation: 'notifIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}
        >
          <div className="flex items-center justify-between px-[20px] pt-[16px] pb-[14px] border-b border-[rgba(255,255,255,0.07)]">
            <span className="text-[14px] font-bold text-white">Notifications</span>
            <button className="text-[12px] text-[#C6FF00] bg-transparent border-none cursor-pointer font-semibold font-sans">
              Mark all read
            </button>
          </div>
          {notifs.map((n, i) => (
            <div
              key={n.id}
              className={cn(
                'px-[20px] py-[14px] flex items-start gap-[12px] cursor-pointer',
                'hover:bg-[rgba(198,255,0,0.05)] transition-colors duration-150',
                i < notifs.length - 1 ? 'border-b border-[rgba(255,255,255,0.07)]' : '',
              )}
            >
              <div
                className="w-[8px] h-[8px] rounded-full shrink-0 mt-[5px]"
                style={{ background: n.color, boxShadow: `0 0 8px ${n.color}99` }}
              />
              <div>
                <div className="text-[13px] text-[rgba(255,255,255,0.9)] font-medium leading-[1.4] mb-[4px]">{n.message}</div>
                <div className="text-[11px] text-[rgba(255,255,255,0.35)] font-mono">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PROFILE PANEL */}
      {profileOpen && (
        <ProfilePanel
          w={w}
          user={currentUser}
          role={isAdmin ? 'admin' : isLead ? 'lead' : 'analyst'}
          onClose={() => setProfileOpen(false)}
        />
      )}

      {/* AI ANALYSIS QUEUE PANEL */}
      {aiQueueOpen && (
        <AIAnalysisPanel
          w={w}
          top={panelTop}
          onClose={() => setAiQueueOpen(false)}
          onOpenAnalysis={handleOpenAnalysis}
        />
      )}
    </div>
  );
}
