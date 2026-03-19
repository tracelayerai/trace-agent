// Mock AI Analysis queue — 1 running + 1 completed
export const mockAnalysisQueue = [
  {
    id: 'aq-1',
    wallet: '0x7a3d4f8e9b2c1a5d6e7f8a9b0c1d2e3f4a5b6c7d',
    chain: 'Ethereum',
    status: 'running',
    initiatedAt: '2026-03-06T10:42:00Z',
    completedAt: null,
    riskScore: null,
  },
  {
    id: 'aq-2',
    wallet: '0x1234567890abcdef1234567890abcdef12345678',
    chain: 'Ethereum',
    status: 'completed',
    initiatedAt: '2026-03-06T09:15:00Z',
    completedAt: '2026-03-06T09:16:23Z',
    riskScore: 94,
  },
];
