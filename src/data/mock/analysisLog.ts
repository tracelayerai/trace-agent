// Completed log for 0x1234...5678 — mixer/structuring typology
export const mockAnalysisCompleted = [
  { id: 'C-001', type: 'info',     message: 'Initializing trace on 0x1234...5678 across Ethereum mainnet' },
  { id: 'C-002', type: 'info',     message: 'Hop 1 — Wallet received 63 ETH from 4 distinct source addresses' },
  { id: 'C-003', type: 'warning',  message: 'Structuring detected — 11 deposits of 5–8 ETH within 90-minute window' },
  { id: 'C-004', type: 'warning',  message: 'Tornado Cash interaction — 38 ETH routed through known mixer contract' },
  { id: 'C-005', type: 'critical', message: 'High-risk exchange deposit — funds consolidated to Binance deposit address flagged by FinCEN' },
  { id: 'C-006', type: 'warning',  message: 'Layering confirmed — 3 intermediary wallets, avg hold time < 2 minutes' },
  { id: 'C-007', type: 'info',     message: 'Cross-chain exit — 18 ETH bridged to Polygon, then swapped to USDC' },
  { id: 'C-008', type: 'critical', message: 'Analysis complete — Risk Score 91, Confidence 88%, Primary: Mixer Usage / Structuring' },
];

// Partial log — mid-scan state for a running analysis
export const mockAnalysisRunning = [
  {
    id: 'LOG-001',
    type: 'info',
    message: 'Initializing trace on 0x7a3d...6c7d across Ethereum mainnet',
  },
  {
    id: 'LOG-002',
    type: 'info',
    message: 'Hop 1 — Origin wallet received 142 ETH from mixer-associated cluster',
  },
  {
    id: 'LOG-003',
    type: 'warning',
    message: 'Cross-chain bridge detected — funds moving to Arbitrum via Hop Protocol',
  },
  {
    id: 'LOG-004',
    type: 'warning',
    message: 'Risk signal — transaction frequency 200/hr inconsistent with retail profile',
  },
  {
    id: 'LOG-005',
    type: 'critical',
    message: 'Sanctions match — 2-hop connection to OFAC-listed address 0x4f2a...9e1b',
  },
  {
    id: 'LOG-R01',
    type: 'info',
    message: 'Scanning Hop 6 — tracing cross-chain movements on Bitcoin network…',
  },
];

export const mockAnalysisLog = [
  {
    id: 'LOG-001',
    delay: 800,
    type: 'info',
    icon: 'search',
    message: 'Initializing trace on 0x7a3d...6c7d across Ethereum mainnet',
  },
  {
    id: 'LOG-002',
    delay: 1200,
    type: 'info',
    icon: 'link',
    message: 'Hop 1 — Origin wallet received 142 ETH from mixer-associated cluster',
  },
  {
    id: 'LOG-003',
    delay: 1500,
    type: 'warning',
    icon: 'bridge',
    message: 'Cross-chain bridge detected — funds moving to Arbitrum via Hop Protocol',
  },
  {
    id: 'LOG-004',
    delay: 1800,
    type: 'warning',
    icon: 'alert',
    message: 'Risk signal — transaction frequency 200/hr inconsistent with retail profile',
  },
  {
    id: 'LOG-005',
    delay: 2000,
    type: 'critical',
    icon: 'flag',
    message: 'Sanctions match — 2-hop connection to OFAC-listed address 0x4f2a...9e1b',
  },
  {
    id: 'LOG-006',
    delay: 1400,
    type: 'warning',
    icon: 'split',
    message: 'Layering pattern confirmed — funds fragmented across 12 wallets',
  },
  {
    id: 'LOG-007',
    delay: 1600,
    type: 'info',
    icon: 'merge',
    message: 'Consolidation detected — 92% of volume converging on 0xb4e2...c021',
  },
  {
    id: 'LOG-008',
    delay: 1900,
    type: 'critical',
    icon: 'checkCircle',
    message: 'Analysis complete — Risk Score 94, Confidence 91%, Primary: Sanctions Evasion',
  },
];
