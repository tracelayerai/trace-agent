# TraceAgent Wireframe Setup

## Project Initialized ✓

All core infrastructure is now in place for building the blockchain forensics compliance tool wireframe prototype.

### Configuration Completed

- **Tailwind CSS**: Configured with custom wireframe color palette
- **React Router**: Set up with all 5 core routes
- **Typography**: Inter font from Google Fonts (weights: 400, 500, 600, 700)
- **PostCSS**: Configured with Tailwind and Autoprefixer
- **Build**: Vite + React with all dependencies installed

### Color System

#### Neutral Palette (Wireframe)
- Background: `#F9FAFB` (page)
- Surface: `#FFFFFF` (cards)
- Border: `#E5E7EB`
- Text Primary: `#111827`
- Text Secondary: `#6B7280`
- Accent: `#111827` (dark)

#### Functional Colors
**Risk Levels:**
- Critical: `#EF4444` (red)
- High: `#F97316` (orange)
- Medium: `#F59E0B` (amber)
- Low: `#22C55E` (green)
- Clear: `#6B7280` (grey)

**Status:**
- Open: `#3B82F6` (blue)
- Closed: `#6B7280` (grey)
- Reopened: `#F59E0B` (amber)

**Compliance:**
- Flagged: `#F97316` (orange)
- Clear: `#E5E7EB` (light grey)

### Folder Structure

```
src/
├── components/
│   ├── ui/                          # Base UI components
│   │   ├── Badge.jsx                # Risk/Status/Compliance badges
│   │   ├── Button.jsx               # Primary/Secondary/Ghost/Danger
│   │   ├── Card.jsx                 # Container with border & shadow
│   │   ├── StatCard.jsx             # Label + large number + icon
│   │   ├── Input.jsx                # Text input with label & error
│   │   ├── Textarea.jsx             # Multi-line input
│   │   ├── Modal.jsx                # Centered overlay (non-dismissible)
│   │   ├── Tabs.jsx                 # Horizontal tabs with underline
│   │   ├── Table.jsx                # Data table with hover & flagged rows
│   │   └── index.js                 # Barrel export
│   │
│   └── layout/                      # App layout components
│       ├── Sidebar.jsx              # 64px collapsed → 220px expanded
│       ├── TopBar.jsx               # Logo, search, notifications, avatar
│       ├── AppShell.jsx             # Combined layout wrapper
│       └── index.js                 # Barrel export
│
├── pages/                           # One file per route
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── SearchPage.jsx
│   ├── CaseFilePage.jsx
│   └── ReportsPage.jsx
│
├── data/
│   └── mock/                        # Mock data for development
│       ├── cases.js                 # 10 cases with realistic data
│       ├── transactions.js          # 50 transactions (4 flagged)
│       ├── analysisLog.js           # 8 sequential trace log entries
│       └── reports.js               # 6 saved reports
│
├── assets/
│   └── images/
│       └── ta_bw_logo.svg           # TraceAgent logo
│
├── routes.jsx                       # React Router configuration
├── App.jsx                          # Root component
├── main.jsx                         # Entry point
├── App.css                          # Empty (Tailwind only)
└── index.css                        # Tailwind directives
```

### Mock Data Overview

**Cases** (10 cases):
- 3 Critical, 2 High, 2 Medium, 2 Low, 1 Closed
- Statuses: 6 Open, 2 Closed, 2 Reopened
- Typologies: Mixing, Structuring, Sanctions Evasion, TF-Crowdfunding, Layering
- Fields: ID, wallet address, chain, risk level, typology, status, analyst, dates, sanctions, exposure%, notes

**Transactions** (50 transactions):
- Wallet: `0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f4a5b6c7d`
- 4 flagged transactions (positions 3, 12, 28, 41)
- Mix of Send/Receive, ETH/USDT
- Realistic hashes and amounts

**Analysis Log** (8 entries):
- Sequential trace entries with variable delays (800ms-2000ms)
- Mix of info/warning/critical types
- Icons: search, link, bridge, alert, flag, split, merge, checkCircle

**Reports** (6 reports):
- Types: basic, analysis, full-case
- Associated with cases or standalone

### React Router Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | Redirect → `/dashboard` | Home redirect |
| `/login` | LoginPage | Authentication |
| `/dashboard` | DashboardPage | Main dashboard |
| `/search` | SearchPage | Wallet explorer |
| `/cases/:id` | CaseFilePage | Case file detail |
| `/reports` | ReportsPage | Reports list |

### Component Specifications

All components are **wireframe-focused**:
- Minimal styling (greyscale + functional colors)
- Clean typography using Inter
- Consistent spacing and rounded corners (12px)
- Focus on clarity and content hierarchy
- No animations or complex effects

### Ready to Build

The following are ready to receive page implementations:
1. LoginPage - Authentication flow
2. DashboardPage - Stats overview & case list
3. SearchPage - Wallet lookup & transaction explorer
4. CaseFilePage - Case details with transaction table & analysis
5. ReportsPage - Report list & generation

All UI components are production-ready and can be imported from `src/components/ui/` and `src/components/layout/`.

### Getting Started

```bash
# Development server
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

The development server will start at `http://localhost:5173`.
