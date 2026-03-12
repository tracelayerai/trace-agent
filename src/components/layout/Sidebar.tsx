import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Search, FolderOpen, FileText, Shield,
  Bell, Settings, LogOut, Zap, X,
} from 'lucide-react';
import type { ElementType } from 'react';
import { SURFACE, COLORS, TYPOGRAPHY, RADIUS, TRANSITIONS } from '@/tokens/designTokens';
import logoIcon    from '@/assets/images/ta_bw_logo_icon.svg';
import colorLogo   from '@/assets/images/ta_color_logo_text.svg';
import mascot      from '@/assets/images/masc2.jpg';
import avatarAdmin   from '@/assets/images/admin_ava.jpg';
import avatarLead    from '@/assets/images/lead_ava.jpg';
import avatarAnalyst from '@/assets/images/analyst_ava.jpg';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/context/AuthContext';
import { mockAnalysisQueue } from '@/data/mock/analysisQueue';

// ── Token helpers ─────────────────────────────────────────────────────────────
type SidebarToken = {
  bg: string; panelBg: string; panelBorder: string; panelShadow: string;
  iconColor: string; iconColorActive: string; iconBgHover: string; iconBgActive: string;
  divider: string;
};
type FrameToken  = { bg: string };
type NavToken    = { border: string; shadow: string };
type ColorsToken = {
  text: { white: string }; accent: { lime: string };
  role: Record<string, { color: string; bg: string }>;
};
type TypographyToken = { fontMono: string };
type TransitionsToken = { fast: string };

const sb  = SURFACE.sidebar     as unknown as SidebarToken;
const SF  = SURFACE.frame       as unknown as FrameToken;
const SN  = (SURFACE as unknown as { nav?: NavToken }).nav;
const CL  = COLORS              as unknown as ColorsToken;
const TY  = TYPOGRAPHY          as unknown as TypographyToken;
const TR  = TRANSITIONS         as unknown as TransitionsToken;

const ROLE_AVATAR: Record<Role, string> = { admin: avatarAdmin, lead: avatarLead, analyst: avatarAnalyst };

// ── Constants ─────────────────────────────────────────────────────────────────
const CW = 64;
const EW = 210;

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
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 13px', gap: 14,
        width: '100%', borderRadius: RADIUS.md, border: 'none',
        background: active ? sb.iconBgActive : hov ? sb.iconBgHover : 'transparent',
        color: active ? sb.iconColorActive : sb.iconColor,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'background 0.18s, color 0.18s',
        whiteSpace: 'nowrap', textAlign: 'left',
      }}
    >
      <div style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <Icon size={22} />
        {countBadge != null && (
          <div style={{ position: 'absolute', top: -5, right: -7, minWidth: 17, height: 17, borderRadius: 999, background: badgeColor, border: `2px solid ${sb.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', lineHeight: 1, padding: '0 3px' }}>
            {countBadge}
          </div>
        )}
      </div>
      <div style={{
        width: expanded ? 140 : 0,
        opacity: expanded ? 1 : 0,
        overflow: 'hidden', flexShrink: 0,
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: 'inherit', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{label}</span>
        {subtitle && (
          <span style={{ fontSize: 11, color: sb.iconColor, whiteSpace: 'nowrap', lineHeight: 1.3, marginTop: 1 }}>{subtitle}</span>
        )}
      </div>
    </button>
  );
}

// ── AnalysisQueueItem type ────────────────────────────────────────────────────
interface AnalysisQueueItem {
  id: string;
  wallet: string;
  chain: string;
  status: string;
  initiatedAt: string;
  completedAt: string | null;
  riskScore: number | null;
}

// ── AIAnalysisPanel ───────────────────────────────────────────────────────────
interface AIAnalysisPanelProps {
  w: number;
  top?: number;
  onClose: () => void;
  onOpenAnalysis: (item: AnalysisQueueItem) => void;
}

function AIAnalysisPanel({ w, top, onClose, onOpenAnalysis }: AIAnalysisPanelProps) {
  const running   = (mockAnalysisQueue as AnalysisQueueItem[]).filter(q => q.status === 'running');
  const completed = (mockAnalysisQueue as AnalysisQueueItem[]).filter(q => q.status === 'completed');

  return (
    <div style={{
      position: 'absolute', left: w + 8, top: top ?? 0, width: 320,
      background: SF.bg,
      borderRadius: RADIUS.lg,
      border: SN?.border ?? '1px solid rgba(255,255,255,0.07)',
      boxShadow: SN?.shadow ?? '0 8px 32px rgba(0,0,0,0.4)',
      overflow: 'hidden', zIndex: 9999,
      animation: 'notifIn 0.22s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <style>{`
        @keyframes notifIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse2  { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 14px', borderBottom: `1px solid ${sb.divider}` }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: CL.text.white }}>AI Analysis</span>
          <p style={{ fontSize: 11, color: sb.iconColor, margin: '2px 0 0', fontFamily: TY.fontMono }}>
            {running.length} running · {completed.length} completed
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sb.iconColor, display: 'flex', padding: 4, borderRadius: 6 }}>
          <X size={14} />
        </button>
      </div>

      {running.length > 0 && (
        <div>
          <div style={{ padding: '10px 20px 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: sb.iconColor }}>
            Running · {running.length}
          </div>
          {running.map((item, i) => (
            <div
              key={item.id}
              onClick={() => onOpenAnalysis(item)}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = sb.iconBgHover}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              style={{ padding: '12px 20px', borderBottom: i < running.length - 1 ? `1px solid ${sb.divider}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', transition: `background ${TR.fast}` }}
            >
              <div style={{ marginTop: 5, flexShrink: 0, position: 'relative', width: 8, height: 8 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10B981', opacity: 0.35, transform: 'scale(2)', animation: 'pulse2 1.6s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10B981' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: CL.text.white, fontFamily: TY.fontMono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {truncate(item.wallet)}
                </div>
                <div style={{ fontSize: 11, color: sb.iconColor, marginTop: 2 }}>{item.chain} · {relTime(item.initiatedAt)}</div>
                <div style={{ marginTop: 6, height: 2, borderRadius: 2, background: 'rgba(16,185,129,0.15)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '40%', background: 'linear-gradient(90deg, transparent, #10B981, transparent)', animation: 'scanBar 1.8s ease-in-out infinite' }} />
                </div>
                <style>{`@keyframes scanBar{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
                <div style={{ fontSize: 10, color: 'rgba(16,185,129,0.7)', marginTop: 4 }}>Risk score pending…</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.12)', borderRadius: 6, padding: '2px 7px', flexShrink: 0 }}>Live</span>
            </div>
          ))}
          <div style={{ margin: '4px 12px 8px', padding: '8px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Zap size={12} style={{ color: '#10B981', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>Analysis runs in the background — you can close this and check back later.</span>
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <div style={{ padding: '10px 20px 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: sb.iconColor, borderTop: running.length > 0 ? `1px solid ${sb.divider}` : 'none' }}>
            Completed
          </div>
          {completed.map((item, i) => (
            <div
              key={item.id}
              onClick={() => onOpenAnalysis(item)}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = sb.iconBgHover}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              style={{ padding: '12px 20px', borderBottom: i < completed.length - 1 ? `1px solid ${sb.divider}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', transition: `background ${TR.fast}`, opacity: 0.7 }}
            >
              <div style={{ marginTop: 4, flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: CL.text.white, fontFamily: TY.fontMono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {truncate(item.wallet)}
                </div>
                <div style={{ fontSize: 11, color: sb.iconColor, marginTop: 2 }}>
                  {item.chain} · {relTime(item.initiatedAt)} · {duration(item.initiatedAt, item.completedAt)}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: (item.riskScore ?? 0) >= 80 ? '#EF4444' : (item.riskScore ?? 0) >= 50 ? '#F59E0B' : '#10B981' }}>
                  {item.riskScore}
                </div>
                <div style={{ fontSize: 9, color: sb.iconColor }}>risk</div>
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
  const [photoHover, setPhotoHover] = useState(false);
  const avatar = ROLE_AVATAR[role] ?? ROLE_AVATAR.analyst;

  const roleLabel = role === 'admin' ? 'Administrator' : role === 'lead' ? 'Lead Analyst' : 'Analyst';
  const roleColor = (CL.role[role] ?? CL.role['analyst']).color;
  const roleBg    = (CL.role[role] ?? CL.role['analyst']).bg;

  return (
    <div style={{
      position: 'absolute', left: w + 8, bottom: 0, width: 280,
      background: SF.bg,
      borderRadius: RADIUS.lg,
      border: SN?.border ?? '1px solid rgba(255,255,255,0.07)',
      boxShadow: SN?.shadow ?? '0 8px 32px rgba(0,0,0,0.4)',
      overflow: 'hidden', zIndex: 9999,
      animation: 'notifIn 0.22s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 12px', borderBottom: `1px solid ${sb.divider}` }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Profile</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: sb.iconColor, display: 'flex', padding: 4, borderRadius: 6 }}>
          <X size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px 20px', gap: 14 }}>
        <div
          style={{ position: 'relative', width: 88, height: 88, borderRadius: '50%', flexShrink: 0, cursor: 'pointer' }}
          onMouseEnter={() => setPhotoHover(true)}
          onMouseLeave={() => setPhotoHover(false)}
        >
          <img src={avatar} alt={user?.name ?? 'Avatar'}
            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.10)', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(0,0,0,0.52)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
            opacity: photoHover ? 1 : 0, transition: 'opacity 0.18s',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Change</span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: CL.text.white, marginBottom: 6, letterSpacing: '-0.2px' }}>{user?.name ?? 'User'}</div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: roleBg, color: roleColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {roleLabel}
          </span>
          {user?.email && (
            <div style={{ fontSize: 11, color: sb.iconColor, marginTop: 8, fontFamily: TY.fontMono }}>{user.email}</div>
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
  const ref        = useRef<HTMLDivElement>(null);
  const zapRef     = useRef<HTMLDivElement>(null);

  const [notifOpen,    setNotifOpen]    = useState(false);
  const [aiQueueOpen,  setAiQueueOpen]  = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [panelTop,     setPanelTop]     = useState(0);

  const notifs = isAdmin ? ADMIN_NOTIFS : isLead ? LEAD_NOTIFS : ANALYST_NOTIFS;
  const navItems: NavItem[] = isAdmin
    ? [...BASE_NAV, { icon: Shield, label: 'Admin', path: '/admin' }]
    : BASE_NAV;

  const runningCount = (mockAnalysisQueue as AnalysisQueueItem[]).filter(q => q.status === 'running').length;
  const w = expanded ? EW : CW;

  const panel: CSSProperties = {
    background:   sb.panelBg,
    borderRadius: RADIUS.lg,
    padding:      8,
    display: 'flex', flexDirection: 'column', gap: 2,
    border:      sb.panelBorder,
    boxShadow:   sb.panelShadow,
    boxSizing:   'border-box',
    transition:  'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  };

  useEffect(() => {
    const onKey  = (e: KeyboardEvent) => { if (e.key === 'Escape') { setNotifOpen(false); setAiQueueOpen(false); setProfileOpen(false); } };
    const onDown = (e: MouseEvent)    => { if (ref.current && !ref.current.contains(e.target as Node)) { setNotifOpen(false); setAiQueueOpen(false); setProfileOpen(false); } };
    document.addEventListener('keydown',   onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, []);

  const handleSignOut = () => {
    const from = encodeURIComponent(location.pathname);
    logout?.();
    navigate(`/login?from=${from}`);
  };

  const handleOpenAnalysis = (item: AnalysisQueueItem) => {
    setAiQueueOpen(false);
    navigate(`/analysis?q=${encodeURIComponent(item.wallet)}&status=${item.status === 'running' ? 'running' : 'complete'}`);
  };

  return (
    <div ref={ref} style={{
      width: w, minWidth: w, flexShrink: 0,
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)',
      height: '100%', display: 'flex', flexDirection: 'column', gap: 8,
      position: 'relative', overflow: 'visible',
    }}>

      {/* LOGO */}
      <div style={{ ...panel, flexShrink: 0, overflow: 'hidden' }}>
        <div onClick={() => setExpanded((e: boolean) => !e)} style={{ height: 44, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none', overflow: 'hidden' }}>
          <div style={{ width: expanded ? 44 : '100%', height: 44, borderRadius: RADIUS.md, background: '#C6FF00', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), border-radius 0.28s ease' }}>
            <img src={logoIcon} style={{ width: 36, height: 36, objectFit: 'contain', filter: 'brightness(0) saturate(0)' }} alt="" />
          </div>
          <div style={{ width: expanded ? 120 : 0, opacity: expanded ? 1 : 0, overflow: 'hidden', flexShrink: 0, transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease', display: 'flex', alignItems: 'center' }}>
            <img src={colorLogo} style={{ height: 16, objectFit: 'contain', objectPosition: 'left', display: 'block', flexShrink: 0 }} alt="TraceAgent" />
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <div style={{ ...panel, flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 58%, rgba(0,0,0,0.03) 64%, rgba(0,0,0,0.12) 69%, rgba(0,0,0,0.4) 75%, black 82%, black 88%, rgba(0,0,0,0.4) 93%, rgba(0,0,0,0.1) 97%, transparent 100%)', maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 58%, rgba(0,0,0,0.03) 64%, rgba(0,0,0,0.12) 69%, rgba(0,0,0,0.4) 75%, black 82%, black 88%, rgba(0,0,0,0.4) 93%, rgba(0,0,0,0.1) 97%, transparent 100%)' }}>
          <img src={mascot} alt="" style={{ position: 'absolute', bottom: -160, left: '40%', transform: 'translateX(-50%)', width: 'auto', height: 450, maxWidth: 'none' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
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

          <div style={{ height: 1, background: sb.divider, margin: '4px 6px' }} />
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
      <div style={{ ...panel, flexShrink: 0 }}>
        <NavBtn icon={Bell} label="Notifications" active={notifOpen} expanded={expanded} countBadge={3} badgeColor="#EF4444"
          onClick={() => { setNotifOpen(o => !o); setAiQueueOpen(false); }}
        />
        <NavBtn icon={Settings} label="Settings" active={location.pathname === '/settings'} expanded={expanded}
          onClick={() => navigate('/settings')}
        />

        <div style={{ height: 1, background: sb.divider, margin: '4px 6px' }} />

        <div
          onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); setAiQueueOpen(false); }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = sb.iconBgHover}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', overflow: 'hidden', borderRadius: RADIUS.md, cursor: 'pointer', transition: `background ${TR.fast}` }}
        >
          <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: profileOpen ? '2px solid rgba(255,255,255,0.25)' : '2px solid transparent', transition: 'border-color 0.18s', boxSizing: 'border-box' }}>
            <img src={ROLE_AVATAR[currentUser?.role ?? 'analyst'] ?? ROLE_AVATAR.analyst} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ overflow: 'hidden', flexShrink: 0, width: expanded ? 130 : 0, opacity: expanded ? 1 : 0, transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap' }}>{currentUser?.name ?? 'Guest'}</div>
            <div style={{ fontSize: 11, color: sb.iconColor, whiteSpace: 'nowrap' }}>{currentUser?.title ?? '—'}</div>
          </div>
        </div>

        <NavBtn icon={LogOut} label="Sign Out" active={false} expanded={expanded} onClick={handleSignOut} />
      </div>

      {/* NOTIFICATIONS PANEL */}
      {notifOpen && (
        <div style={{ position: 'absolute', left: w + 8, bottom: 0, width: 300, background: SF.bg, borderRadius: RADIUS.lg, border: SN?.border ?? '1px solid rgba(255,255,255,0.07)', boxShadow: SN?.shadow ?? '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden', zIndex: 9999, animation: 'notifIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}>
          <style>{`@keyframes notifIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}`}</style>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 14px', borderBottom: `1px solid ${sb.divider}` }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: CL.text.white }}>Notifications</span>
            <button style={{ fontSize: 12, color: CL.accent.lime, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Mark all read</button>
          </div>
          {notifs.map((n, i) => (
            <div key={n.id}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = sb.iconBgHover}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              style={{ padding: '14px 20px', borderBottom: i < notifs.length - 1 ? `1px solid ${sb.divider}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', transition: `background ${TR.fast}` }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, boxShadow: `0 0 8px ${n.color}99`, flexShrink: 0, marginTop: 5 }} />
              <div>
                <div style={{ fontSize: 13, color: CL.text.white, opacity: 0.9, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: CL.text.white, opacity: 0.35, fontFamily: TY.fontMono }}>{n.time}</div>
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
