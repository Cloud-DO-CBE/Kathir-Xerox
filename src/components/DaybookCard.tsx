'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  MoreVertical, 
  Eye, 
  MessageSquare, 
  Download, 
  Calendar, 
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Transaction } from '@/types';
import { formatDateDisplay, formatINR } from '@/lib/formatters';

interface DaybookCardProps {
  dateStr: string;
  transactions: Transaction[];
  isToday?: boolean;
  isYesterday?: boolean;
  viewMode?: 'grid' | 'list';
  onOpen: (dateStr: string) => void;
  onSendDigest: (dateStr: string, transactions: Transaction[]) => void;
  onExport: (dateStr: string) => void;
  onOpenReceipts?: (dateStr: string) => void;
}

export const DaybookCard: React.FC<DaybookCardProps> = ({
  dateStr,
  transactions,
  isToday = false,
  isYesterday = false,
  viewMode = 'grid',
  onOpen,
  onSendDigest,
  onExport,
  onOpenReceipts,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const totalGross = transactions.reduce((sum, t) => sum + (t.grand_total || 0), 0);
  const totalCash = transactions.reduce((sum, t) => sum + (t.cash_amount || 0), 0);
  const totalUpi = transactions.reduce((sum, t) => sum + (t.upi_amount || 0), 0);
  const totalDue = transactions.reduce((sum, t) => sum + (t.due_amount || 0), 0);
  const entriesCount = transactions.length;

  const previewRows = transactions.slice(0, 4);

  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => onOpen(dateStr)}
        className={`group flex items-center justify-between p-2.5 bg-white hover:bg-slate-50 border rounded-xs transition-all cursor-pointer shadow-2xs text-black ${
          isToday 
            ? 'border-black bg-slate-50' 
            : 'border-slate-300 hover:border-black'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-xs flex items-center justify-center text-white shrink-0 border ${
            isToday ? 'bg-black border-black font-black' : isYesterday ? 'bg-slate-800 border-slate-700' : 'bg-slate-700 border-slate-600'
          }`}>
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-black truncate leading-tight">
                நாள் பதிவேடு — {formatDateDisplay(dateStr)}
              </h4>
              {isToday && (
                <span className="bg-black text-white text-[9px] font-black font-mono px-1.5 py-0.2 rounded-xs border border-black">
                  நேரலை / LIVE
                </span>
              )}
              {isYesterday && (
                <span className="bg-slate-200 text-black text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-xs border border-slate-400">
                  நேற்று / YESTERDAY
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-black font-bold mt-0.5">
              {entriesCount} பதிவுகள் • ரொக்கம்: {formatINR(totalCash)} | ஜிபே: {formatINR(totalUpi)}
              {totalDue > 0 && <span className="text-amber-950 font-black"> • பாக்கி: {formatINR(totalDue)}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="font-mono font-black text-xs sm:text-sm text-black">
              {formatINR(totalGross)}
            </span>
            <p className="text-[9px] font-mono text-slate-800 font-bold uppercase">மொத்த தொகை</p>
          </div>

          <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-black hover:bg-slate-200 rounded-xs transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-black text-white rounded-xs shadow-2xl border border-slate-700 py-1 z-50 text-xs">
                <button
                  onClick={() => { onOpen(dateStr); setIsMenuOpen(false); }}
                  className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2 font-bold"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>பதிவேட்டை திற (Open)</span>
                </button>
                <button
                  onClick={() => { onSendDigest(dateStr, transactions); setIsMenuOpen(false); }}
                  className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2 font-bold"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>வாட்ஸ்அப் அறிக்கை (WhatsApp)</span>
                </button>
                <button
                  onClick={() => { onExport(dateStr); setIsMenuOpen(false); }}
                  className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2 font-bold"
                >
                  <Download className="w-3.5 h-3.5 text-slate-300" />
                  <span>எக்செல் பதிவிறக்கு (Excel)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Squared Corporate Tile)
  return (
    <div 
      onClick={() => onOpen(dateStr)}
      className={`group bg-white rounded-xs border transition-all duration-150 flex flex-col overflow-hidden cursor-pointer shadow-2xs hover:shadow-md text-black ${
        isToday 
          ? 'border-black ring-1 ring-black/20' 
          : isYesterday
          ? 'border-slate-400'
          : 'border-slate-300 hover:border-black'
      }`}
    >
      {/* Top Preview Canvas (Enterprise Mini Table) */}
      <div className="h-28 bg-slate-50 p-2 border-b border-slate-300 flex flex-col justify-between relative overflow-hidden group-hover:bg-slate-100">
        <div className="w-full bg-white rounded-xs border border-slate-300 shadow-2xs overflow-hidden text-[9px] font-mono">
          <div className="bg-slate-100 text-black px-1.5 py-0.5 flex items-center justify-between border-b border-slate-300 font-black">
            <span className="w-10">டோக்கன்</span>
            <span className="flex-1 truncate px-1">சேவை</span>
            <span className="w-8 text-center">முறை</span>
            <span className="w-12 text-right">மொத்தம்</span>
          </div>

          {previewRows.length === 0 ? (
            <div className="p-2 text-center text-black font-mono text-[9px] font-bold">
              பதிவுகள் எதுவும் இல்லை
            </div>
          ) : (
            previewRows.map((tx, idx) => (
              <div 
                key={tx.id || idx}
                className="px-1.5 py-0.5 flex items-center justify-between border-b border-slate-100 text-black font-medium"
              >
                <span className="w-10 font-black text-black truncate">{tx.token_no}</span>
                <span className="flex-1 truncate px-1 text-black font-bold">
                  {tx.items[0]?.item_name || tx.customer_ref || 'Counter Bill'}
                </span>
                <span className="w-8 text-center font-black text-[8px]">
                  {tx.payment_mode}
                </span>
                <span className="w-12 text-right font-black text-black">{formatINR(tx.grand_total)}</span>
              </div>
            ))
          )}
        </div>

        {/* Floating badge */}
        <div className="flex items-center justify-between mt-1">
          {isToday ? (
            <span className="bg-black text-white text-[9px] font-mono font-black px-1.5 py-0.2 rounded-xs border border-black">
              நேரலை / LIVE
            </span>
          ) : isYesterday ? (
            <span className="bg-slate-800 text-white text-[9px] font-mono font-black px-1.5 py-0.2 rounded-xs border border-slate-700">
              நேற்று / YESTERDAY
            </span>
          ) : (
            <span className="bg-slate-700 text-white text-[9px] font-mono font-black px-1.5 py-0.2 rounded-xs">
              பழைய பதிவு / ARCHIVE
            </span>
          )}

          <span className="text-[9px] font-mono font-black bg-white text-black px-1 py-0.2 rounded-xs border border-slate-300">
            {entriesCount} பதிவுகள்
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-2.5 flex flex-col justify-between flex-1 gap-2">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-xs font-black text-black truncate leading-tight">
                நாள் பதிவேடு — {formatDateDisplay(dateStr)}
              </h4>
              <p className="text-[10px] text-slate-800 font-bold font-mono truncate mt-0.5">
                {isToday ? 'இன்றைய பதிவு (Today Ledger)' : isYesterday ? 'நேற்றைய பதிவு (Yesterday)' : 'பழைய பதிவு (Past Record)'}
              </p>
            </div>

            {/* Context Menu */}
            <div className="relative shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xs transition-colors"
                title="Options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 text-slate-200 rounded-xs shadow-2xl border border-slate-700 py-1 z-50 text-xs">
                  <button
                    onClick={() => { onOpen(dateStr); setIsMenuOpen(false); }}
                    className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2 font-medium"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>Open Daybook</span>
                  </button>
                  <button
                    onClick={() => { onSendDigest(dateStr, transactions); setIsMenuOpen(false); }}
                    className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2 font-medium"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Summary</span>
                  </button>
                  <button
                    onClick={() => { onExport(dateStr); setIsMenuOpen(false); }}
                    className="w-full px-3 py-1.5 text-left hover:bg-slate-800 flex items-center gap-2 font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-300" />
                    <span>Export to Excel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="pt-1.5 border-t border-slate-100 flex items-end justify-between gap-1">
          <div>
            <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
              <span>C: {formatINR(totalCash)}</span>
              <span>•</span>
              <span>U: {formatINR(totalUpi)}</span>
            </div>
            {totalDue > 0 && (
              <span className="text-[9px] font-bold text-amber-700 font-mono">
                Due: {formatINR(totalDue)}
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="font-mono font-bold text-xs sm:text-sm text-slate-900">
              {formatINR(totalGross)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
