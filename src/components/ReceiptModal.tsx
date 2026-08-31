'use client';

import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Store, 
  Check, 
  Phone, 
  Calendar,
  IndianRupee
} from 'lucide-react';
import { Transaction } from '@/types';
import { formatINR, formatTime } from '@/lib/formatters';
import { generateCustomerReceiptText, buildWhatsAppLink } from '@/lib/whatsappUtils';
import { ShopLogo } from '@/components/ShopLogo';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const text = generateCustomerReceiptText(transaction);
    const phone = transaction.customer_phone || '';
    const url = phone ? buildWhatsAppLink(phone, text) : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-brand-400" />
            <h3 className="font-bold text-xs sm:text-sm">Bill Slip & Thermal Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Slip Preview Box (80mm Thermal Printer Layout) */}
        <div className="p-4 bg-slate-100/70 flex justify-center">
          <div
            id="thermal-receipt"
            className="bg-white p-4 w-full max-w-[320px] rounded-lg shadow-sm border border-slate-300 font-mono text-xs text-slate-900 leading-tight"
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-slate-400 flex flex-col items-center">
              <ShopLogo size="md" className="mb-1.5" />
              <h2 className="font-extrabold text-sm uppercase tracking-wide">
                KATHIR XEROX
              </h2>
              <p className="text-[11px] font-sans font-bold text-slate-700">
                கதிர் ஜெராக்ஸ் & இ-சேவை மையம்
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Next to SNS complex, Perumal temple street , Senjeriputhur • Ph: 9842100000
              </p>
            </div>

            {/* Token & Meta */}
            <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
              <div className="flex justify-between font-bold">
                <span>TOKEN: {transaction.token_no}</span>
                <span>{formatTime(transaction.timestamp)}</span>
              </div>
              <div className="text-slate-600 text-[10px]">
                Date: {new Date(transaction.timestamp).toLocaleDateString('en-IN')}
              </div>
              {transaction.customer_ref && (
                <div className="text-slate-800 font-sans font-semibold">
                  Cust: {transaction.customer_ref} {transaction.customer_phone ? `(${transaction.customer_phone})` : ''}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-dashed border-slate-300">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="text-left pb-1 font-semibold">Item</th>
                    <th className="text-center pb-1 font-semibold">Qty</th>
                    <th className="text-right pb-1 font-semibold">Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transaction.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 pr-1 truncate max-w-[130px] font-sans">
                        {item.item_name}
                      </td>
                      <td className="py-1 text-center font-bold">{item.quantity}</td>
                      <td className="py-1 text-right font-bold">{formatINR(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="pt-2 text-[11px] space-y-1">
              <div className="flex justify-between text-xs font-extrabold border-b border-dashed border-slate-300 pb-1">
                <span>GRAND TOTAL:</span>
                <span>{formatINR(transaction.grand_total)}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[10px]">
                <span>Payment Mode:</span>
                <span className="font-bold">{transaction.payment_mode}</span>
              </div>
              {transaction.due_amount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold text-[11px]">
                  <span>PENDING DUE:</span>
                  <span>{formatINR(transaction.due_amount)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-500 font-sans">
              <p className="font-semibold text-slate-700">நன்றி! மீண்டும் வருக!</p>
              <p className="text-[9px] mt-0.5">Thank you! Please visit again.</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-white border-t border-slate-200 grid grid-cols-2 gap-2">
          <button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Slip</span>
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-all active:scale-95 shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
