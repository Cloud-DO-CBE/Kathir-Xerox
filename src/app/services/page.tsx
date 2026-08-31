'use client';

import React, { useState, useEffect } from 'react';
import { GoogleDocsHeader } from '@/components/GoogleDocsHeader';
import { GoogleSidePanel } from '@/components/GoogleSidePanel';
import { WhatsAppDigestModal } from '@/components/WhatsAppDigestModal';
import { ExportModal } from '@/components/ExportModal';
import { ServiceCatalogueModal } from '@/components/ServiceCatalogueModal';
import { db } from '@/lib/db';
import { ServiceItem, Transaction, DueCustomer, ServiceCategory } from '@/types';
import { getTodayDateString, formatINR } from '@/lib/formatters';
import { Settings, Plus, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [dueCustomers, setDueCustomers] = useState<DueCustomer[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isDigestOpen, setIsDigestOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handlePriceChange = (id: string, newPrice: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, default_unit_price: newPrice } : s))
    );
  };

  const handleSave = () => {
    db.saveServices(services);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const categories: ServiceCategory[] = ['XEROX', 'PRINT', 'E_SERVICE', 'LAMINATION', 'STATIONERY', 'OTHER'];

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <GoogleDocsHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenDigest={() => setIsDigestOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenServices={() => setIsModalOpen(true)}
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
          onOpenServices={() => setIsModalOpen(true)}
        />

        <main className="flex-1 min-w-0 px-3 sm:px-5 lg:px-6 py-4">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Top Toolbar */}
            <div className="bg-white/70 backdrop-blur-md p-2.5 rounded-xs border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xs text-xs font-mono font-bold flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>BACK TO HUB</span>
                </Link>
                <div>
                  <h1 className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Service Catalogue & Rate Master (விலை பட்டியல் மேலாண்மை)
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-3 py-1.5 rounded-xs text-xs flex items-center gap-1.5 transition-all border border-slate-300 font-mono"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service</span>
                </button>

                <button
                  onClick={handleSave}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-xs text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-98 border border-slate-800 font-mono"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveSuccess ? 'Saved Rates!' : 'Save Changes'}</span>
                </button>
              </div>
            </div>

            {/* Categorized Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((cat) => {
                const catItems = services.filter((s) => s.category === cat);
                if (catItems.length === 0) return null;

                return (
                  <div
                    key={cat}
                    className="bg-white/60 backdrop-blur-md p-3 rounded-xs border border-slate-200/90 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <h3 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-xs bg-sky-600"></span>
                        {cat === 'E_SERVICE' ? 'E-Sevai Online Services' : cat}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">
                        {catItems.length} items
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {catItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-xs bg-white/80 border border-slate-200/80 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {item.name}
                            </div>
                            {item.name_ta && (
                              <div className="text-[10px] text-slate-400 truncate">
                                {item.name_ta}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono text-slate-400">₹</span>
                            <input
                              type="number"
                              step="0.5"
                              value={item.default_unit_price}
                              onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                              className="w-16 bg-white border border-slate-300 rounded-xs px-1.5 py-0.5 text-right font-mono font-bold text-slate-900 text-xs focus:border-sky-500 outline-none"
                            />
                            <span className="text-[10px] text-slate-400 font-mono w-10 truncate">
                              /{item.unit_label || 'unit'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={services}
        onSaveServices={(updated) => {
          db.saveServices(updated);
          setServices(updated);
        }}
      />
    </div>
  );
}
