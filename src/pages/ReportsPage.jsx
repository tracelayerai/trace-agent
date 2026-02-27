import { useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { AppShell } from '../components/layout';
import { Button, Badge, Card, Table } from '../components/ui';
import { ReportPreview } from '../components/ReportPreview';
import { mockReports } from '../data/mock/reports';

export default function ReportsPage() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReport, setShowReport] = useState(null);

  const filteredReports = mockReports.filter((r) => {
    if (typeFilter !== 'All' && r.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!r.walletAddress.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const truncateAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getTypeLabel = (type) => {
    const labels = {
      'basic': 'Basic Report',
      'analysis': 'Analysis Report',
      'full-case': 'Full Case Report',
    };
    return labels[type] || type;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Reports</h1>
          <p className="text-sm text-text-secondary">
            View and download generated compliance reports
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card padding="md">
            <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-2">
              Total Reports
            </p>
            <p className="text-2xl font-700 text-text-primary">{mockReports.length}</p>
          </Card>
          <Card padding="md">
            <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-2">
              This Month
            </p>
            <p className="text-2xl font-700 text-text-primary">
              {mockReports.filter(r => {
                const reportDate = new Date(r.date);
                const now = new Date();
                return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </Card>
          <Card padding="md">
            <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-2">
              Critical Cases
            </p>
            <p className="text-2xl font-700 text-risk-critical">
              {mockReports.filter(r => r.riskLevel === 'Critical').length}
            </p>
          </Card>
          <Card padding="md">
            <p className="text-xs font-500 text-text-secondary uppercase tracking-wide mb-2">
              Analysts
            </p>
            <p className="text-2xl font-700 text-text-primary">
              {new Set(mockReports.map(r => r.generatedBy)).size}
            </p>
          </Card>
        </div>

        {/* Filter */}
        <Card padding="md">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-500 text-text-primary mb-1.5">
                Report Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20"
              >
                <option>All</option>
                <option>basic</option>
                <option>analysis</option>
                <option>full-case</option>
              </select>
            </div>
            <div className="flex-[1.5]">
              <label className="block text-sm font-500 text-text-primary mb-1.5">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by wallet ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20"
              />
            </div>
          </div>
        </Card>

        {/* Reports Table */}
        <Table
          columns={[
            {
              key: 'walletAddress',
              label: 'Wallet',
              render: (v) => <code className="text-xs">{truncateAddress(v)}</code>,
            },
            {
              key: 'type',
              label: 'Type',
              render: (v) => getTypeLabel(v),
            },
            {
              key: 'riskLevel',
              label: 'Risk Level',
              render: (v) => (
                <Badge variant={`risk-${v.toLowerCase()}`}>{v}</Badge>
              ),
            },
            { key: 'generatedBy', label: 'Generated By' },
            {
              key: 'date',
              label: 'Date',
              render: (v) => new Date(v).toLocaleDateString(),
            },
            {
              key: 'id',
              label: 'Actions',
              render: (v, row) => (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReport(row)}
                    className="flex items-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => alert(`Downloading ${row.id}`)}
                    className="flex items-center gap-1"
                  >
                    <Download size={14} />
                    Download
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredReports}
        />

        {/* Report Preview Modal */}
        {showReport && (
          <ReportPreview 
            initialType={showReport.type === 'basic' ? 'basic' : showReport.type === 'analysis' ? 'analysis' : 'full'}
            availableTypes={showReport.type === 'basic' ? 'basic' : showReport.type === 'analysis' ? 'analysis' : 'full'}
            caseId={showReport.caseId || 'CASE-2026-0011'}
            walletAddress={showReport.walletAddress}
            onClose={() => setShowReport(null)}
          />
        )}
      </div>
    </AppShell>
  );
}
