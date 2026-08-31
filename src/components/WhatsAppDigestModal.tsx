'use client';

import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Copy, 
  Check, 
  Send, 
  Clock, 
  Sparkles, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Transaction } from '@/types';
import { computeDailyDigestData, generateDailyDigestText, buildWhatsAppLink } from '@/lib/whatsappUtils';
import { db } from '@/lib/db';
import { getTodayDateString } from '@/lib/formatters';

interface WhatsAppDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  selectedDate?: string;
}

export const WhatsAppDigestModal: React.FC<WhatsAppDigestModalProps> = ({
  isOpen,
  onClose,
  transactions,
  selectedDate,
}) => {
  const [copied, setCopied] = useState(false);
  const [ownerPhone, setOwnerPhone] = useState('9842100000');
  const [cronStatus, setCronStatus] = useState<string | null>(null);
  const [isLoadingCron, setIsLoadingCron] = useState(false);

  if (!isOpen) return null;

  const dateStr = selectedDate || getTodayDateString();
  const digestData = computeDailyDigestData(transactions, dateStr);
  const formattedMessage = generateDailyDigestText(digestData);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToWhatsApp = () => {
    const url = buildWhatsAppLink(ownerPhone, formattedMessage);
    window.open(url, '_blank');
  };

  const handleTestCronApi = async () => {
    setIsLoadingCron(true);
    setCronStatus('Triggering API...');
    try {
      const res = await fetch('/api/cron/whatsapp-digest?key=kathir_secret_token_9pm');
      const data = await res.json();
      if (data.success) {
        setCronStatus('9:00 PM Cron Trigger Verified Successfully!');
      } else {
        setCronStatus(`Cron response: ${data.error || 'Failed'}`);
      }
    } catch (err: any) {
      setCronStatus(`Network error: ${err.message}`);
    } finally {
      setIsLoadingCron(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                9:00 PM Daily WhatsApp Summary
              </h3>
              <p className="text-[11px] text-emerald-200">
                Automated digest for Shop Owner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Cron schedule badge */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-900">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Scheduled Daily Trigger: </span>
              <span>Every night at <strong>9:00:00 PM IST</strong> via cron service.</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Automatically calculates total collection, cash vs UPI, and top 3 services.
              </p>
            </div>
          </div>

          {/* Owner WhatsApp Number Input */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Owner WhatsApp Phone Number
            </label>
            <div className="flex items-center gap-2">
              <span className="bg-slate-200 px-2 py-1.5 rounded-lg font-mono font-bold text-slate-700">
                +91
              </span>
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* WhatsApp Chat Preview Card */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Live Message Preview:
              </span>
              <button
                onClick={handleCopy}
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Text'}
              </button>
            </div>

            {/* Simulated WhatsApp bubble */}
            <div className="bg-[#EFEAE2] p-3 rounded-xl border border-slate-300/80 shadow-inner">
              <div className="bg-[#DCF8C6] text-slate-900 p-3 rounded-lg shadow-xs text-xs font-mono whitespace-pre-wrap leading-relaxed border border-emerald-200 max-h-56 overflow-y-auto">
                {formattedMessage}
              </div>
            </div>
          </div>

          {/* API Verification Result */}
          {cronStatus && (
            <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono">
              {cronStatus}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={handleSendToWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-sm transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>

            <button
              onClick={handleTestCronApi}
              disabled={isLoadingCron}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCron ? 'animate-spin' : ''}`} />
              <span>Test Cron API</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
