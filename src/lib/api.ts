/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Client, Account, Transaction, QueueItem, Credit, Employee } from '@/data/bankData';

const BASE_URL = 'https://functions.poehali.dev/3b3730d0-d14b-4286-bcb0-ef7b1102ee72';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as any).error || 'Ошибка сервера');
  return data as T;
}

export const api = {
  login: (id: string, password: string) =>
    request<Employee>('/auth/login', { method: 'POST', body: JSON.stringify({ id, password }) }),

  getClients: () => request<Client[]>('/clients'),
  createClient: (data: Partial<Client>) => request<any>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: string, data: Partial<Client>) => request<any>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getAccounts: (clientId?: string) => request<Account[]>(`/accounts${clientId ? `?clientId=${clientId}` : ''}`),
  createAccount: (data: Partial<Account>) => request<any>('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id: string, data: Partial<Account>) => request<any>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getTransactions: () => request<Transaction[]>('/transactions'),
  createTransaction: (data: Partial<Transaction>) => request<any>('/transactions', { method: 'POST', body: JSON.stringify(data) }),

  getQueue: () => request<QueueItem[]>('/queue'),
  createQueueItem: (data: Partial<QueueItem>) => request<any>('/queue', { method: 'POST', body: JSON.stringify(data) }),
  updateQueueItem: (id: string, data: Partial<QueueItem>) => request<any>(`/queue/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getCredits: () => request<Credit[]>('/credits'),
  createCredit: (data: Partial<Credit>) => request<any>('/credits', { method: 'POST', body: JSON.stringify(data) }),

  getStats: () => request<any>('/stats'),
};
