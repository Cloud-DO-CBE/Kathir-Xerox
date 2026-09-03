import { ServiceItem, Transaction, DailyBook, DueCustomer } from "@/types";
import { db, AppSettings } from "./db";

/**
 * Universal Data Layer for Kathir Xerox & E-Service Centre
 * Neon PostgreSQL is the primary source of truth. 
 * localStorage is used strictly for caching and offline-first performance.
 */
export const api = {
  async getServices(): Promise<ServiceItem[]> {
    try {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      db.saveServices(data);
      return data;
    } catch {
      return db.getServices();
    }
  },

  async saveService(service: ServiceItem): Promise<ServiceItem> {
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
    });
    if (!res.ok) throw new Error("Failed to save service");
    const saved = await res.json();
    const services = db.getServices();
    db.saveServices(services.map(s => s.id === saved.id ? saved : s));
    return saved;
  },

  async getTransactions(params?: { date?: string; month?: string; customer_ref?: string }): Promise<Transaction[]> {
    try {
      const query = new URLSearchParams();
      if (params?.date) query.set("date", params.date);
      if (params?.month) query.set("month", params.month);
      if (params?.customer_ref) query.set("customer_ref", params.customer_ref);

      const res = await fetch(`/api/transactions?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Cache full list to localStorage so offline mode works
        if (!params?.date && !params?.month && !params?.customer_ref) {
          db.saveTransactions(data);
        }
        return data;
      }
      return params?.date ? db.getTransactionsByDate(params.date) : db.getTransactions();
    } catch {
      return params?.date ? db.getTransactionsByDate(params.date) : db.getTransactions();
    }
  },

  async createTransaction(txData: Omit<Transaction, "id" | "token_no" | "book_id" | "timestamp"> & { date?: string; timestamp?: string }): Promise<Transaction> {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txData),
      });
      if (!res.ok) throw new Error("Failed to save transaction to database");
      const saved = await res.json();
      // Keep local cache in sync — deduplicate to avoid double entries
      const local = db.getTransactions();
      const deduped = local.filter((t) => t.id !== saved.id);
      db.saveTransactions([saved, ...deduped]);
      return saved;
    } catch {
      // Offline fallback — save locally, will be synced on next page load
      console.warn("DB unavailable — saving to localStorage for later sync");
      return db.addTransaction(txData);
    }
  },

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");
      db.deleteTransaction(id);
      return true;
    } catch {
      return db.deleteTransaction(id);
    }
  },

  async getDailyBook(date: string): Promise<DailyBook | null> {
    try {
      const res = await fetch(`/api/daily-books?date=${date}`);
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    }
  },

  async setDailyBookStatus(date: string, status: "OPEN" | "CLOSED"): Promise<DailyBook | null> {
    const res = await fetch("/api/daily-books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, status }),
    });
    return res.ok ? await res.json() : null;
  },

  async getDueCustomers(): Promise<DueCustomer[]> {
    try {
      const res = await fetch("/api/dues");
      if (!res.ok) throw new Error("Failed to fetch dues");
      const data = await res.json();
      if (Array.isArray(data)) return data;
      return db.getDueCustomers();
    } catch {
      return db.getDueCustomers();
    }
  },

  async settleDue(customerRef: string, amount: number, paymentMode: "CASH" | "UPI" = "CASH"): Promise<boolean> {
    try {
      const res = await fetch("/api/dues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_ref: customerRef, amount, payment_mode: paymentMode }),
      });
      if (!res.ok) throw new Error("Failed to settle dues");
      db.settleCustomerDue(customerRef, amount, paymentMode);
      return true;
    } catch {
      return db.settleCustomerDue(customerRef, amount, paymentMode);
    }
  },

  async getSettings(): Promise<AppSettings> {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      db.saveSettings(data);
      return data;
    } catch {
      return db.getSettings();
    }
  },

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      db.saveSettings(settings);
      return settings;
    } catch {
      db.saveSettings(settings);
      return settings;
    }
  },

  /**
   * Syncs any locally-saved (offline) transactions to Neon DB.
   * After a successful sync, replaces localStorage with the DB's authoritative copy.
   * This ensures no duplicates and keeps all devices in sync.
   */
  async syncOfflineData(): Promise<{ success: boolean; syncedTransactions: number; syncedServices: number }> {
    try {
      const localTransactions = db.getTransactions();
      const localServices = db.getServices();
      const settings = db.getSettings();

      // Push any locally-saved data up to Neon DB
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: localTransactions, services: localServices, settings }),
      });

      if (!res.ok) throw new Error("Sync failed");
      const result = await res.json();

      // After successful sync, fetch the canonical list from Neon
      // and replace localStorage so it matches the DB exactly (no duplicates)
      const freshTxRes = await fetch("/api/transactions");
      if (freshTxRes.ok) {
        const freshTx = await freshTxRes.json();
        if (Array.isArray(freshTx)) {
          db.saveTransactions(freshTx);
        }
      }

      return result;
    } catch (e: any) {
      console.warn("Sync to Neon failed:", e?.message);
      return { success: false, syncedTransactions: 0, syncedServices: 0 };
    }
  },

  async checkHealth(): Promise<{ status: "connected" | "disconnected" }> {
    try {
      const res = await fetch("/api/health");
      return res.ok ? { status: "connected" } : { status: "disconnected" };
    } catch {
      return { status: "disconnected" };
    }
  }
};
