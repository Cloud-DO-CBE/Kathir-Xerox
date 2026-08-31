'use client';

import React, { useState } from 'react';
import { 
  BookUser, 
  IndianRupee, 
  Send, 
  CheckCircle2, 
  Phone, 
  Calendar, 
  Search, 
  Wallet, 
  QrCode,
  X
} from 'lucide-react';
import { DueCustomer } from '@/types';
import { formatINR, formatDateDisplay } from '@/lib/formatters';
import { generateDueReminderText, buildWhatsAppLink } from '@/lib/whatsappUtils';

interface DueTrackerProps {
  dueCustomers: DueCustomer[];
  onSettleDue: (customerRef: string, amount: number, mode: 'CASH' | 'UPI') => void;
}

export const DueTracker: React.FC<DueTrackerProps> = ({
  dueCustomers,
  onSettleDue,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [settleModalCustomer, setSettleModalCustomer] = useState<DueCustomer | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleMode, setSettleMode] = useState<'CASH' | 'UPI'>('CASH');

  const totalOutstanding = dueCustomers.reduce((acc, c) => acc + c.total_due, 0);

  const filtered = dueCustomers.filter((c) =>
    c.customer_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.customer_phone && c.customer_phone.includes(searchQuery))
  );

  const handleOpenSettle = (customer: DueCustomer) => {
    setSettleModalCustomer(customer);
    setSettleAmount(customer.total_due);
  };

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleModalCustomer || settleAmount <= 0) return;
    onSettleDue(settleModalCustomer.customer_ref, settleAmount, settleMode);
    setSettleModalCustomer(null);
  };

  const handleSendReminder = (customer: DueCustomer) => {
    const text = generateDueReminderText(customer.customer_ref, customer.total_due);
    const phone = customer.customer_phone || '';
    const url = phone ? buildWhatsAppLink(phone, text) : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-3 text-black">
      {/* Top Banner */}
      <div className="bg-white p-3.5 rounded-xs border border-amber-400 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xs bg-amber-100 text-black flex items-center justify-center border border-amber-300">
            <BookUser className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-black text-black">
              வாடிக்கையாளர் கடன் பாக்கி கணக்கு
            </h2>
            <p className="text-[11px] text-slate-800 font-bold">
              Customer Khata & Due Ledger • WhatsApp Payment Reminders
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-black font-mono font-black uppercase tracking-wider block">
            மொத்த பாக்கி / TOTAL OUTSTANDING
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-black">
            {formatINR(totalOutstanding)}
          </span>
        </div>
      </div>

      {/* Search and List */}
      <div className="bg-white rounded-xs border border-slate-300 shadow-2xs p-3">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-black absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="பெயர் அல்லது போன் எண் தேடுக / Search customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-400 rounded-xs text-xs font-bold text-black outline-none focus:border-black placeholder:text-slate-600"
            />
          </div>
          <span className="text-xs font-mono font-bold text-black">
            {filtered.length} வாடிக்கையாளர்கள் ({filtered.length} customers)
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-8 text-center text-black font-bold text-xs font-mono">
            பாக்கி எதுவும் இல்லை / No pending dues
          </div>
        ) : (
          <div className="divide-y divide-slate-300 border border-slate-300 rounded-xs overflow-hidden">
            {filtered.map((customer) => (
              <div
                key={customer.customer_ref}
                className="p-3 bg-white hover:bg-slate-50 flex flex-wrap items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xs bg-amber-100 text-black flex items-center justify-center font-black text-xs font-mono border border-amber-300">
                    {customer.customer_ref.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-black">
                      {customer.customer_ref}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-black mt-0.5">
                      {customer.customer_phone ? (
                        <span className="flex items-center gap-1 text-black font-black">
                          <Phone className="w-3 h-3 text-black" />
                          {customer.customer_phone}
                        </span>
                      ) : (
                        <span className="text-slate-600">எண் இல்லை (No phone)</span>
                      )}
                      <span>•</span>
                      <span>கடைசி: {customer.transactions[0]?.date ? formatDateDisplay(customer.transactions[0].date) : 'Pending'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-800 font-bold block">பாக்கி தொகை / Due</span>
                    <span className="text-sm sm:text-base font-black font-mono text-black">
                      {formatINR(customer.total_due)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSendReminder(customer)}
                      className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-black rounded-xs text-xs font-mono font-black flex items-center gap-1 transition-colors border border-emerald-400"
                      title="Send WhatsApp Reminder"
                    >
                      <Send className="w-3 h-3 text-black" />
                      <span>நினைவூட்டு / Remind</span>
                    </button>

                    <button
                      onClick={() => handleOpenSettle(customer)}
                      className="px-3 py-1.5 bg-black hover:bg-slate-800 text-white rounded-xs text-xs font-mono font-black flex items-center gap-1 transition-all active:scale-95 border border-black shadow-2xs"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>வசூல் / Settle</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settle Due Modal Dialog */}
      {settleModalCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-xs shadow-2xl border border-slate-300 max-w-sm w-full p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-serif font-bold text-base text-slate-900">
                Settle Customer Due
              </h3>
              <button
                onClick={() => setSettleModalCustomer(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>Customer: <strong className="text-slate-900">{settleModalCustomer.customer_ref}</strong></p>
              <p>Total Outstanding: <strong className="text-amber-700 font-mono">{formatINR(settleModalCustomer.total_due)}</strong></p>
            </div>

            <form onSubmit={handleConfirmSettle} className="space-y-3 pt-1">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                  Settlement Amount (₹)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max={settleModalCustomer.total_due}
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-xs px-3 py-1.5 text-sm font-mono font-bold text-slate-900 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-slate-500 mb-1">
                  Payment Mode Received
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettleMode('CASH')}
                    className={`py-1.5 px-3 rounded-xs text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      settleMode === 'CASH'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>CASH</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettleMode('UPI')}
                    className={`py-1.5 px-3 rounded-xs text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      settleMode === 'UPI'
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>UPI / GPAY</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSettleModalCustomer(null)}
                  className="px-3 py-1.5 rounded-xs text-xs font-mono text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xs bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold border border-slate-900 shadow-2xs"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
