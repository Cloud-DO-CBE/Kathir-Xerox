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
        className={`group flex items-center justify-between p-2.5 bg-white/95 hover:bg-white border rounded-xs transition-all cursor-pointer shadow-2xs ${
          isToday 
            ? 'border-sky-500/80 bg-sky-50/20' 
            : 'border-slate-200/90 hover:border-slate-400'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-xs flex items-center justify-center text-white shrink-0 border ${
            isToday ? 'bg-sky-600 border-sky-500' : isYesterday ? 'bg-slate-800 border-slate-700' : 'bg-slate-700 border-slate-600'
          }`}>
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-sky-700 transition-colors">
                Daybook — {formatDateDisplay(dateStr)}
              </h4>
              {isToday && (
                <span className="bg-sky-950 text-sky-400 text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-xs border border-sky-800">
                  LIVE
                </span>
              )}
              {isYesterday && (
                <span className="bg-slate-100 text-slate-700 text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-xs border border-slate-300">
                  YESTERDAY
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
              {entriesCount} entries • Cash: {formatINR(totalCash)} | UPI: {formatINR(totalUpi)}
              {totalDue > 0 && <span className="text-amber-700 font-bold"> • Due: {formatINR(totalDue)}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="font-mono font-bold text-xs sm:text-sm text-slate-900">
              {formatINR(totalGross)}
            </span>
            <p className="text-[9px] font-mono text-slate-400 uppercase">GROSS TOTAL</p>
          </div>

          <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xs transition-colors"
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
    );
  }

  // Grid View (Squared Corporate Tile)
  return (
    <div 
      onClick={() => onOpen(dateStr)}
      className={`group bg-white/95 rounded-xs border transition-all duration-150 flex flex-col overflow-hidden cursor-pointer shadow-2xs hover:shadow-md hover:border-slate-400 ${
        isToday 
          ? 'border-sky-500/80 ring-1 ring-sky-500/20' 
          : isYesterday
          ? 'border-slate-300'
          : 'border-slate-200/90'
      }`}
    >
      {/* Top Preview Canvas (Enterprise Mini Table) */}
      <div className="h-28 bg-slate-50/90 p-2 border-b border-slate-200 flex flex-col justify-between relative overflow-hidden group-hover:bg-slate-50">
        <div className="w-full bg-white rounded-xs border border-slate-200 shadow-2xs overflow-hidden text-[9px] font-mono">
          <div className="bg-slate-100 text-slate-600 px-1.5 py-0.5 flex items-center justify-between border-b border-slate-200 font-bold">
            <span className="w-10">TOKEN</span>
            <span className="flex-1 truncate px-1">SERVICE</span>
            <span className="w-8 text-center">MODE</span>
            <span className="w-12 text-right">TOTAL</span>
          </div>

          {previewRows.length === 0 ? (
            <div className="p-2 text-center text-slate-400 font-mono text-[9px]">
              No transactions recorded
            </div>
          ) : (
            previewRows.map((tx, idx) => (
              <div 
                key={tx.id || idx}
                className="px-1.5 py-0.5 flex items-center justify-between border-b border-slate-100 text-slate-700"
              >
                <span className="w-10 font-bold text-slate-900 truncate">{tx.token_no}</span>
                <span className="flex-1 truncate px-1 text-slate-600">
                  {tx.items[0]?.item_name || tx.customer_ref || 'Counter Bill'}
                </span>
                <span className="w-8 text-center font-bold text-[8px]">
                  {tx.payment_mode}
                </span>
                <span className="w-12 text-right font-bold text-slate-900">{formatINR(tx.grand_total)}</span>
              </div>
            ))
          )}
        </div>

        {/* Floating badge */}
        <div className="flex items-center justify-between mt-1">
          {isToday ? (
            <span className="bg-sky-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs border border-sky-400/40">
              LIVE REGISTER
            </span>
          ) : isYesterday ? (
            <span className="bg-slate-800 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs border border-slate-700">
              YESTERDAY
            </span>
          ) : (
            <span className="bg-slate-700 text-slate-200 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs">
              ARCHIVE
            </span>
          )}

          <span className="text-[9px] font-mono font-semibold bg-white text-slate-600 px-1 py-0.2 rounded-xs border border-slate-200">
            {entriesCount} {entriesCount === 1 ? 'row' : 'rows'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-2.5 flex flex-col justify-between flex-1 gap-2">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors truncate">
                Daybook — {formatDateDisplay(dateStr)}
              </h4>
              <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                {isToday ? 'Live Master Ledger' : isYesterday ? 'Closed Day Record' : 'Past Register File'}
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
