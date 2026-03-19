// Notes and status history for CASE-2026-0011 (opened from Analysis Panel)
export const mockCaseNotes = [
  {
    id: 'note-1',
    author: 'James Analyst',
    role: 'Senior Analyst',
    timestamp: '2026-02-27T14:15:00Z',
    content: 'Initial review complete. Sanctions match confirmed via OFAC API. Escalating to full investigation.',
    type: 'Investigation Note',
  },
  {
    id: 'note-2',
    author: 'James Analyst',
    role: 'Senior Analyst',
    timestamp: '2026-02-27T14:28:00Z',
    content: 'Traced bridge activity to Hop Protocol. Destination VASP identified as operating in non-cooperative jurisdiction (FATF Grey List 2024).',
    type: 'Investigation Note',
  },
  {
    id: 'note-3',
    author: 'Sarah Chen',
    role: 'Compliance Lead',
    timestamp: '2026-02-27T15:42:00Z',
    content: 'Reviewed and approved for SAR filing. Legal notified.',
    type: 'Investigation Note',
  },
];

export const mockStatusHistory = [
  {
    id: 'status-1',
    action: 'Case Opened',
    author: 'James Analyst',
    role: 'Senior Analyst',
    timestamp: '2026-02-27T14:05:00Z',
    note: '', // filled from initial note when opening from analysis
    type: 'Status Change',
  },
];
