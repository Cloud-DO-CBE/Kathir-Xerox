'use client';

import React, { useState } from 'react';
import { 
  Trash2, 
  Printer, 
  Share2, 
  Search, 
  Filter, 
  Check, 
  Edit3, 
  Phone, 
  ArrowUpDown, 
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';
import { Transaction, PaymentMode, ServiceCategory } from '@/types';
import { formatINR, formatTime } from '@/lib/formatters';
import { buildWhatsAppLink, generateCustomerReceiptText } from '@/lib/whatsappUtils';

interface SpreadsheetGridProps {
  transactions: Transaction[];
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onPrintReceipt: (tx: Transaction) => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  transactions,
  onUpdateTransaction,
  onDeleteTransaction,
  onPrintReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.token_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.customer_ref && tx.customer_ref.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.customer_phone && tx.customer_phone.includes(searchQuery)) ||
      tx.items.some((i) => i.item_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMode = filterMode === 'ALL' || tx.payment_mode === filterMode;
    return matchesSearch && matchesMode;
  });

  // Totals for filtered view
  const subtotalGross = filteredTransactions.reduce((acc, t) => acc + (t.grand_total || 0), 0);
  const subtotalCash = filteredTransactions.reduce((acc, t) => acc + (t.cash_amount || 0), 0);
  const subtotalUpi = filteredTransactions.reduce((acc, t) => acc + (t.upi_amount || 0), 0);
  const subtotalDue = filteredTransactions.reduce((acc, t) => acc + (t.due_amount || 0), 0);

  const handlePaymentModeChange = (tx: Transaction, newMode: PaymentMode) => {
    const total = tx.grand_total;
    const updates: Partial<Transaction> = {
      payment_mode: newMode,
      cash_amount: newMode === 'CASH' ? total : 0,
      upi_amount: newMode === 'UPI' ? total : 0,
      due_amount: newMode === 'DUE' ? total : 0,
    };
    onUpdateTransaction(tx.id, updates);
  };

  const handleShareWhatsApp = (tx: Transaction) => {
    const text = generateCustomerReceiptText(tx, 'Kathir Xerox & E-Service Centre');
    const phone = tx.customer_phone || '';
    const url = buildWhatsAppLink(phone, text);
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white/95 rounded-xs border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table rows..."
              className="pl-7 pr-2.5 py-1 bg-white border border-slate-300 rounded-xs text-xs outline-none focus:border-sky-500 w-36 sm:w-52 font-sans"
            />
          </div>

          {/* Payment Mode Filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xs px-2 py-1 text-slate-700 text-xs">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="bg-transparent text-xs font-mono font-medium outline-none cursor-pointer"
            >
              <option value="ALL">All Modes</option>
              <option value="CASH">CASH</option>
              <option value="UPI">UPI</option>
              <option value="DUE">DUE</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Showing <strong className="text-slate-800">{filteredTransactions.length}</strong> of {transactions.length} rows
        </div>
      </div>

      {/* Corporate Table Grid */}
      <div className="overflow-x-auto text-black">
        <table className="w-full text-left corporate-table border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-black">
              <th className="w-12 text-center text-black font-black">#</th>
              <th className="w-28 text-black font-black">
                <div>டோக்கன்</div>
                <div className="text-[9px] text-slate-800 font-bold">Token No</div>
              </th>
              <th className="w-24 text-black font-black">
                <div>நேரம்</div>
                <div className="text-[9px] text-slate-800 font-bold">Time</div>
              </th>
              <th className="min-w-[190px] text-black font-black">
                <div>சேவை விபரம்</div>
                <div className="text-[9px] text-slate-800 font-bold">Service Breakdown</div>
              </th>
              <th className="min-w-[140px] text-black font-black">
                <div>வாடிக்கையாளர்</div>
                <div className="text-[9px] text-slate-800 font-bold">Customer</div>
              </th>
              <th className="w-24 text-center text-black font-black">
                <div>முறை</div>
                <div className="text-[9px] text-slate-800 font-bold">Mode</div>
              </th>
              <th className="w-28 text-right text-black font-black">
                <div>மொத்தம்</div>
                <div className="text-[9px] text-slate-800 font-bold">Total</div>
              </th>
              <th className="w-28 text-center text-black font-black">
                <div>செயல்</div>
                <div className="text-[9px] text-slate-800 font-bold">Actions</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-black text-xs font-bold font-mono">
                  பதிவுகள் எதுவும் இல்லை / No records found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, idx) => (
                <tr 
                  key={tx.id}
                  className="hover:bg-slate-100 transition-colors"
                >
                  {/* Row # */}
                  <td className="text-center font-mono text-black font-bold text-[11px]">
                    {idx + 1}
                  </td>

                  {/* Token */}
                  <td>
                    <span className="font-mono font-black text-xs bg-slate-100 text-black px-1.5 py-0.5 rounded-xs border border-slate-400">
                      {tx.token_no}
                    </span>
                  </td>

                  {/* Time */}
                  <td className="font-mono text-[11px] text-black font-bold">
                    {formatTime(tx.timestamp)}
                  </td>

                  {/* Services Breakdown */}
                  <td>
                    <div className="space-y-0.5">
                      {tx.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="text-xs text-black flex items-center justify-between gap-2">
                          <span className="truncate font-black text-black">{item.item_name}</span>
                          <span className="text-[11px] font-mono text-black font-black shrink-0">
                            x{item.quantity} ({formatINR(item.subtotal)})
                          </span>
                        </div>
                      ))}
                      {tx.notes && (
                        <p className="text-[10px] text-black font-semibold italic truncate">
                          {tx.notes}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Customer */}
                  <td>
                    <div className="text-xs">
                      <p className="font-black text-black truncate">
                        {tx.customer_ref || 'கவுண்டர் வாடிக்கையாளர் (Counter)'}
                      </p>
                      {tx.customer_phone && (
                        <p className="text-[10px] font-mono font-bold text-black truncate">
                          {tx.customer_phone}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Payment Mode Selector */}
                  <td className="text-center">
                    <select
                      value={tx.payment_mode}
                      onChange={(e) => handlePaymentModeChange(tx, e.target.value as PaymentMode)}
                      className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-xs border outline-none cursor-pointer ${
                        tx.payment_mode === 'CASH'
                          ? 'bg-emerald-100 text-black border-emerald-400'
                          : tx.payment_mode === 'UPI'
                          ? 'bg-sky-100 text-black border-sky-400'
                          : 'bg-amber-100 text-black border-amber-400'
                      }`}
                    >
                      <option value="CASH">ரொக்கம் (CASH)</option>
                      <option value="UPI">ஜிபே (UPI)</option>
                      <option value="DUE">பாக்கி (DUE)</option>
                    </select>
                  </td>

                  {/* Grand Total */}
                  <td className="text-right font-mono font-black text-xs sm:text-sm text-black">
                    {formatINR(tx.grand_total)}
                  </td>

                  {/* Actions */}
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Print Receipt */}
                      <button
                        onClick={() => onPrintReceipt(tx)}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xs border border-slate-200"
                        title="Print Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* WhatsApp Receipt */}
                      <button
                        onClick={() => handleShareWhatsApp(tx)}
                        className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xs border border-emerald-200"
                        title="Send WhatsApp Receipt"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xs border border-slate-200"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {/* Table Summary Footer */}
          {filteredTransactions.length > 0 && (
            <tfoot className="bg-slate-100 font-mono font-black text-xs border-t-2 border-slate-400 text-black">
              <tr>
                <td colSpan={3} className="text-right text-black uppercase text-[10px] py-2 font-black">
                  மொத்த விபரம் / SUMMARY:
                </td>
                <td colSpan={3} className="text-black text-[11px] py-2">
                  ரொக்கம்: <strong className="text-emerald-950 font-black">{formatINR(subtotalCash)}</strong> | ஜிபே: <strong className="text-sky-950 font-black">{formatINR(subtotalUpi)}</strong>
                  {subtotalDue > 0 && <span> | பாக்கி: <strong className="text-amber-950 font-black">{formatINR(subtotalDue)}</strong></span>}
                </td>
                <td className="text-right text-black text-sm py-2 font-black">
                  {formatINR(subtotalGross)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
