import { ServiceItem, Transaction, DailyBook, DueCustomer } from "@/types";
import { db, AppSettings, DEFAULT_SETTINGS } from "./db";

/**
 * Universal Data Layer for Kathir Xerox & E-Service Centre
 * Communicates with Next.js REST API backed by Neon PostgreSQL,
 * with fallback to local client storage.
 */
export const api = {
  async getServices(): Promise<ServiceItem[]> {
    try {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        db.saveServices(data);
        return data;
      }
      return db.getServices();
    } catch {
      return db.getServices();
    }
  },

  async saveService(service: ServiceItem): Promise<ServiceItem> {
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });
      if (!res.ok) throw new Error("Failed to save service");
      const saved = await res.json();
      return saved;
    } catch {
      // Fallback local save
      const current = db.getServices();
      const idx = current.findIndex((s) => s.id === service.id);
      if (idx >= 0) current[idx] = service;
      else current.push(service);
      db.saveServices(current);
      return service;
    }
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
      // Keep local store in sync
      const local = db.getTransactions();
      db.saveTransactions([saved, ...local]);
      return saved;
    } catch {
      // Offline fallback
      return db.addTransaction(txData);
    }
  },

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
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
      if (!res.ok) throw new Error("Failed to fetch daily book");
      return await res.json();
    } catch {
      return null;
    }
  },

  async setDailyBookStatus(date: string, status: "OPEN" | "CLOSED"): Promise<DailyBook | null> {
    try {
      const res = await fetch("/api/daily-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, status }),
      });
      if (!res.ok) throw new Error("Failed to update daily book status");
      return await res.json();
    } catch {
      return null;
    }
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

  async syncOfflineData(): Promise<{ success: boolean; syncedTransactions: number; syncedServices: number }> {
    try {
      const transactions = db.getTransactions();
      const services = db.getServices();
      const settings = db.getSettings();

      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, services, settings }),
      });

      if (!res.ok) throw new Error("Sync failed");
      return await res.json();
    } catch (e: any) {
      return { success: false, syncedTransactions: 0, syncedServices: 0 };
    }
  },

  async checkHealth(): Promise<{ status: "connected" | "disconnected" | "error"; message?: string }> {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      return data;
    } catch {
      return { status: "disconnected", message: "Cannot reach database" };
    }
  },
};
