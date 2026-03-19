/**
 * Reports Service
 *
 * All data access for reports goes through here.
 * To connect a real API, replace the function bodies below.
 */

import { mockReports } from '@/data/mock/reports';

export { mockReports };

export type Report = (typeof mockReports)[number];

export async function getReports(): Promise<Report[]> {
  // TODO: return fetch('/api/reports').then(r => r.json())
  return mockReports;
}

export async function getReportById(id: string): Promise<Report | undefined> {
  // TODO: return fetch(`/api/reports/${id}`).then(r => r.json())
  return mockReports.find(r => r.id === id);
}
