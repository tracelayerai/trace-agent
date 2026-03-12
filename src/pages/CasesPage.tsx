import { useState, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, Filter, Archive, RotateCcw, FileText, Plus } from 'lucide-react';
import { ReportOverlay } from '@/pages/ReportsPage';
import { StatCard } from '@/components/ui';
import { Btn, CaseHeader, GhostIcon } from '@/components/core/CaseHeader';
import { Table } from '@/components/core/Table';
import { StatusChip } from '@/components/core/StatusChip';
import { mockCases } from '@/data/mock/cases';
import { useAuth, MOCK_USERS } from '@/context/AuthContext';
import { SURFACE, TABLE, COLORS, RADIUS } from '@/tokens/designTokens';
import Sidebar from '@/components/layout/Sidebar';
import { CustomSelect } from '@/components/core/CustomSelect';
import { FormField, FilterSearchInput } from '@/components/core/FormField';
import { useCaseStats, isCaseDue } from '@/hooks/useCaseStats';

type Case = (typeof mockCases)[number];

// ── Module-level constants ────────────────────────────────────────────────────
const STATUS_OPTS = [
  { value: 'All',              label: 'All'              },
  { value: 'open',             label: 'Open'             },
  { value: 'under-review',     label: 'Under Review'     },
  { value: 'pending-approval', label: 'Pending Approval' },
  { value: 'due',              label: 'Due (SLA)'        },
  { value: 'returned',         label: 'Returned'         },
  { value: 'closed',           label: 'Closed'           },
  { value: 'archived',         label: 'Archived'         },
];
const RISK_OPTS = [
  { value: 'All',      label: 'All'      },
  { value: 'Critical', label: 'Critical' },
  { value: 'High',     label: 'High'     },
  { value: 'Medium',   label: 'Medium'   },
  { value: 'Low',      label: 'Low'      },
];

// ── Filter row ────────────────────────────────────────────────────────────────
interface FilterRowProps {
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  riskFilter: string;
  setRiskFilter: (v: string) => void;
  analystFilter: string;
  setAnalystFilter: (v: string) => void;
  leadFilter: string;
  setLeadFilter: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  isLead: boolean;
  isAdmin: boolean;
  analystOptions: { value: string; label: string }[];
  leadOptions: { value: string; label: string }[];
  scrollToTable: () => void;
  resetFilters: () => void;
}

function FilterRow({ statusFilter, setStatusFilter, riskFilter, setRiskFilter, analystFilter, setAnalystFilter, leadFilter, setLeadFilter, searchQuery, setSearchQuery, isLead, isAdmin, analystOptions, leadOptions, scrollToTable, resetFilters }: FilterRowProps) {
  const isDirty = statusFilter !== 'All' || riskFilter !== 'All' || analystFilter !== 'All' || leadFilter !== 'All' || searchQuery !== '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Filter size={16} style={{ color: '#B0B8C8', flexShrink: 0 }} />
      <FormField label="Status" labelLayout="left">
        <CustomSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); scrollToTable(); }} options={STATUS_OPTS} />
      </FormField>
      <FormField label="Risk" labelLayout="left">
        <CustomSelect value={riskFilter} onChange={setRiskFilter} options={RISK_OPTS} />
      </FormField>
      {(isLead || isAdmin) && (
        <FormField label="Analyst" labelLayout="left">
          <CustomSelect value={analystFilter} onChange={setAnalystFilter} options={analystOptions} />
        </FormField>
      )}
      {isAdmin && (
        <FormField label="Lead" labelLayout="left">
          <CustomSelect value={leadFilter} onChange={setLeadFilter} options={leadOptions} />
        </FormField>
      )}
      <FormField labelLayout="left" style={{ flex: 2 }}>
        <FilterSearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Case ID, typology..."
        />
      </FormField>
      <button
        type="button"
        title="Reset filters"
        onClick={resetFilters}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: COLORS.icon.dim, height: COLORS.icon.dim, borderRadius: RADIUS.md, border: 'none',
          background: 'none', cursor: 'pointer',
          color: isDirty ? COLORS.icon.active : COLORS.icon.restMuted, opacity: isDirty ? 1 : 0.4,
          transition: 'background 0.15s, color 0.15s, opacity 0.15s', flexShrink: 0,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isDirty ? COLORS.icon.activeBg : COLORS.icon.mutedBg; (e.currentTarget as HTMLButtonElement).style.color = isDirty ? COLORS.icon.activeHover : COLORS.icon.hover; (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = isDirty ? COLORS.icon.active : COLORS.icon.restMuted; (e.currentTarget as HTMLButtonElement).style.opacity = isDirty ? '1' : '0.4'; }}
        onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.button.ghost.bgPress; (e.currentTarget as HTMLButtonElement).style.color = COLORS.icon.press; }}
        onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isDirty ? COLORS.icon.activeBg : COLORS.icon.mutedBg; (e.currentTarget as HTMLButtonElement).style.color = isDirty ? COLORS.icon.activeHover : COLORS.icon.hover; }}
      >
        <RotateCcw size={COLORS.icon.size} />
      </button>
    </div>
  );
}

export default function CasesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, isAnalyst, isLead, isAdmin } = useAuth();
  const { stats, myCases, leadBase } = useCaseStats();

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [statusFilter,   setStatusFilter]   = useState(() => searchParams.get('status') || 'All');
  const [riskFilter,     setRiskFilter]     = useState(() => searchParams.get('risk')   || 'All');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [analystFilter,  setAnalystFilter]  = useState('All');
  const [leadFilter,     setLeadFilter]     = useState('All');
  const [myFilter,       setMyFilter]       = useState(() => searchParams.get('my') === 'true');
  const [reportPreview,  setReportPreview]  = useState<Case | null>(null);

  const tableRef  = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to table when arriving with a pre-applied filter from dashboard
  useEffect(() => {
    if (searchParams.get('status') || searchParams.get('risk') || searchParams.get('my')) {
      setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helper: who created this case ────────────────────────────────────────
  const getCreatorId   = (c: Case) => c.createdBy ?? c.assignedTo;
  const getCreatorName = (c: Case) => {
    const user = Object.values(MOCK_USERS).find((u) => u.id === getCreatorId(c));
    return user?.name ?? c.assignedAnalyst ?? '—';
  };

  const analystOptions = useMemo(() => {
    const names = [...new Set(mockCases.map((c) => c.assignedAnalyst).filter(Boolean))] as string[];
    return [{ value: 'All', label: 'All Analysts' }, ...names.map((n) => ({ value: n, label: n }))];
  }, []);

  const leadOptions = useMemo(() => {
    const ids = [...new Set(mockCases.map((c) => c.assignedLead).filter(Boolean))] as string[];
    return [
      { value: 'All', label: 'All Leads' },
      ...ids.map((id) => ({ value: id, label: Object.values(MOCK_USERS).find((u) => u.id === id)?.name ?? id })),
    ];
  }, []);

  // ── Base table data per role ──────────────────────────────────────────────
  const baseForTable = useMemo(() => {
    if (isAnalyst) return myCases;
    if (isLead)    return leadBase;
    return mockCases; // admin sees all
  }, [isAnalyst, isLead, myCases, leadBase]);

  const archivedCount = useMemo(() => baseForTable.filter((c) => c.status === 'archived').length, [baseForTable]);

  // ── Filtered table data ───────────────────────────────────────────────────
  const filteredCases = useMemo(() => {
    let f = myFilter ? baseForTable.filter((c) => getCreatorId(c) === currentUser?.id) : [...baseForTable];
    if (statusFilter === 'archived') {
      f = f.filter((c) => c.status === 'archived');
    } else if (statusFilter === 'due') {
      f = f.filter((c) => isCaseDue(c));
    } else if (statusFilter !== 'All') {
      f = f.filter((c) => c.status === statusFilter && c.status !== 'archived');
    } else {
      f = f.filter((c) => c.status !== 'archived');
    }
    if (riskFilter !== 'All') f = f.filter((c) => c.riskLevel === riskFilter);
    if (analystFilter !== 'All') f = f.filter((c) => c.assignedAnalyst === analystFilter);
    if (leadFilter !== 'All') f = f.filter((c) => c.assignedLead === leadFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      f = f.filter((c) =>
        c.id.toLowerCase().includes(q) ||
        c.walletAddress.toLowerCase().includes(q) ||
        c.typology.toLowerCase().includes(q)
      );
    }
    const order: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return f.sort((a, b) => (order[a.riskLevel] ?? 5) - (order[b.riskLevel] ?? 5));
  }, [baseForTable, statusFilter, riskFilter, analystFilter, leadFilter, searchQuery, myFilter, currentUser?.id]);

  const scrollToTable = () =>
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

  const resetFilters = () => {
    setStatusFilter('All'); setRiskFilter('All');
    setAnalystFilter('All'); setLeadFilter('All'); setSearchQuery(''); setMyFilter(false);
  };

  const filterRowProps: FilterRowProps = {
    statusFilter, setStatusFilter, riskFilter, setRiskFilter,
    analystFilter, setAnalystFilter, leadFilter, setLeadFilter,
    searchQuery, setSearchQuery,
    isLead, isAdmin, analystOptions, leadOptions, scrollToTable, resetFilters,
  };

  const filterAndScroll = (status: string | undefined, risk: string | undefined) => {
    if (status !== undefined) setStatusFilter(status || 'All');
    if (risk !== undefined) setRiskFilter(risk || 'All');
    setMyFilter(false);
    scrollToTable();
  };

  const filterMyCases = () => {
    setMyFilter((prev) => !prev);
    setStatusFilter('All'); setRiskFilter('All'); setAnalystFilter('All'); setSearchQuery('');
    scrollToTable();
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const getRowClassName = (row: Record<string, unknown>) =>
    row.status === 'returned' ? 'bg-red-50 border-l-4 !border-l-red-500' : '';

  // ── Table columns ─────────────────────────────────────────────────────────
  const allTableColumns = [
    { key: 'id',            label: 'Case ID',       type: 'monoId' },
    { key: 'walletAddress', label: 'Wallet Address', render: (v: unknown): ReactNode => (
      <span
        style={{ ...(TABLE.cell.mono as React.CSSProperties), color: COLORS.icon.active, cursor: 'pointer', textDecoration: 'none' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.textDecoration = 'underline'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.textDecoration = 'none'; }}
        onClick={(e) => { e.stopPropagation(); navigate(`/search?q=${encodeURIComponent(String(v))}`); }}
      >{truncateAddress(String(v))}</span>
    )},
    { key: 'riskLevel',  label: 'Risk Level',  type: 'riskDot' },
    { key: 'riskScore',  label: 'Risk Score',  render: (v: unknown): ReactNode => {
      const s = (v as number) ?? 0;
      const color = s >= 90 ? '#EF4444' : s >= 70 ? '#F97316' : s >= 50 ? '#F59E0B' : '#22C55E';
      return <span style={{ ...(TABLE.cell.numeric as React.CSSProperties), color }}>{s}</span>;
    }},
    { key: 'typology', label: 'Typology', type: 'plain' },
    { key: 'lastUpdated', label: 'Date',  render: (v: unknown): ReactNode => <span style={TABLE.cell.mono as React.CSSProperties}>{new Date(String(v)).toLocaleDateString()}</span> },
    // "Analyst" — shown for lead and admin only (who created / is investigating the case)
    {
      key: '_creator', label: 'Analyst',
      render: (_v: unknown, row: Record<string, unknown>): ReactNode => <span style={TABLE.cell.plain as React.CSSProperties}>{getCreatorName(row as unknown as Case)}</span>,
    },
    // "Lead" — shown for analyst and admin; hidden for lead (always themselves)
    {
      key: 'assignedLead', label: 'Lead',
      render: (v: unknown): ReactNode => {
        if (v) return <span style={TABLE.cell.plain as React.CSSProperties}>{Object.values(MOCK_USERS).find((u) => u.id === v)?.name || '—'}</span>;
        return (
          <span style={{ ...(TABLE.cell.muted as React.CSSProperties), display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <UserPlus size={12} /> Unassigned
          </span>
        );
      },
    },
    { key: 'status', label: 'Status', render: (v: unknown): ReactNode => <StatusChip status={String(v)} size="sm" /> },
    {
      key: '_report', label: '',
      render: (_v: unknown, row: Record<string, unknown>): ReactNode => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <GhostIcon
            icon={FileText}
            size="xs"
            onClick={() => setReportPreview(row as unknown as Case)}
          />
        </div>
      ),
    },
  ];

  const tableColumns = allTableColumns.filter((c) => {
    if (c.key === '_creator'     && isAnalyst) return false;
    if (c.key === 'assignedLead' && isAnalyst) return false;
    if (c.key === 'assignedLead' && isLead)    return false;
    return true;
  });

  // ── Stat card configs per role ────────────────────────────────────────────
  interface StatCardConfig { label: string; value: number; accent: string; status?: string; risk?: string; myFilter?: boolean; allCard?: boolean }
  const analystStatCards: StatCardConfig[] = [
    { label: 'All Cases',         value: stats.allCases,               accent: '#003C7E', allCard: true              },
    { label: 'My Open Cases',     value: stats.myOpen          ?? 0,   accent: '#3B82F6', status: 'open'             },
    { label: 'Pending Approval',  value: stats.pendingApproval ?? 0,   accent: '#F59E0B', status: 'pending-approval' },
    { label: 'Due (SLA)',         value: stats.due             ?? 0,   accent: '#DC2626', status: 'due'              },
    { label: 'Returned to Me',    value: stats.returned        ?? 0,   accent: '#EF4444', status: 'returned'         },
    { label: 'Closed This Month', value: stats.closedThisMonth ?? 0,   accent: '#9CA3AF', status: 'closed'           },
  ];
  const leadStatCards: StatCardConfig[] = [
    { label: 'All Cases',              value: stats.allCases,               accent: '#003C7E', allCard: true              },
    { label: 'Total Open Cases',       value: stats.totalOpen       ?? 0,   accent: '#3B82F6', status: 'open'             },
    { label: 'Pending Approval',       value: stats.pendingApproval ?? 0,   accent: '#F59E0B', status: 'pending-approval' },
    { label: 'Due (SLA)',              value: stats.due             ?? 0,   accent: '#DC2626', status: 'due'              },
    { label: 'Returned Cases',         value: stats.returned        ?? 0,   accent: '#EF4444', status: 'returned'         },
    { label: 'Closed This Month',      value: stats.teamClosed      ?? 0,   accent: '#22C55E', status: 'closed'           },
    { label: 'My Cases',               value: stats.myCases         ?? 0,   accent: COLORS.role.lead.color, myFilter: true },
  ];
  const adminStatCards: StatCardConfig[] = [
    { label: 'All Cases',         value: stats.allCases       ?? 0, accent: '#003C7E', allCard: true      },
    { label: 'Open Cases',        value: stats.open           ?? 0, accent: '#3B82F6', status: 'open'     },
    { label: 'Critical Alerts',   value: stats.critical       ?? 0, accent: '#EF4444', risk: 'Critical'   },
    { label: 'Returned Cases',    value: stats.returned       ?? 0, accent: '#EF4444', status: 'returned' },
    { label: 'Closed This Month', value: stats.closed         ?? 0, accent: '#22C55E', status: 'closed'   },
    { label: 'My Cases',          value: stats.myCases        ?? 0, accent: COLORS.role.admin.color, myFilter: true },
  ];
  const statCards = isLead ? leadStatCards : isAdmin ? adminStatCards : analystStatCards;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: SURFACE.frame.bg, padding: SURFACE.frame.padding, gap: SURFACE.frame.padding, boxSizing: 'border-box' }}>
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: SURFACE.frame.padding, overflow: 'hidden' }}>
        <main style={{ flex: 1, overflow: 'hidden', background: SURFACE.content.bg, borderRadius: SURFACE.content.borderRadius, boxShadow: SURFACE.content.shadow, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flexShrink: 0 }}>
            <CaseHeader
              title="Cases"
              showStatusRow={false}
              actions={[
                { variant: 'primary', icon: Plus, label: 'New Case', onClick: () => navigate('/search') },
              ]}
            />
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, background: SURFACE.content.bodyBg, padding: SURFACE.content.padding, display: 'flex', flexDirection: 'column', gap: 16 }}>


              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${statCards.length}, 1fr)`, gap: 8 }}>
                {statCards.map(({ label, value, accent, status, risk, myFilter: isMyCasesCard, allCard }) => (
                  <StatCard
                    key={label}
                    label={label}
                    value={value}
                    accent={accent}
                    onClick={() => {
                      if (isMyCasesCard) { filterMyCases(); }
                      else if (allCard) { resetFilters(); scrollToTable(); }
                      else { filterAndScroll(status, risk); }
                    }}
                    active={
                      isMyCasesCard ? myFilter
                      : allCard ? (!myFilter && statusFilter === 'All' && riskFilter === 'All' && analystFilter === 'All' && !searchQuery)
                      : (!myFilter && (status ? statusFilter === status : riskFilter === risk))
                    }
                    compact
                  />
                ))}
              </div>


              {/* Filter panel */}
              <div style={{ background: SURFACE.panel.bg, borderRadius: SURFACE.panel.borderRadius, border: SURFACE.panel.border, boxShadow: SURFACE.panel.shadow, padding: SURFACE.panel.padding }}>
                <FilterRow {...filterRowProps} />
              </div>

              {/* Table */}
              <div ref={tableRef}>
                <Table
                  density="relaxed"
                  onRowClick={(row) => navigate(`/cases/${row.id}`)}
                  rowClassName={getRowClassName}
                  columns={tableColumns}
                  data={filteredCases as unknown as Record<string, unknown>[]}
                  emptyTitle="No cases match your filters"
                  emptySubtitle="Try adjusting the status, risk, or analyst filters"
                />
                {statusFilter !== 'archived' && !myFilter && (
                  <div style={{ marginTop: 8 }}>
                    <Btn variant="ghost" size="sm" icon={Archive} onClick={() => setStatusFilter('archived')}>
                      View Archived Cases {archivedCount > 0 && `(${archivedCount})`}
                    </Btn>
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Report Preview — full-screen overlay (same pattern as ReportsPage) */}
      {reportPreview && (
        <ReportOverlay
          report={{
            walletAddress: reportPreview.walletAddress,
            caseId:        reportPreview.id,
            riskLevel:     reportPreview.riskLevel,
            riskScore:     reportPreview.riskScore ?? 0,
            date:          reportPreview.lastUpdated,
            generatedBy:   reportPreview.assignedAnalyst,
            type:          'full-case',
            id:            reportPreview.id,
          }}
          onClose={() => setReportPreview(null)}
          onOpenFull={() => { navigate(`/cases/${reportPreview.id}?tab=report`); setReportPreview(null); }}
        />
      )}
    </div>
  );
}
