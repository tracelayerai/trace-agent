/**
 * Notes Service
 *
 * All data access for case notes and status history goes through here.
 * To connect a real API, replace the function bodies below.
 */

import { mockCaseNotes, mockStatusHistory } from '@/data/mock/caseNotes';

export { mockCaseNotes, mockStatusHistory };

export type CaseNote = (typeof mockCaseNotes)[number];
export type StatusHistoryEntry = (typeof mockStatusHistory)[number];

export async function getCaseNotes(caseId: string): Promise<CaseNote[]> {
  // TODO: return fetch(`/api/cases/${caseId}/notes`).then(r => r.json())
  void caseId;
  return mockCaseNotes;
}

export async function getStatusHistory(caseId: string): Promise<StatusHistoryEntry[]> {
  // TODO: return fetch(`/api/cases/${caseId}/history`).then(r => r.json())
  void caseId;
  return mockStatusHistory;
}
