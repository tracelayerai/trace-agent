import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppShell } from '../components/layout';
import { Button, Badge, Card, Table } from '../components/ui';
import { mockCases } from '../data/mock/cases';

export default function CasesPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = mockCases.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (riskFilter !== 'All' && c.riskLevel !== riskFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !c.id.toLowerCase().includes(q) &&
        !c.walletAddress.toLowerCase().includes(q) &&
        !c.typology.toLowerCase().includes(q) &&
        !c.assignedAnalyst.toLowerCase().includes(q) &&
        !c.chain.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const truncateAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary mb-1">Cases</h1>
            <p className="text-sm text-text-secondary">
              Manage and investigate compliance cases
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            New Case
          </Button>
        </div>

        {/* Filters */}
        <Card padding="md">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-500 text-text-primary mb-1.5">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20"
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
                className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20"
              >
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="flex-[1.5]">
              <label className="block text-sm font-500 text-text-primary mb-1.5">
                Search
              </label>
              <input
                type="text"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20"
              />
            </div>
          </div>
        </Card>

        {/* Cases Table */}
        <Table
          onRowClick={(row) => navigate(`/cases/${row.id}`)}
          columns={[
            { key: 'id', label: 'Case ID' },
            {
              key: 'walletAddress',
              label: 'Wallet',
              render: (v) => <code className="text-xs">{truncateAddress(v)}</code>,
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
              key: 'id',
              label: '',
              render: () => (
                <span className="text-xs text-text-secondary">→</span>
              ),
            },
          ]}
          data={filteredCases}
        />
      </div>
    </AppShell>
  );
}
