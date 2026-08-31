export type ServiceCategory = 
  | 'XEROX'
  | 'PRINT'
  | 'E_SERVICE'
  | 'LAMINATION'
  | 'STATIONERY'
  | 'OTHER';

export type PaymentMode = 'CASH' | 'UPI' | 'DUE' | 'SPLIT';

export interface ServiceItem {
  id: string;
  name: string;
  name_ta?: string;
  category: ServiceCategory;
  default_unit_price: number;
  unit_label?: string; // 'page', 'side', 'card', 'copy', 'piece', 'appl'
  is_active: boolean;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  service_id: string;
  item_name: string;
  category: ServiceCategory;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  book_id: string;
  timestamp: string; // ISO string
  token_no: string;
  payment_mode: PaymentMode;
  customer_ref?: string;
  customer_phone?: string;
  grand_total: number;
  cash_amount: number;
  upi_amount: number;
  due_amount: number;
  notes?: string;
  items: TransactionItem[];
}

export interface DailyBook {
  id: string;
  date: string; // YYYY-MM-DD
  status: 'OPEN' | 'CLOSED';
  total_cash: number;
  total_upi: number;
  total_due: number;
  total_amount: number;
  total_transactions: number;
  closed_at?: string | null;
}

export interface CategorySummary {
  category: ServiceCategory;
  label: string;
  label_ta: string;
  total_amount: number;
  item_count: number;
  color: string;
}

export interface HourlySummary {
  hour: number;
  hour_label: string;
  total_amount: number;
  transaction_count: number;
}

export interface DueCustomer {
  customer_ref: string;
  customer_phone?: string;
  total_due: number;
  transactions: {
    transaction_id: string;
    token_no: string;
    date: string;
    amount: number;
  }[];
}

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
