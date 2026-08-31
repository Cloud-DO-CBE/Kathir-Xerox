'use client';

import React, { useState, useEffect } from 'react';
import { GoogleDocsHeader } from '@/components/GoogleDocsHeader';
import { GoogleSidePanel } from '@/components/GoogleSidePanel';
import { DueTracker } from '@/components/DueTrackerModal';
import { WhatsAppDigestModal } from '@/components/WhatsAppDigestModal';
import { ExportModal } from '@/components/ExportModal';
import { ServiceCatalogueModal } from '@/components/ServiceCatalogueModal';
import { db } from '@/lib/db';
import { ServiceItem, Transaction, DueCustomer } from '@/types';
import { getTodayDateString, formatINR } from '@/lib/formatters';
import { ArrowLeft, BookUser } from 'lucide-react';
import Link from 'next/link';

export default function DuesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [dueCustomers, setDueCustomers] = useState<DueCustomer[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isDigestOpen, setIsDigestOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const todayStr = getTodayDateString();

  const refreshData = () => {
    setServices(db.getServices());
    setAllTransactions(db.getTransactions());
    setDueCustomers(db.getDueCustomers());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const todayTransactions = allTransactions.filter(
    (t) => t.timestamp.split('T')[0] === todayStr
  );
  const totalGross = todayTransactions.reduce((sum, t) => sum + (t.grand_total || 0), 0);

  const handleSettleDue = (customerRef: string, amount: number, mode: 'CASH' | 'UPI') => {
    db.settleCustomerDue(customerRef, amount, mode);
    refreshData();
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
        todayGross={totalGross}
      />

      <div className="flex-1 flex w-full">
        <GoogleSidePanel
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          pendingDuesCount={dueCustomers.length}
          todayGross={totalGross}
          onOpenDigest={() => setIsDigestOpen(true)}
          onOpenServices={() => setIsServicesOpen(true)}
        />

        <main className="flex-1 min-w-0 px-3 sm:px-5 lg:px-6 py-4">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Top Toolbar */}
            <div className="bg-white/70 backdrop-blur-md p-2.5 rounded-xs border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2">
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
                    Customer Due Ledger (வாடிக்கையாளர் பாக்கி கணக்கு)
                  </h1>
                </div>
              </div>
            </div>

            {/* Dues Tracker Container */}
            <div className="bg-white/60 backdrop-blur-md p-3 rounded-xs border border-slate-200/90 shadow-2xs">
              <DueTracker
                dueCustomers={dueCustomers}
                onSettleDue={handleSettleDue}
              />
            </div>
          </div>
        </main>
      </div>

      <WhatsAppDigestModal
        isOpen={isDigestOpen}
        onClose={() => setIsDigestOpen(false)}
        transactions={todayTransactions}
        selectedDate={todayStr}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        transactions={allTransactions}
        currentDate={todayStr}
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
