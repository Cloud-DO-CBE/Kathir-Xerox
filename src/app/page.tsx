'use client';

import React, { useState, useEffect } from 'react';
import { GoogleDocsHeader } from '@/components/GoogleDocsHeader';
import { GoogleSidePanel } from '@/components/GoogleSidePanel';
import { DaybookCard } from '@/components/DaybookCard';
import { DaySummaryCards } from '@/components/DaySummaryCards';
import { QuickEntryBar } from '@/components/QuickEntryBar';
import { SpreadsheetGrid } from '@/components/SpreadsheetGrid';
import { ReceiptModal } from '@/components/ReceiptModal';
import { WhatsAppDigestModal } from '@/components/WhatsAppDigestModal';
import { ExportModal } from '@/components/ExportModal';
import { ServiceCatalogueModal } from '@/components/ServiceCatalogueModal';
import { PosCounter } from '@/components/PosCounter';
import { AutoWhatsAppToast } from '@/components/AutoWhatsAppToast';
import { WelcomeLanding } from '@/components/WelcomeLanding';
import { db } from '@/lib/db';
import { ServiceItem, Transaction, PaymentMode, DueCustomer } from '@/types';
import { getTodayDateString, formatDateDisplay, formatINR } from '@/lib/formatters';
import { triggerAutoWhatsAppMessage } from '@/lib/whatsappUtils';
import { 
  Plus, 
  FileSpreadsheet, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  Calendar, 
  Calculator, 
  Zap, 
  MessageSquare, 
  Download, 
  ArrowLeft, 
  PlusCircle, 
  X, 
  ChevronRight,
  Search,
  Filter,
  FolderOpen,
  Store,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [dueCustomers, setDueCustomers] = useState<DueCustomer[]>([]);
  
  // UI & View Mode states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'revenue_desc' | 'orders_desc'>('date_desc');
  const [bookFilterQuery, setBookFilterQuery] = useState('');
  
  // Active mode: 'home_hub' vs 'sheet_editor'
  const [activeView, setActiveView] = useState<'home_hub' | 'sheet_editor'>('home_hub');
  const [activeDate, setActiveDate] = useState<string>(getTodayDateString());

  // Modals state
  const [isDigestOpen, setIsDigestOpen] = useState(false);
  const [digestDate, setDigestDate] = useState<string>(getTodayDateString());
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportDate, setExportDate] = useState<string>(getTodayDateString());
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  const todayStr = getTodayDateString();

  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  useEffect(() => {
    const isAuth = localStorage.getItem('kx_session_auth') === 'true';
    setIsAuthenticated(isAuth);
    setServices(db.getServices());
    setAllTransactions(db.getTransactions());
    setDueCustomers(db.getDueCustomers());
  }, []);

  const todayTransactions = allTransactions.filter(
    (t) => t.timestamp.split('T')[0] === todayStr
  );

  const totalGrossToday = todayTransactions.reduce((sum, t) => sum + (t.grand_total || 0), 0);
  const totalCashToday = todayTransactions.reduce((sum, t) => sum + (t.cash_amount || 0), 0);
  const totalUpiToday = todayTransactions.reduce((sum, t) => sum + (t.upi_amount || 0), 0);
  const totalDueToday = todayTransactions.reduce((sum, t) => sum + (t.due_amount || 0), 0);
  const totalOrdersToday = todayTransactions.length;

  const activeDayTransactions = allTransactions.filter(
    (t) => t.timestamp.split('T')[0] === activeDate
  );
  const totalGrossActive = activeDayTransactions.reduce((sum, t) => sum + (t.grand_total || 0), 0);
  const totalCashActive = activeDayTransactions.reduce((sum, t) => sum + (t.cash_amount || 0), 0);
  const totalUpiActive = activeDayTransactions.reduce((sum, t) => sum + (t.upi_amount || 0), 0);
  const totalDueActive = activeDayTransactions.reduce((sum, t) => sum + (t.due_amount || 0), 0);
  const totalOrdersActive = activeDayTransactions.length;

  const recordedDates = Array.from(
    new Set(allTransactions.map((t) => t.timestamp.split('T')[0]))
  );

  const activeSheetDates = Array.from(
    new Set([todayStr, ...recordedDates])
  );

  const availableDates = recordedDates
    .filter((dateKey) => {
      if (!bookFilterQuery.trim()) return true;
      const q = bookFilterQuery.toLowerCase();
      const dateName = formatDateDisplay(dateKey).toLowerCase();
      return dateName.includes(q) || dateKey.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b).getTime() - new Date(a).getTime();
      if (sortBy === 'date_asc') return new Date(a).getTime() - new Date(b).getTime();
      
      const txA = allTransactions.filter((t) => t.timestamp.split('T')[0] === a);
      const txB = allTransactions.filter((t) => t.timestamp.split('T')[0] === b);
      const revA = txA.reduce((sum, t) => sum + (t.grand_total || 0), 0);
      const revB = txB.reduce((sum, t) => sum + (t.grand_total || 0), 0);

      if (sortBy === 'revenue_desc') return revB - revA;
      if (sortBy === 'orders_desc') return txB.length - txA.length;
      return 0;
    });

  const handleAddQuickTransaction = (entry: {
    service: ServiceItem;
    quantity: number;
    unitPrice: number;
    paymentMode: PaymentMode;
    customerRef?: string;
    customerPhone?: string;
    notes?: string;
  }) => {
    const subtotal = entry.quantity * entry.unitPrice;
    let cashAmt = 0;
    let upiAmt = 0;
    let dueAmt = 0;

    if (entry.paymentMode === 'CASH') cashAmt = subtotal;
    else if (entry.paymentMode === 'UPI') upiAmt = subtotal;
    else if (entry.paymentMode === 'DUE') dueAmt = subtotal;

    const newTx = db.addTransaction({
      payment_mode: entry.paymentMode,
      customer_ref: entry.customerRef,
      customer_phone: entry.customerPhone,
      grand_total: subtotal,
      cash_amount: cashAmt,
      upi_amount: upiAmt,
      due_amount: dueAmt,
      notes: entry.notes,
      date: activeDate,
      items: [
        {
          id: `txi-${Date.now()}-1`,
          transaction_id: '',
          service_id: entry.service.id,
          item_name: entry.service.name,
          category: entry.service.category,
          quantity: entry.quantity,
          unit_price: entry.unitPrice,
          subtotal: subtotal,
        },
      ],
    });

    setAllTransactions(db.getTransactions());
    setDueCustomers(db.getDueCustomers());
  };

  const handleCompletePosOrder = (order: any, printBill?: boolean) => {
    const newTx = db.addTransaction({
      payment_mode: order.paymentMode,
      customer_ref: order.customerRef,
      customer_phone: order.customerPhone,
      grand_total: order.grandTotal,
      cash_amount: order.cashAmount,
      upi_amount: order.upiAmount,
      due_amount: order.dueAmount,
      notes: order.notes,
      date: activeDate,
      items: order.items.map((i: any, idx: number) => ({
        id: `txi-${Date.now()}-${idx}`,
        transaction_id: '',
        service_id: i.service_id,
        item_name: i.item_name,
        category: i.category,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.subtotal,
      })),
    });

    setAllTransactions(db.getTransactions());
    setDueCustomers(db.getDueCustomers());
    setIsPosModalOpen(false);

    if (printBill) {
      setSelectedReceiptTx(newTx);
    }
  };

  const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
    db.updateTransaction(id, updates);
    setAllTransactions(db.getTransactions());
    setDueCustomers(db.getDueCustomers());
  };

  const handleDeleteTransaction = (id: string) => {
    db.deleteTransaction(id);
    setAllTransactions(db.getTransactions());
    setDueCustomers(db.getDueCustomers());
  };

  const handleSaveServices = (updated: ServiceItem[]) => {
    db.saveServices(updated);
    setServices(updated);
  };

  const handleOpenDaybook = (dateStr: string) => {
    setActiveDate(dateStr);
    setActiveView('sheet_editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendDigestForDate = (dateStr: string) => {
    setDigestDate(dateStr);
    setIsDigestOpen(true);
  };

  const handleExportForDate = (dateStr: string) => {
    setExportDate(dateStr);
    setIsExportOpen(true);
  };

  if (isAuthenticated === false) {
    return <WelcomeLanding onUnlockSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Top Header Bar */}
      <GoogleDocsHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenDigest={() => { setDigestDate(todayStr); setIsDigestOpen(true); }}
        onOpenExport={() => { setExportDate(todayStr); setIsExportOpen(true); }}
        onOpenServices={() => setIsServicesOpen(true)}
        onOpenPosModal={() => setIsPosModalOpen(true)}
        transactions={allTransactions}
        onSelectTransaction={(tx) => {
          setSelectedReceiptTx(tx);
        }}
        onSelectDate={(date) => {
          handleOpenDaybook(date);
        }}
        todayGross={totalGrossToday}
      />

      {/* Main Workspace Layout with Side Panel */}
      <div className="flex-1 flex w-full">
        {/* Left Side Panel */}
        <GoogleSidePanel
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          pendingDuesCount={dueCustomers.length}
          todayGross={totalGrossToday}
          onOpenPosModal={() => setIsPosModalOpen(true)}
          onOpenDigest={() => { setDigestDate(todayStr); setIsDigestOpen(true); }}
          onOpenServices={() => setIsServicesOpen(true)}
        />

        {/* Right Master Pane */}
        <main className="flex-1 min-w-0 px-3 sm:px-5 lg:px-6 py-4 transition-all">
          {/* VIEW MODE 1: Daybooks Hub */}
          {activeView === 'home_hub' && (
            <div className="max-w-6xl mx-auto space-y-5 animate-fadeIn">
              {/* Top Workspace Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Merchant Daybooks Hub
                  </h2>
                  <span className="text-xs text-slate-400 font-sans">
                    | கதிர் ஜெராக்ஸ் பதிவேடுகள்
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  ACTIVE LIVE SYSTEM
                </span>
              </div>

              {/* Master Cards: Today's Book Hero + Action Cards (Light Theme + Transparent Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-black">
                {/* HERO CARD: "TODAY'S BOOK" */}
                <div 
                  onClick={() => handleOpenDaybook(todayStr)}
                  className="md:col-span-6 lg:col-span-5 bg-white rounded-xs p-4 text-black shadow-xs border border-slate-300 hover:border-black transition-all duration-150 cursor-pointer relative overflow-hidden group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-black text-white px-1.5 py-0.5 rounded-xs">
                          இன்றைய முதன்மை பதிவேடு
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-black text-black">
                        {todayTransactions.length} பதிவுகள்
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-black leading-tight">
                      இன்றைய பதிவேடு
                    </h3>
                    <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">
                      Today&apos;s Daybook • {formatDateDisplay(todayStr)}
                    </p>

                    {/* Live Tally Breakdown */}
                    <div className="mt-3 pt-2.5 border-t border-slate-300 grid grid-cols-3 gap-2 text-center font-mono">
                      <div className="bg-slate-100 rounded-xs p-1.5 border border-slate-300">
                        <p className="text-[9px] text-black uppercase font-black">மொத்தம் / Gross</p>
                        <p className="font-black text-sm sm:text-base text-black">
                          {formatINR(totalGrossToday)}
                        </p>
                      </div>
                      <div className="bg-emerald-100 rounded-xs p-1.5 border border-emerald-300">
                        <p className="text-[9px] text-black uppercase font-black">ரொக்கம் / Cash</p>
                        <p className="font-black text-sm sm:text-base text-black">
                          {formatINR(totalCashToday)}
                        </p>
                      </div>
                      <div className="bg-sky-100 rounded-xs p-1.5 border border-sky-300">
                        <p className="text-[9px] text-black uppercase font-black">ஜிபே / UPI</p>
                        <p className="font-black text-sm sm:text-base text-black">
                          {formatINR(totalUpiToday)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom CTA Action Button */}
                  <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-black flex items-center gap-1">
                      <span>பதிவேட்டை திற / OPEN SPREADSHEET</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    <div className="w-6 h-6 rounded-xs bg-black text-white flex items-center justify-center font-black text-xs">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* 4 ACTION SHORTCUT TILES */}
                <div className="md:col-span-6 lg:col-span-7 grid grid-cols-2 gap-2.5">
                  {/* 1. Fast Counter POS */}
                  <div 
                    onClick={() => setIsPosModalOpen(true)}
                    className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-black rounded-xs p-3 cursor-pointer transition-all shadow-2xs flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-xs bg-slate-100 text-black flex items-center justify-center font-black text-xs border border-slate-300">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono font-black bg-black text-white px-1.5 py-0.2 rounded-xs">
                        F2
                      </span>
                    </div>
                    <div className="mt-2">
                      <h4 className="font-serif text-sm sm:text-base font-black text-black">
                        பில்லிங் கவுண்டர் (POS)
                      </h4>
                      <p className="text-[10px] text-slate-800 font-bold mt-0.5">
                        POS Counter Billing • Slip Receipt
                      </p>
                    </div>
                  </div>

                  {/* 2. Quick 1-Line Entry */}
                  <div 
                    onClick={() => handleOpenDaybook(todayStr)}
                    className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-black rounded-xs p-3 cursor-pointer transition-all shadow-2xs flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-xs bg-slate-100 text-black flex items-center justify-center font-black text-xs border border-slate-300">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono font-black bg-black text-white px-1.5 py-0.2 rounded-xs">
                        QUICK
                      </span>
                    </div>
                    <div className="mt-2">
                      <h4 className="font-serif text-sm sm:text-base font-black text-black">
                        உடனடி பதிவு (Quick Entry)
                      </h4>
                      <p className="text-[10px] text-slate-800 font-bold mt-0.5">
                        1-Line Rapid Keyboard Logging
                      </p>
                    </div>
                  </div>

                  {/* 3. 9:00 PM WhatsApp Digest */}
                  <div 
                    onClick={() => { setDigestDate(todayStr); setIsDigestOpen(true); }}
                    className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-black rounded-xs p-3 cursor-pointer transition-all shadow-2xs flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-xs bg-slate-100 text-black flex items-center justify-center font-black text-xs border border-slate-300">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono font-black bg-black text-white px-1.5 py-0.2 rounded-xs">
                        9 PM
                      </span>
                    </div>
                    <div className="mt-2">
                      <h4 className="font-serif text-sm sm:text-base font-black text-black">
                        வாட்ஸ்அப் அறிக்கை
                      </h4>
                      <p className="text-[10px] text-slate-800 font-bold mt-0.5">
                        Daily WhatsApp Digest Report
                      </p>
                    </div>
                  </div>

                  {/* 4. Export Excel Daybook */}
                  <div 
                    onClick={() => { setExportDate(todayStr); setIsExportOpen(true); }}
                    className="bg-white hover:bg-slate-50 border border-slate-300 hover:border-black rounded-xs p-3 cursor-pointer transition-all shadow-2xs flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-xs bg-slate-100 text-black flex items-center justify-center font-black text-xs border border-slate-300">
                        <Download className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono font-black bg-black text-white px-1.5 py-0.2 rounded-xs">
                        XLSX
                      </span>
                    </div>
                    <div className="mt-2">
                      <h4 className="font-serif text-sm sm:text-base font-black text-black">
                        எக்செல் பதிவிறக்கம்
                      </h4>
                      <p className="text-[10px] text-slate-800 font-bold mt-0.5">
                        Export Daybooks (.xlsx Backup)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Recent Daybooks Archive */}
              <div className="pt-2">
                {/* Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-300 mb-3 text-black">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base sm:text-lg font-black text-black">
                      சமீபத்திய நாள் பதிவேடுகள் (Recent Daybooks)
                    </h3>
                    <span className="text-[10px] font-mono bg-black text-white px-1.5 py-0.2 rounded-xs font-black">
                      {availableDates.length} பதிவுகள்
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {/* Search inside recent daybooks */}
                    <div className="relative">
                      <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={bookFilterQuery}
                        onChange={(e) => setBookFilterQuery(e.target.value)}
                        placeholder="Filter by date..."
                        className="pl-7 pr-2 py-1 bg-white border border-slate-300 rounded-xs text-xs outline-none focus:border-sky-500 w-32 sm:w-44 font-mono text-[11px]"
                      />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xs px-2 py-1 text-slate-700">
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      <select
                        value={sortBy}
                        onChange={(e: any) => setSortBy(e.target.value)}
                        className="bg-transparent text-[11px] font-mono font-medium outline-none cursor-pointer"
                      >
                        <option value="date_desc">Newest Date</option>
                        <option value="date_asc">Oldest Date</option>
                        <option value="revenue_desc">Highest Revenue</option>
                        <option value="orders_desc">Orders Count</option>
                      </select>
                    </div>

                    {/* Grid vs List View Switcher */}
                    <div className="flex items-center bg-slate-200 p-0.5 rounded-xs border border-slate-300">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1 rounded-xs transition-colors ${
                          viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Grid view"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1 rounded-xs transition-colors ${
                          viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="List view"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Daybooks Grid/List */}
                {availableDates.length > 0 ? (
                  <div className={
                    viewMode === 'grid'
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                      : "space-y-2"
                  }>
                    {availableDates.map((dateKey) => {
                      const dateTx = allTransactions.filter((t) => t.timestamp.split('T')[0] === dateKey);
                      return (
                        <DaybookCard
                          key={dateKey}
                          dateStr={dateKey}
                          transactions={dateTx}
                          isToday={dateKey === todayStr}
                          isYesterday={dateKey === yesterdayStr}
                          viewMode={viewMode}
                          onOpen={handleOpenDaybook}
                          onSendDigest={handleSendDigestForDate}
                          onExport={handleExportForDate}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-white/90 rounded-xs border border-slate-200 shadow-2xs">
                    <FolderOpen className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="font-serif text-base font-bold text-slate-800">No Daybooks Recorded Yet</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-sans">
                      Start recording transactions in <span className="font-semibold text-slate-900">Today&apos;s Book</span> or <span className="font-semibold text-slate-900">POS Counter Bill</span>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: Active Daybook Ledger View */}
          {activeView === 'sheet_editor' && (
            <div className="max-w-7xl mx-auto space-y-3 animate-fadeIn">
              {/* Toolbar */}
              <div className="bg-white/95 p-2.5 rounded-xs border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setActiveView('home_hub')}
                    className="p-1.5 rounded-xs text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-300 transition-colors flex items-center gap-1 text-xs font-mono font-bold"
                    title="Return to Daybooks Hub"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>BACK TO HUB</span>
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                        {activeDate === todayStr ? "Today's Live Ledger" : `Daybook Ledger — ${formatDateDisplay(activeDate)}`}
                      </h2>
                      {activeDate === todayStr ? (
                        <span className="bg-emerald-50 text-emerald-800 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs border border-emerald-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          LIVE
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs border border-slate-300">
                          CLOSED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xs border border-slate-300">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <input
                      type="date"
                      value={activeDate}
                      onChange={(e) => setActiveDate(e.target.value)}
                      className="bg-transparent text-[11px] font-mono font-bold text-slate-800 outline-none cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => handleSendDigestForDate(activeDate)}
                    className="p-1.5 rounded-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-semibold transition-colors"
                    title="Send 9 PM WhatsApp Digest"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleExportForDate(activeDate)}
                    className="p-1.5 rounded-xs bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-300 font-semibold transition-colors"
                    title="Export Excel"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Section 1: KPI Stat Tiles */}
              <DaySummaryCards
                totalGross={totalGrossActive}
                totalCash={totalCashActive}
                totalUpi={totalUpiActive}
                totalDue={totalDueActive}
                totalOrders={totalOrdersActive}
                dateTitle={activeDate === todayStr ? 'Today' : formatDateDisplay(activeDate)}
              />

              {/* Section 2: Quick Input Bar */}
              <QuickEntryBar
                services={services}
                onAddTransaction={handleAddQuickTransaction}
              />

              {/* Section 3: Live Spreadsheet Data Grid */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Spreadsheet Ledger ({formatDateDisplay(activeDate)})</span>
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-mono px-1.5 py-0.2 rounded-xs font-bold">
                      {activeDayTransactions.length} rows
                    </span>
                  </h2>
                </div>

                <SpreadsheetGrid
                  transactions={activeDayTransactions}
                  onUpdateTransaction={handleUpdateTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onPrintReceipt={(tx) => setSelectedReceiptTx(tx)}
                />
              </div>

              {/* Bottom Date Tabs */}
              <div className="sticky bottom-2 z-20 bg-white/95 backdrop-blur-md p-1.5 rounded-xs border border-slate-300 shadow-lg flex items-center justify-between gap-2 overflow-x-auto text-slate-900">
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-mono font-bold text-slate-400 px-1.5 text-[10px] uppercase">SHEETS:</span>
                  {activeSheetDates.slice(0, 6).map((d) => {
                    const isSelected = d === activeDate;
                    const count = allTransactions.filter((t) => t.timestamp.split('T')[0] === d).length;
                    return (
                      <button
                        key={d}
                        onClick={() => setActiveDate(d)}
                        className={`px-2.5 py-1 rounded-xs font-mono font-bold text-[11px] shrink-0 transition-all flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        }`}
                      >
                        <FileSpreadsheet className="w-3 h-3 text-sky-600" />
                        <span>{d === todayStr ? 'Today' : d === yesterdayStr ? 'Yesterday' : formatDateDisplay(d)}</span>
                        <span className={`text-[9px] px-1 rounded-xs font-mono ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setActiveView('home_hub')}
                  className="px-2.5 py-1 rounded-xs bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-mono font-bold shrink-0 border border-slate-900"
                >
                  CLOSE SHEET
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Full POS Billing Modal */}
      {isPosModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-xs shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] flex flex-col">
            <div className="bg-white text-slate-900 p-3 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-sky-600" />
                <h3 className="font-serif font-bold text-base text-slate-900 tracking-tight">
                  POS Counter Billing (பில்லிங் கவுண்டர்)
                </h3>
              </div>
              <button
                onClick={() => setIsPosModalOpen(false)}
                className="p-1 rounded-xs text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 overflow-y-auto flex-1 bg-slate-50/50">
              <PosCounter
                services={services}
                onCompleteOrder={handleCompletePosOrder}
              />
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp 9:00 PM Digest Modal */}
      <WhatsAppDigestModal
        isOpen={isDigestOpen}
        onClose={() => setIsDigestOpen(false)}
        transactions={allTransactions.filter((t) => t.timestamp.split('T')[0] === digestDate)}
        selectedDate={digestDate}
      />

      {/* Export Excel Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        transactions={allTransactions}
        currentDate={exportDate}
      />

      {/* Service Catalogue Modal */}
      <ServiceCatalogueModal
        isOpen={isServicesOpen}
        onClose={() => setIsServicesOpen(false)}
        services={services}
        onSaveServices={handleSaveServices}
      />

      {/* Thermal Receipt Print Modal */}
      <ReceiptModal
        isOpen={!!selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
        transaction={selectedReceiptTx}
      />
    </div>
  );
}
