'use client';

import React, { useState, useEffect } from 'react';
import { GoogleDocsHeader } from '@/components/GoogleDocsHeader';
import { GoogleSidePanel } from '@/components/GoogleSidePanel';
import { DaySummaryCards } from '@/components/DaySummaryCards';
import { SpreadsheetGrid } from '@/components/SpreadsheetGrid';
import { ReceiptModal } from '@/components/ReceiptModal';
import { WhatsAppDigestModal } from '@/components/WhatsAppDigestModal';
import { ExportModal } from '@/components/ExportModal';
import { ServiceCatalogueModal } from '@/components/ServiceCatalogueModal';
import { db } from '@/lib/db';
import { ServiceItem, Transaction, DueCustomer } from '@/types';
import { getTodayDateString, formatDateDisplay, formatINR } from '@/lib/formatters';
import { CalendarRange, ArrowLeft, Download, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ArchivePage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [dueCustomers, setDueCustomers] = useState<DueCustomer[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  const [isDigestOpen, setIsDigestOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const todayStr = getTodayDateString();

  useEffect(() => {
    setServices(db.getServices());
    setAllTransactions(db.getTransactions());
    setDueCustomers(db.getDueCustomers());
  }, []);

  const todayTransactions = allTransactions.filter(
    (t) => t.timestamp.split('T')[0] === todayStr
  );
  const totalGrossToday = todayTransactions.reduce((sum, t) => sum + (t.grand_total || 0), 0);

  const availableDates = Array.from(
    new Set(allTransactions.map((t) => t.timestamp.split('T')[0]))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const dayTransactions = allTransactions.filter(
    (t) => t.timestamp.split('T')[0] === selectedDate
  );

  const totalGross = dayTransactions.reduce((sum, t) => sum + (t.grand_total || 0), 0);
  const totalCash = dayTransactions.reduce((sum, t) => sum + (t.cash_amount || 0), 0);
  const totalUpi = dayTransactions.reduce((sum, t) => sum + (t.upi_amount || 0), 0);
  const totalDue = dayTransactions.reduce((sum, t) => sum + (t.due_amount || 0), 0);
  const totalOrders = dayTransactions.length;

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

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <GoogleDocsHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenDigest={() => setIsDigestOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenServices={() => setIsServicesOpen(true)}
        transactions={allTransactions}
        onSelectTransaction={(tx) => setSelectedReceiptTx(tx)}
        todayGross={totalGrossToday}
      />

      <div className="flex-1 flex w-full">
        <GoogleSidePanel
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          pendingDuesCount={dueCustomers.length}
          todayGross={totalGrossToday}
          onOpenDigest={() => setIsDigestOpen(true)}
          onOpenServices={() => setIsServicesOpen(true)}
        />

        <main className="flex-1 min-w-0 px-3 sm:px-5 lg:px-6 py-4">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Top Toolbar */}
            <div className="bg-white/70 backdrop-blur-md p-2.5 rounded-xs border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xs text-xs font-mono font-bold flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>BACK TO HUB</span>
                </Link>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Historical Daybook Archive (வரலாற்று பதிவேடு)
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-mono font-bold text-slate-600">Register Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xs px-2.5 py-1 text-xs font-mono font-bold outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Quick Date Pills */}
            {availableDates.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
                <span className="font-bold text-slate-500 shrink-0 text-[10px] uppercase">RECORDED DATES:</span>
                {availableDates.map((dateKey) => {
                  const isSelected = dateKey === selectedDate;
                  const count = allTransactions.filter((t) => t.timestamp.split('T')[0] === dateKey).length;
                  return (
                    <button
                      key={dateKey}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`px-2.5 py-1 rounded-xs font-bold shrink-0 transition-all border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white/80 text-slate-700 hover:bg-white border-slate-200'
                      }`}
                    >
                      {dateKey === todayStr ? 'Today' : formatDateDisplay(dateKey)} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Summary Cards */}
            <DaySummaryCards
              totalGross={totalGross}
              totalCash={totalCash}
              totalUpi={totalUpi}
              totalDue={totalDue}
              totalOrders={totalOrders}
              dateTitle={selectedDate === todayStr ? 'Today' : formatDateDisplay(selectedDate)}
            />

            {/* Spreadsheet Data Grid */}
            <div className="bg-white/60 backdrop-blur-md p-3 rounded-xs border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-base font-bold text-slate-900">
                  Transactions for {formatDateDisplay(selectedDate)} ({dayTransactions.length} entries)
                </h3>
              </div>

              <SpreadsheetGrid
                transactions={dayTransactions}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onPrintReceipt={(tx) => setSelectedReceiptTx(tx)}
              />
            </div>
          </div>
        </main>
      </div>

      <ReceiptModal
        isOpen={!!selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
        transaction={selectedReceiptTx}
      />

      <WhatsAppDigestModal
        isOpen={isDigestOpen}
        onClose={() => setIsDigestOpen(false)}
        transactions={dayTransactions}
        selectedDate={selectedDate}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        transactions={allTransactions}
        currentDate={selectedDate}
      />

      <ServiceCatalogueModal
        isOpen={isServicesOpen}
        onClose={() => setIsServicesOpen(false)}
        services={services}
        onSaveServices={(updated) => {
          db.saveServices(updated);
          setServices(updated);
        }}
      />
    </div>
  );
}
