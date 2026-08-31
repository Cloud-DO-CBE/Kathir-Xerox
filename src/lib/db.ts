import { ServiceItem, Transaction, DailyBook, DueCustomer } from '@/types';
import { INITIAL_SERVICES } from './initialData';
import { getTodayDateString, generateTokenNumber } from './formatters';

const STORAGE_KEY_SERVICES = 'kx_services_v1';
const STORAGE_KEY_TRANSACTIONS = 'kx_transactions_v1';
const STORAGE_KEY_BOOKS = 'kx_daily_books_v1';
const STORAGE_KEY_SETTINGS = 'kx_settings_v1';

export interface AppSettings {
  shopName: string;
  shopNameTa: string;
  phone: string;
  ownerWhatsApp: string;
  upiId: string;
  address: string;
  accessPassword?: string;
  enableAutoDigest: boolean;
  enableAutoWhatsAppTx: boolean;
  autoWhatsAppTarget: 'CUSTOMER_AND_OWNER' | 'CUSTOMER_ONLY' | 'OWNER_ONLY';
}

export const DEFAULT_SETTINGS: AppSettings = {
  shopName: 'Kathir Xerox & E-Service Centre',
  shopNameTa: 'கதிர் ஜெராக்ஸ் & இ-சேவை மையம்',
  phone: '9842100000',
  ownerWhatsApp: '9842100000',
  upiId: 'kathirxerox@okaxis',
  address: 'Next to SNS complex, Perumal temple street , Senjeriputhur',
  accessPassword: 'RX135',
  enableAutoDigest: true,
  enableAutoWhatsAppTx: false,
  autoWhatsAppTarget: 'CUSTOMER_AND_OWNER',
};

// Client Storage helper functions
export const db = {
  getServices(): ServiceItem[] {
    if (typeof window === 'undefined') return INITIAL_SERVICES;
    try {
      const item = localStorage.getItem(STORAGE_KEY_SERVICES);
      if (!item) {
        localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(INITIAL_SERVICES));
        return INITIAL_SERVICES;
      }
      return JSON.parse(item);
    } catch {
      return INITIAL_SERVICES;
    }
  },

  saveServices(services: ServiceItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(services));
  },

  getTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    try {
      const item = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (!item) {
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([]));
        return [];
      }
      const parsed: Transaction[] = JSON.parse(item);
      // Clean out any legacy mock/demo entries if present
      const clean = parsed.filter(
        (tx) =>
          !tx.id.startsWith('tx-sample') &&
          !tx.id.startsWith('tx-hist') &&
          !tx.token_no?.includes('TODAY')
      );
      if (clean.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(clean));
      }
      return clean;
    } catch {
      return [];
    }
  },

  saveTransactions(transactions: Transaction[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  },

  clearAllTransactions() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([]));
  },

  getSettings(): AppSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const item = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!item) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(item) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  },

  getTransactionsByDate(dateStr: string): Transaction[] {
    const all = this.getTransactions();
    return all.filter((tx) => {
      const txDate = tx.timestamp.split('T')[0];
      return txDate === dateStr;
    });
  },

  addTransaction(txData: Omit<Transaction, 'id' | 'token_no' | 'book_id' | 'timestamp'> & { date?: string; timestamp?: string }): Transaction {
    const all = this.getTransactions();
    const dateStr = txData.date || getTodayDateString();
    const dayTx = all.filter((t) => t.timestamp.split('T')[0] === dateStr);
    
    const tokenNo = generateTokenNumber(dayTx.length + 1, dateStr);
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      book_id: `book-${dateStr}`,
      timestamp: txData.timestamp || new Date().toISOString(),
      token_no: tokenNo,
    };

    const updated = [newTx, ...all];
    this.saveTransactions(updated);
    return newTx;
  },

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const all = this.getTransactions();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const updatedTx = { ...all[idx], ...updates };
    all[idx] = updatedTx;
    this.saveTransactions(all);
    return updatedTx;
  },

  deleteTransaction(id: string): boolean {
    const all = this.getTransactions();
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length !== all.length) {
      this.saveTransactions(filtered);
      return true;
    }
    return false;
  },

  getDueCustomers(): DueCustomer[] {
    const all = this.getTransactions();
    const map: { [key: string]: DueCustomer } = {};

    all.forEach((tx) => {
      if (tx.due_amount > 0 && tx.customer_ref) {
        const key = tx.customer_ref.trim().toLowerCase();
        if (!map[key]) {
          map[key] = {
            customer_ref: tx.customer_ref,
            customer_phone: tx.customer_phone,
            total_due: 0,
            transactions: [],
          };
        }
        map[key].total_due += tx.due_amount;
        map[key].transactions.push({
          transaction_id: tx.id,
          token_no: tx.token_no,
          date: tx.timestamp.split('T')[0],
          amount: tx.due_amount,
        });
      }
    });

    return Object.values(map).filter((c) => c.total_due > 0);
  },

  settleCustomerDue(customerRef: string, settleAmount: number, paymentMode: 'CASH' | 'UPI'): boolean {
    const all = this.getTransactions();
    let remaining = settleAmount;
    let modified = false;

    // Settle from oldest due transaction to newest
    const matchingTx = all
      .filter((t) => t.customer_ref?.trim().toLowerCase() === customerRef.trim().toLowerCase() && t.due_amount > 0)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    for (const tx of matchingTx) {
      if (remaining <= 0) break;
      const reduce = Math.min(tx.due_amount, remaining);
      tx.due_amount -= reduce;
      if (paymentMode === 'CASH') {
        tx.cash_amount = (tx.cash_amount || 0) + reduce;
      } else {
        tx.upi_amount = (tx.upi_amount || 0) + reduce;
      }
      remaining -= reduce;
      modified = true;
    }

    if (modified) {
      this.saveTransactions(all);
    }
    return modified;
  },
};
