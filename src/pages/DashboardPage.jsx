import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { AppShell } from '../components/layout';
import { Button, Badge, Table, Card } from '../components/ui';
import { mockCases } from '../data/mock/cases';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats
  const stats = useMemo(() => {
    return {
      open: mockCases.filter((c) => c.status === 'Open').length,
      critical: mockCases.filter((c) => c.riskLevel === 'Critical').length,
      high: mockCases.filter((c) => c.riskLevel === 'High').length,
      closed: mockCases.filter((c) => c.status === 'Closed').length,
    };
  }, []);

  // Filter cases
  const filteredCases = useMemo(() => {
    let filtered = [...mockCases];

    if (statusFilter !== 'All') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (riskFilter !== 'All') {
      filtered = filtered.filter((c) => c.riskLevel === riskFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.typology.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by risk level (Critical first, then High, then others)
    const riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3, Closed: 4 };
    return filtered.sort(
      (a, b) => (riskOrder[a.riskLevel] || 5) - (riskOrder[b.riskLevel] || 5)
    );
  }, [statusFilter, riskFilter, searchQuery]);

  // Top critical/high cases
  const alertCases = mockCases
    .filter((c) => c.riskLevel === 'Critical' || c.riskLevel === 'High')
    .slice(0, 3);

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRiskColor = (level) => {
    const colors = {
      Critical: '#EF4444',
      High: '#F97316',
      Medium: '#F59E0B',
      Low: '#22C55E',
      Closed: '#6B7280',
    };
    return colors[level] || '#6B7280';
  };

  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearchKeyDown = (e) => {
    if (e.key === 'Enter' && heroSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Prominent hero search (Google-style) */}
        <div className="flex flex-col items-center justify-center pt-6 pb-2">
          <div className="w-full max-w-2xl">
            <div className="relative">
              <SearchIcon
                size={22}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search wallet address or Case ID..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                onKeyDown={handleHeroSearchKeyDown}
                className="w-full pl-12 pr-5 py-4 text-base border border-border rounded-2xl bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20 shadow-sm transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">
            Case Dashboard
          </h1>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Open Cases</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.open}</p>
            <div className="mt-auto pt-2 h-1 w-12 rounded-full bg-gray-200" />
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Critical Alerts</p>
            <p className="text-3xl font-bold text-red-500 mt-1">{stats.critical}</p>
            <div className="mt-auto pt-2 h-1 w-12 rounded-full bg-red-100" />
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pending Review</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.high}</p>
            <div className="mt-auto pt-2 h-1 w-12 rounded-full bg-amber-100" />
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 min-h-[120px] flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Closed This Month</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.closed}</p>
            <div className="mt-auto pt-2 h-1 w-12 rounded-full bg-green-100" />
          </div>
        </div>

        {/* Alert Triage Section */}
        {alertCases.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4">
              Requires Immediate Attention
            </h2>
            <div className="space-y-3">
              {alertCases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  padding="md"
                  className="flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{
                    borderLeft: `4px solid ${getRiskColor(caseItem.riskLevel)}`,
                  }}
                  onClick={() => navigate(`/cases/${caseItem.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Badge variant={`risk-${caseItem.riskLevel.toLowerCase()}`}>
                      {caseItem.riskLevel}
                    </Badge>
                    <div className="min-w-0">
                      <div className="text-sm font-500 text-text-primary">
                        {truncateAddress(caseItem.walletAddress)}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {caseItem.typology}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-text-secondary">Last updated</div>
                      <div className="text-sm text-text-primary font-500">
                        {new Date(caseItem.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/cases/${caseItem.id}`);
                      }}
                    >
                      View Case
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cases Table Section */}
        <div>
          <div className="flex justify-between items-baseline mb-4">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              All Cases{' '}
              <span className="text-text-secondary text-xs font-normal">
                ({filteredCases.length})
              </span>
            </h2>
          </div>

          {/* Filters */}
          <Card padding="md" className="mb-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-500 text-text-primary mb-1.5">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20 transition-colors"
                >
                  <option>All</option>
                  <option>Open</option>
                  <option>Closed</option>
                  <option>Reopened</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-500 text-text-primary mb-1.5">
                  Risk Level
                </label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20 transition-colors"
                >
                  <option>All</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-500 text-text-primary mb-1.5">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20 transition-colors"
                />
              </div>
            </div>
          </Card>

          {/* Table */}
          {filteredCases.length > 0 ? (
            <Table
              onRowClick={(row) => navigate(`/cases/${row.id}`)}
              columns={[
                { key: 'id', label: 'Case ID' },
                {
                  key: 'walletAddress',
                  label: 'Wallet Address',
                  render: (v) => truncateAddress(v),
                },
                {
                  key: 'riskLevel',
                  label: 'Risk Level',
                  render: (v) => (
                    <Badge variant={`risk-${v.toLowerCase()}`}>{v}</Badge>
                  ),
                },
                {
                  key: 'riskScore',
                  label: 'Risk Score',
                  render: (v) => {
                    const score = v ?? 0;
                    const colorClass = score >= 90 ? 'text-red-600' : score >= 70 ? 'text-orange-600' : score >= 50 ? 'text-amber-600' : 'text-green-600';
                    return <span className={`font-500 ${colorClass}`}>{score}</span>;
                  },
                },
                { key: 'typology', label: 'Typology' },
                {
                  key: 'status',
                  label: 'Status',
                  render: (v) => (
                    <Badge variant={`status-${v.toLowerCase()}`}>{v}</Badge>
                  ),
                },
                { key: 'assignedAnalyst', label: 'Analyst' },
                {
                  key: 'lastUpdated',
                  label: 'Last Updated',
                  render: (v) => new Date(v).toLocaleDateString(),
                },
              ]}
              data={filteredCases}
            />
          ) : (
            <Card padding="lg" className="text-center">
              <p className="text-text-secondary">No cases match your filters</p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
