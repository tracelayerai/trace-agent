/**
 * useCaseStats — single source of truth for case counts used by
 * both the Cases page stat cards and the concept dashboard pages.
 *
 * "Due" = open / under-review cases that have been open longer than SLA_DAYS
 * without being closed or submitted.  Used as a filter bucket in the Cases
 * page and as a stat card on dashboards.
 */
import { useMemo } from 'react';
import { mockCases } from '../data/mock/cases';
import type { Case } from '../data/mock/cases';
import { useAuth } from '../context/AuthContext';

export const SLA_DAYS = 5;

// Wide stats type — fields vary by role; callers are already role-gated
export interface CaseStats {
  allCases: number;
  myOpen?: number;
  totalOpen?: number;
  open?: number;
  pendingApproval?: number;
  returned?: number;
  closedThisMonth?: number;
  teamClosed?: number;
  closed?: number;
  myCases?: number;
  critical?: number;
  due?: number;
}

/** Returns true if a case was closed in the current calendar month */
export function isClosedThisMonth(c: Case): boolean {
  if (c.status !== 'closed') return false;
  const d = new Date(c.lastUpdated);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

/** Returns true if a case has exceeded its SLA window */
export function isCaseDue(c: Case): boolean {
  if (c.status !== 'open' && c.status !== 'under-review') return false;
  const opened = new Date(c.dateOpened);
  const diffMs = Date.now() - opened.getTime();
  return diffMs / (1000 * 60 * 60 * 24) > SLA_DAYS;
}

export function useCaseStats() {
  const { currentUser, isAnalyst, isLead } = useAuth();

  const getCreatorId = (c: Case): string => c.createdBy ?? c.assignedTo;

  const myCases = useMemo(
    () => mockCases.filter((c) => c.assignedTo === currentUser?.id),
    [currentUser?.id],
  );

  const myCreatedCases = useMemo(
    () => mockCases.filter((c) => getCreatorId(c) === currentUser?.id),
    [currentUser?.id],
  );

  /** Cases visible to a lead: assigned to them as lead OR created by them */
  const leadBase = useMemo(() => {
    if (!isLead) return [];
    const seen = new Set<string>();
    return mockCases.filter((c) => {
      const match =
        c.assignedLead === currentUser?.id ||
        getCreatorId(c) === currentUser?.id;
      if (match && !seen.has(c.id)) { seen.add(c.id); return true; }
      return false;
    });
  }, [isLead, currentUser?.id]);

  const stats = useMemo((): CaseStats => {
    if (isAnalyst) {
      return {
        allCases:        myCases.length,
        myOpen:          myCases.filter((c) => c.status === 'open' || c.status === 'under-review').length,
        pendingApproval: myCases.filter((c) => c.status === 'pending-approval').length,
        returned:        myCases.filter((c) => c.status === 'returned').length,
        closedThisMonth: myCases.filter(isClosedThisMonth).length,
        due:             myCases.filter(isCaseDue).length,
      };
    }
    if (isLead) {
      return {
        allCases:        leadBase.filter((c) => c.status !== 'archived').length,
        totalOpen:       leadBase.filter((c) => c.status === 'open' || c.status === 'under-review').length,
        pendingApproval: leadBase.filter((c) => c.status === 'pending-approval').length,
        returned:        leadBase.filter((c) => c.status === 'returned').length,
        teamClosed:      leadBase.filter(isClosedThisMonth).length,
        myCases:         myCreatedCases.length,
        due:             leadBase.filter(isCaseDue).length,
      };
    }
    // Admin
    return {
      allCases: mockCases.filter((c) => c.status !== 'archived').length,
      open:     mockCases.filter((c) => c.status === 'open').length,
      critical: mockCases.filter((c) => c.riskLevel === 'Critical').length,
      returned: mockCases.filter((c) => c.status === 'returned').length,
      closed:   mockCases.filter(isClosedThisMonth).length,
      myCases:  myCreatedCases.length,
      due:      mockCases.filter(isCaseDue).length,
    };
  }, [isAnalyst, isLead, myCases, myCreatedCases, leadBase]);

  return { stats, myCases, myCreatedCases, leadBase };
}
