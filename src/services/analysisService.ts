/**
 * Analysis Service
 *
 * All data access for AI analysis logs and the analysis queue goes through here.
 * To connect a real API, replace the function bodies below.
 */

import {
  mockAnalysisCompleted,
  mockAnalysisRunning,
  mockAnalysisLog,
} from '@/data/mock/analysisLog';
import { mockAnalysisQueue } from '@/data/mock/analysisQueue';

export { mockAnalysisCompleted, mockAnalysisRunning, mockAnalysisLog, mockAnalysisQueue };

export type AnalysisLogEntry = (typeof mockAnalysisCompleted)[number];
export type AnalysisQueueItem = (typeof mockAnalysisQueue)[number];

export async function getAnalysisLog(): Promise<AnalysisLogEntry[]> {
  // TODO: return fetch('/api/analysis/log').then(r => r.json())
  return mockAnalysisLog;
}

export async function getCompletedAnalysisLog(): Promise<AnalysisLogEntry[]> {
  // TODO: return fetch('/api/analysis/log?status=completed').then(r => r.json())
  return mockAnalysisCompleted;
}

export async function getRunningAnalysisLog(): Promise<AnalysisLogEntry[]> {
  // TODO: return fetch('/api/analysis/log?status=running').then(r => r.json())
  return mockAnalysisRunning;
}

export async function getAnalysisQueue(): Promise<AnalysisQueueItem[]> {
  // TODO: return fetch('/api/analysis/queue').then(r => r.json())
  return mockAnalysisQueue;
}
