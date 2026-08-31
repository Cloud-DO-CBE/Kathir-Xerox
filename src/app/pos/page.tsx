'use client';

import React, { useState, useEffect } from 'react';
import { GoogleDocsHeader } from '@/components/GoogleDocsHeader';
import { GoogleSidePanel } from '@/components/GoogleSidePanel';
import { PosCounter } from '@/components/PosCounter';
import { ReceiptModal } from '@/components/ReceiptModal';
import { WhatsAppDigestModal } from '@/components/WhatsAppDigestModal';
import { ExportModal } from '@/components/ExportModal';
import { ServiceCatalogueModal } from '@/components/ServiceCatalogueModal';
import { AutoWhatsAppToast } from '@/components/AutoWhatsAppToast';
import { db } from '@/lib/db';
import { ServiceItem, Transaction, DueCustomer } from '@/types';
import { getTodayDateString, formatINR } from '@/lib/formatters';
import { triggerAutoWhatsAppMessage } from '@/lib/whatsappUtils';
import { ArrowLeft, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function PosBillingPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [dueCustomers, setDueCustomers] = useState<DueCustomer[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
  const totalGross = todayTransactions.reduce((sum, t) => sum + (t.grand_total || 0), 0);

  const handleCompleteOrder = (order: any, printBill?: boolean) => {
    const newTx = db.addTransaction({
      payment_mode: order.paymentMode,
      customer_ref: order.customerRef,
      customer_phone: order.customerPhone,
      grand_total: order.grandTotal,
      cash_amount: order.cashAmount,
      upi_amount: order.upiAmount,
      due_amount: order.dueAmount,
      notes: order.notes,
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

    if (printBill) {
      setSelectedReceiptTx(newTx);
    }
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
                    POS Counter Billing (பில்லிங் கவுண்டர்)
                  </h1>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-500 hidden sm:block">
                Press <strong className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded-xs border border-slate-200">F2</strong> for fast item focus
              </div>
            </div>

            {/* POS Counter Container */}
            <div className="bg-white/60 backdrop-blur-md p-3 rounded-xs border border-slate-200/90 shadow-2xs">
              <PosCounter
                services={services}
                onCompleteOrder={handleCompleteOrder}
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
