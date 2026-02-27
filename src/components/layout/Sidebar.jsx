import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  FolderOpen,
  FileText,
  Settings,
  Bell,
} from 'lucide-react';
import logoIcon from '../../assets/images/ta_bw_logo_icon.svg';
import logoText from '../../assets/images/ta_bw_logo_text.svg';

const NOTIFICATIONS = [
  { id: 1, dot: 'risk-critical', text: 'Case #CASE-001 escalated to Critical', time: '5 minutes ago', to: '/cases/CASE-001' },
  { id: 2, dot: 'risk-high', text: 'New compliance flag on 0x4f2a...9e1b', time: '1 hour ago', to: '/search?q=0x4f2a' },
  { id: 3, dot: 'status-open', text: 'Analysis complete — CASE-2026-0011', time: '2 hours ago', to: '/cases/CASE-2026-0011' },
];

export const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const panelRef = useRef(null);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Search, label: 'Investigations', to: '/search' },
    { icon: FolderOpen, label: 'Cases', to: '/cases' },
    { icon: FileText, label: 'Reports', to: '/reports' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  return (
    <>
      <aside
        className="fixed left-0 top-0 h-screen bg-surface border-r border-border transition-all duration-300 ease-out flex flex-col z-40"
        style={{ width: expanded ? '220px' : '64px' }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo area — 56px height: icon only when collapsed, icon + text when expanded */}
        <div className="h-14 flex-shrink-0 flex items-center px-3 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={logoIcon}
              alt=""
              className="h-8 w-auto flex-shrink-0 object-contain"
              aria-hidden
            />
            {expanded && (
              <img
                src={logoText}
                alt="TraceAgent"
                className="h-5 w-auto max-w-[140px] object-contain object-left transition-opacity duration-200 opacity-100"
              />
            )}
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 pt-4 overflow-y-auto">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive ? 'bg-accent text-white' : 'text-text-secondary hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {expanded && <span className="text-sm font-500 truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Notifications, Settings, Divider, User */}
        <div className="flex-shrink-0 border-t border-border">
          <div className="p-3 space-y-1">
            {/* Notifications */}
            <div className="relative" ref={panelRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
              >
                <span className="relative flex-shrink-0">
                  <Bell size={20} />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-risk-critical rounded-full" />
                </span>
                {expanded && (
                  <>
                    <span className="text-sm font-500 truncate flex-1 text-left">Notifications</span>
                    <span className="text-xs font-600 text-risk-critical bg-risk-critical/10 px-1.5 py-0.5 rounded">3</span>
                  </>
                )}
              </button>

              {/* Notification dropdown */}
              {notificationsOpen && (
                <div className="absolute left-full top-0 ml-1 w-80 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-border flex justify-between items-center">
                    <span className="text-sm font-600 text-text-primary">Notifications</span>
                    <button
                      type="button"
                      className="text-xs text-accent hover:underline"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {NOTIFICATIONS.map((n) => (
                      <NotificationItem
                        key={n.id}
                        {...n}
                        onClose={() => setNotificationsOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-accent text-white' : 'text-text-secondary hover:bg-gray-100'
                }`
              }
            >
              <Settings size={20} className="flex-shrink-0" />
              {expanded && <span className="text-sm font-500 truncate">Settings</span>}
            </NavLink>
          </div>

          <div className="border-t border-border" />

          {/* User */}
          <div className="p-3">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-xs font-600 text-white">
                JA
              </div>
              {expanded && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-500 text-text-primary truncate">James Analyst</div>
                  <div className="text-xs text-text-secondary truncate">Senior Analyst</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

function NotificationItem({ dot, text, time, to, onClose }) {
  const navigate = useNavigate();
  const dotClass =
    dot === 'risk-critical'
      ? 'bg-risk-critical'
      : dot === 'risk-high'
      ? 'bg-risk-high'
      : 'bg-status-open';

  return (
    <button
      type="button"
      onClick={() => {
        navigate(to);
        onClose();
      }}
      className="w-full flex gap-3 px-4 py-3 text-left hover:bg-page transition-colors border-b border-border last:border-0"
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${dotClass}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">{text}</p>
        <p className="text-xs text-text-secondary mt-0.5">{time}</p>
      </div>
    </button>
  );
}
