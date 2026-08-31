'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, X, Copy, Check, Sparkles, Phone } from 'lucide-react';
import { Transaction } from '@/types';
import { formatINR } from '@/lib/formatters';

interface AutoWhatsAppToastProps {
  tx: Transaction | null;
  whatsappUrl: string;
  targetPhone: string;
  targetName: string;
  messageText: string;
  onClose: () => void;
}

export const AutoWhatsAppToast: React.FC<AutoWhatsAppToastProps> = ({
  tx,
  whatsappUrl,
  targetPhone,
  targetName,
  messageText,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [autoOpened, setAutoOpened] = useState(false);

  useEffect(() => {
    if (!tx || !whatsappUrl) return;

    // Countdown for auto-opening
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!autoOpened) {
            setAutoOpened(true);
            try {
              window.open(whatsappUrl, '_blank');
            } catch (e) {
              console.error('Popup blocked', e);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tx, whatsappUrl, autoOpened]);

  if (!tx) return null;

  const handleManualOpen = () => {
    setAutoOpened(true);
    window.open(whatsappUrl, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-14 right-3 sm:right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl border border-sky-500/40 p-4 relative overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-600 animate-pulse" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-600/30 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1">
                  <span>WhatsApp Message Ready</span>
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                </h4>
              </div>
              <p className="text-[11px] text-slate-300">
                Bill for Token <span className="font-mono font-bold text-sky-300">{tx.token_no}</span> ({formatINR(tx.grand_total)})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipient details */}
        <div className="mt-3 p-2 bg-slate-800/90 rounded-lg border border-slate-700/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate">
              Recipient: <strong className="text-white">{targetName || 'Customer'}</strong>
              {targetPhone && ` (${targetPhone})`}
            </span>
          </div>
          {countdown > 0 && !autoOpened && (
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded-md border border-sky-800">
              Auto-open in {countdown}s
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleManualOpen}
            className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-600/30 active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
