/**
 * Transactions Service
 *
 * All data access for wallet transactions goes through here.
 * To connect a real API, replace the function bodies below.
 */

import { mockTransactions } from '@/data/mock/transactions';
import type { Transaction } from '@/data/mock/transactions';

export type { Transaction };
export { mockTransactions };

export async function getTransactions(): Promise<Transaction[]> {
  // TODO: return fetch('/api/transactions').then(r => r.json())
  return mockTransactions;
}

export async function getTransactionsByWallet(walletAddress: string): Promise<Transaction[]> {
  // TODO: return fetch(`/api/transactions?wallet=${walletAddress}`).then(r => r.json())
  return mockTransactions.filter(
    t => t.from === walletAddress || t.to === walletAddress,
  );
}
