# TraceAgent UI Components - Reference Guide

All components are production-ready and can be imported from their barrel exports.

## UI Components

### Badge
File: `src/components/ui/Badge.jsx`

Risk, Status, and Compliance badges with color coding.

```jsx
import { Badge } from '../components/ui';

// Risk levels
<Badge variant="risk-critical">Critical</Badge>
<Badge variant="risk-high">High</Badge>
<Badge variant="risk-medium">Medium</Badge>
<Badge variant="risk-low">Low</Badge>
<Badge variant="risk-clear">Clear</Badge>

// Status
<Badge variant="status-open">Open</Badge>
<Badge variant="status-closed">Closed</Badge>
<Badge variant="status-reopened">Reopened</Badge>

// Compliance
<Badge variant="compliance-flagged">Flagged</Badge>
<Badge variant="compliance-clear">Clear</Badge>
```

### Button
File: `src/components/ui/Button.jsx`

Versatile button with variants and sizes.

```jsx
import { Button } from '../components/ui';

// Variants: primary, secondary, ghost, danger
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>

// Sizes: sm, md, lg (default: md)
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Full width
<Button fullWidth>Full Width</Button>

// Disabled
<Button disabled>Disabled</Button>

// With onClick
<Button onClick={() => console.log('clicked')}>Click me</Button>
```

### Card
File: `src/components/ui/Card.jsx`

Container component with border, shadow, and padding.

```jsx
import { Card } from '../components/ui';

// Padding options: sm, md (default), lg
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding</Card>
<Card padding="lg">Large padding</Card>

// Custom className
<Card className="border-l-4 border-l-risk-critical">
  Content with left accent border
</Card>
```

### StatCard
File: `src/components/ui/StatCard.jsx`

Stat display with label, large number, icon, and optional sublabel.

```jsx
import { StatCard } from '../components/ui';
import { AlertCircle } from 'lucide-react';

<StatCard
  label="Critical Cases"
  value="12"
  icon={AlertCircle}
  sublabel="4 new this week"
/>
```

### Input
File: `src/components/ui/Input.jsx`

Text input with label, placeholder, focus ring, and error state.

```jsx
import { Input } from '../components/ui';

// Basic
<Input placeholder="Enter text..." />

// With label
<Input label="Wallet Address" placeholder="0x..." />

// With error
<Input 
  label="Email" 
  placeholder="user@example.com"
  error="Invalid email format"
/>

// Other HTML attributes
<Input type="password" label="Password" />
<Input type="email" label="Email" />
```

### Textarea
File: `src/components/ui/Textarea.jsx`

Multi-line text input similar to Input component.

```jsx
import { Textarea } from '../components/ui';

// Basic
<Textarea placeholder="Enter notes..." />

// With label
<Textarea label="Case Notes" placeholder="Add notes..." />

// With error and custom height
<Textarea 
  label="Description"
  minHeight="min-h-64"
  error="Description is required"
/>
```

### Modal
File: `src/components/ui/Modal.jsx`

Centered overlay modal with title, body, and footer. **Cannot be dismissed by clicking outside or pressing Escape** (blocking by design).

```jsx
import { Modal, Button } from '../components/ui';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  title="Confirm Action"
  onClose={() => setIsOpen(false)}
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary">Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### Tabs
File: `src/components/ui/Tabs.jsx`

Horizontal tabs with dark underline active state.

```jsx
import { Tabs } from '../components/ui';
import { useState } from 'react';

const [activeTab, setActiveTab] = useState(0);

<Tabs
  defaultTab={0}
  onChange={(index) => setActiveTab(index)}
  tabs={[
    {
      label: 'Transactions',
      content: <div>Transaction list here</div>
    },
    {
      label: 'History',
      content: <div>History here</div>
    },
    {
      label: 'Analysis',
      content: <div>Analysis here</div>
    }
  ]}
/>
```

### Table
File: `src/components/ui/Table.jsx`

Data table with header styling, row hover effects, and flagged row variant.

```jsx
import { Table, Badge } from '../components/ui';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'wallet', label: 'Wallet' },
  { 
    key: 'status', 
    label: 'Status',
    render: (value) => <Badge variant={`status-${value.toLowerCase()}`}>{value}</Badge>
  }
];

const data = [
  { id: 'TXN-001', wallet: '0x7a3d...6c7d', status: 'Open' },
  { id: 'TXN-002', wallet: '0x2b5e...1f2a', status: 'Closed' }
];

<Table 
  columns={columns} 
  data={data}
  flaggedRowIds={['TXN-001']}  // Adds left orange border
/>
```

## Layout Components

### AppShell
File: `src/components/layout/AppShell.jsx`

Master layout wrapper combining Sidebar + TopBar + content area. **Use this for all app pages**.

```jsx
import { AppShell } from '../components/layout';

export default function DashboardPage() {
  return (
    <AppShell>
      {/* Your page content here */}
    </AppShell>
  );
}
```

### Sidebar
File: `src/components/layout/Sidebar.jsx`

Fixed left sidebar: 64px collapsed (icons only), 220px expanded on hover.

Navigation items: Dashboard, Search, Reports, Settings
User profile section at bottom with logout option.

Used automatically within AppShell.

### TopBar
File: `src/components/layout/TopBar.jsx`

Fixed header with:
- TraceAgent logo (left)
- Search bar: "Search wallet address or Case ID" (center)
- Notification bell with unread indicator (right)
- User avatar (right)

Used automatically within AppShell.

## Mock Data

All in `src/data/mock/`:

### cases.js
```jsx
import { mockCases } from '../data/mock/cases';

// 10 cases with realistic data
mockCases.forEach(case => {
  console.log(case.walletAddress, case.riskLevel, case.status);
});
```

### transactions.js
```jsx
import { mockTransactions } from '../data/mock/transactions';

// 50 transactions for wallet 0x7a3d...6c7d
// 4 flagged transactions with flagReason
```

### analysisLog.js
```jsx
import { mockAnalysisLog } from '../data/mock/analysisLog';

// 8 sequential trace log entries
// Each has: id, delay (ms), type (info/warning/critical), icon, message
```

### reports.js
```jsx
import { mockReports } from '../data/mock/reports';

// 6 saved reports with types: basic, analysis, full-case
```

## Color System Usage

### Using Colors in Components

```jsx
// Text colors
className="text-text-primary"    // #111827
className="text-text-secondary"  // #6B7280

// Risk badges
className="bg-risk-critical"     // #EF4444
className="bg-risk-high"         // #F97316
className="bg-risk-medium"       // #F59E0B
className="bg-risk-low"          // #22C55E

// Status colors
className="bg-status-open"       // #3B82F6
className="bg-status-closed"     // #6B7280
className="bg-status-reopened"   // #F59E0B

// Backgrounds
className="bg-page"              // #F9FAFB (page bg)
className="bg-surface"           // #FFFFFF (cards)
className="bg-border"            // #E5E7EB (borders)

// Borders
className="border-border"        // #E5E7EB
```

## Import Examples

### Importing from barrel exports:

```jsx
// UI components
import { 
  Badge, 
  Button, 
  Card, 
  Input, 
  Modal, 
  StatCard, 
  Table, 
  Tabs, 
  Textarea 
} from '../components/ui';

// Layout components
import { 
  AppShell, 
  Sidebar, 
  TopBar 
} from '../components/layout';

// Mock data
import { mockCases } from '../data/mock/cases';
import { mockTransactions } from '../data/mock/transactions';
import { mockAnalysisLog } from '../data/mock/analysisLog';
import { mockReports } from '../data/mock/reports';

// Icons from Lucide
import { 
  AlertCircle, 
  Search, 
  Bell, 
  BarChart3,
  ChevronRight 
} from 'lucide-react';
```

## Spacing Scale

Defined in Tailwind config:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px

Use in Tailwind: `p-md`, `mb-lg`, `gap-sm`, etc.

## Border Radius

Default border radius is 12px (rounded-xl in Tailwind).

Components inherit this standard radius.

## Ready to Build

All components are designed to work together as a cohesive system. Start building page layouts using the base components and AppShell!
