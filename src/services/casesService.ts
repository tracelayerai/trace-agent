/**
 * Cases Service
 *
 * All data access for cases goes through here.
 * To connect a real API, replace the function bodies below.
 * The types and call signatures stay the same — only the source changes.
 */

import { mockCases, CASE_FROM_ANALYSIS } from '@/data/mock/cases';
import type { Case, CaseStatus, RiskLevel, LeadFeedback } from '@/data/mock/cases';

export type { Case, CaseStatus, RiskLevel, LeadFeedback };
export { mockCases, CASE_FROM_ANALYSIS };

export async function getCases(): Promise<Case[]> {
  // TODO: return fetch('/api/cases').then(r => r.json())
  return mockCases;
}

export async function getCaseById(id: string): Promise<Case | undefined> {
  // TODO: return fetch(`/api/cases/${id}`).then(r => r.json())
  return mockCases.find(c => c.id === id);
}
