'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Search, 
  X, 
  FileSpreadsheet, 
  MessageSquare, 
  PlusCircle, 
  Settings, 
  Clock, 
  Store,
  ArrowRight,
  Lock
} from 'lucide-react';
import { formatDateDisplay, formatINR } from '@/lib/formatters';
import { Transaction } from '@/types';
import { ShopLogo } from '@/components/ShopLogo';

interface GoogleDocsHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenDigest: () => void;
  onOpenExport: () => void;
  onOpenServices: () => void;
  onOpenPosModal?: () => void;
  transactions?: Transaction[];
  onSelectTransaction?: (tx: Transaction) => void;
  onSelectDate?: (dateStr: string) => void;
  todayGross: number;
}

export const GoogleDocsHeader: React.FC<GoogleDocsHeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onOpenDigest,
  onOpenExport,
  onOpenServices,
  onOpenPosModal,
  transactions = [],
  onSelectTransaction,
  onSelectDate,
  todayGross,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRecords = searchQuery.trim() === '' ? [] : transactions.filter((tx) => {
    const query = searchQuery.toLowerCase();
    const matchToken = tx.token_no?.toLowerCase().includes(query);
    const matchCust = tx.customer_ref?.toLowerCase().includes(query);
    const matchPhone = tx.customer_phone?.toLowerCase().includes(query);
    const matchDate = tx.timestamp?.includes(query);
    const matchNotes = tx.notes?.toLowerCase().includes(query);
    const matchItems = tx.items?.some(i => i.item_name.toLowerCase().includes(query));
    return matchToken || matchCust || matchPhone || matchDate || matchNotes || matchItems;
  }).slice(0, 6);

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2 md:gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-xs hover:bg-slate-100 text-slate-600 transition-colors focus:outline-none border border-slate-200"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <ShopLogo size="sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg sm:text-xl font-black text-black tracking-tight leading-none">
                  கதிர் ஜெராக்ஸ்
                </span>
                <span className="hidden sm:inline-block bg-black text-white text-[10px] font-mono font-black px-1.5 py-0.5 rounded-xs border border-black">
                  பதிவேடு
                </span>
              </div>
              <p className="text-[10px] text-black font-semibold leading-none mt-0.5 hidden sm:block">
                Kathir Xerox & E-Service Centre • POS & Daybook
              </p>
            </div>
          </div>
        </div>

        {/* Center: Command Search Input */}
        <div 
          ref={searchContainerRef}
          className="flex-1 max-w-lg relative mx-1 sm:mx-3"
        >
          <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xs transition-all duration-150 ${
            isSearchFocused
              ? 'bg-white border border-sky-500 shadow-xs ring-1 ring-sky-500/20'
              : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200'
          }`}>
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search entries, tokens, customers, bills..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-0.5 text-slate-400 hover:text-slate-700 rounded-xs"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchFocused && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xs shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="p-2 bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-semibold text-slate-500 flex items-center justify-between">
                <span>MATCHING RECORDS ({filteredRecords.length})</span>
                <span className="text-slate-400">ESC TO CLOSE</span>
              </div>
              {filteredRecords.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 font-mono">
                  No records matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {filteredRecords.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => {
                        if (onSelectTransaction) onSelectTransaction(tx);
                        if (onSelectDate) onSelectDate(tx.timestamp.split('T')[0]);
                        setIsSearchFocused(false);
                      }}
                      className="p-2 hover:bg-sky-50/70 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-[11px] bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded-xs text-slate-800 shrink-0">
                          {tx.token_no}
                        </span>
                        <div className="min-w-0 truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {tx.customer_ref || 'Counter Customer'}
                            {tx.customer_phone && ` (${tx.customer_phone})`}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">
                            {tx.items.map(i => `${i.item_name} x${i.quantity}`).join(', ') || tx.notes || 'General entry'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {formatINR(tx.grand_total)}
                        </span>
                        <p className="text-[9px] text-slate-400 font-mono">
                          {formatDateDisplay(tx.timestamp.split('T')[0])}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Tools & Metrics */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-2 bg-sky-50 border border-sky-200 px-2 py-1 rounded-xs text-xs font-mono text-sky-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold">{formatINR(todayGross)}</span>
            <span className="text-[10px] text-sky-700">TODAY</span>
          </div>

          {onOpenPosModal && (
            <button
              onClick={onOpenPosModal}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-xs flex items-center gap-1.5 transition-all shadow-2xs border border-slate-700 active:scale-98"
              title="Open full POS billing counter [F2]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">POS Counter</span>
              <span className="hidden md:inline text-[9px] bg-white/20 px-1 py-0.2 rounded-xs font-mono">F2</span>
            </button>
          )}

          <button
            onClick={onOpenDigest}
            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xs transition-colors border border-slate-200 hover:border-emerald-200"
            title="9:00 PM Daily WhatsApp Summary Dispatch"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenExport}
            className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-xs transition-colors border border-slate-200 hover:border-sky-200"
            title="Download Daybook as Excel Sheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenServices}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xs transition-colors border border-slate-200"
            title="Service Catalogue, Settings & Security"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={async () => {
              localStorage.removeItem('kx_session_auth');
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
              } catch {}
              window.location.href = '/login';
            }}
            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xs transition-colors border border-slate-200 hover:border-rose-200"
            title="Lock Register & Logout (பூட்டு)"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>

          <div className="hidden xl:flex items-center gap-1 text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-xs border border-slate-200">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{time || '--:--:--'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
