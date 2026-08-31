'use client';

import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  MessageSquare, 
  FileSpreadsheet, 
  Settings, 
  Clock, 
  Calendar, 
  Store, 
  Share2, 
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { formatDateDisplay, formatTime } from '@/lib/formatters';
import { ShopLogo } from '@/components/ShopLogo';

interface HeaderProps {
  onOpenDigest: () => void;
  onOpenExport: () => void;
  onOpenServices: () => void;
  onOpenPosModal?: () => void;
  totalTodayAmount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDigest,
  onOpenExport,
  onOpenServices,
  onOpenPosModal,
  totalTodayAmount,
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(formatDateDisplay(now.toISOString().split('T')[0]));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top micro bar for status & time */}
      <div className="bg-slate-950 px-4 py-1 text-xs flex items-center justify-between text-slate-400 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            DAYBOOK ACTIVE (12:00 AM – 11:59:59 PM IST)
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {dateStr || 'Loading...'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-emerald-300 font-semibold">
            <Clock className="w-3 h-3 text-emerald-400" />
            {time || '--:--:-- --'}
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Details */}
        <div className="flex items-center gap-3">
          <ShopLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Kathir Xerox
                <span className="text-xs bg-[#46D8E7]/20 text-[#46D8E7] font-medium px-1.5 py-0.5 rounded border border-[#46D8E7]/30">
                  e-Sevai Daybook
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              கதிர் ஜெராக்ஸ் & இ-சேவை மையம் • Merchant Register & POS
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick POS Trigger (Desktop & Mobile) */}
          {onOpenPosModal && (
            <button
              onClick={onOpenPosModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              title="Open full POS billing counter"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">POS Billing</span>
            </button>
          )}

          {/* 9:00 PM WhatsApp Digest Button */}
          <button
            onClick={onOpenDigest}
            className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
            title="Preview and Send 9:00 PM Daily WhatsApp Summary"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">9 PM WhatsApp Digest</span>
            <span className="md:hidden">Digest</span>
          </button>

          {/* Export Excel Button */}
          <button
            onClick={onOpenExport}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            title="Download Daybook as Excel Sheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {/* Services & Rate Catalogue Button */}
          <button
            onClick={onOpenServices}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            title="Service Catalogue & Pricing Rates"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
