'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Zap, 
  CornerDownLeft, 
  ChevronDown,
  User,
  Phone,
  ArrowRight
} from 'lucide-react';
import { ServiceItem, PaymentMode } from '@/types';
import { formatINR } from '@/lib/formatters';

interface QuickEntryBarProps {
  services: ServiceItem[];
  onAddTransaction: (entry: {
    service: ServiceItem;
    quantity: number;
    unitPrice: number;
    paymentMode: PaymentMode;
    customerRef?: string;
    customerPhone?: string;
    notes?: string;
  }) => void;
}

export const QuickEntryBar: React.FC<QuickEntryBarProps> = ({
  services,
  onAddTransaction,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [customerRef, setCustomerRef] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false);
  const qtyInputRef = useRef<HTMLInputElement>(null);

  // Set default service
  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      const defaultSrv = services[0];
      setSelectedServiceId(defaultSrv.id);
      setUnitPrice(defaultSrv.default_unit_price);
    }
  }, [services, selectedServiceId]);

  const handleServiceChange = (srvId: string) => {
    setSelectedServiceId(srvId);
    const srv = services.find((s) => s.id === srvId);
    if (srv) {
      setUnitPrice(srv.default_unit_price);
    }
    setTimeout(() => {
      qtyInputRef.current?.select();
    }, 50);
  };

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const rowTotal = (quantity || 0) * (unitPrice || 0);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedService || quantity <= 0) return;

    onAddTransaction({
      service: selectedService,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      paymentMode,
      customerRef: customerRef.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
    });

    // Reset fields for rapid entry
    setQuantity(1);
    setCustomerRef('');
    setCustomerPhone('');
    setTimeout(() => {
      qtyInputRef.current?.select();
    }, 50);
  };

  const quickPresets = services.slice(0, 6);

  return (
    <div className="bg-white/95 rounded-xs border border-slate-200/90 shadow-2xs p-2.5 mb-4">
      {/* Top Quick Badges */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs no-scrollbar">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <Zap className="w-3 h-3 text-sky-600" />
            PRESETS:
          </span>
          {quickPresets.map((srv) => (
            <button
              key={srv.id}
              type="button"
              onClick={() => handleServiceChange(srv.id)}
              className={`shrink-0 px-2 py-0.5 rounded-xs text-[11px] font-mono transition-all border ${
                selectedServiceId === srv.id
                  ? 'bg-slate-900 text-white font-bold border-slate-900'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {srv.name.split('(')[0].trim()} ({formatINR(srv.default_unit_price)})
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowMoreDetails(!showMoreDetails)}
          className="text-[11px] font-mono text-sky-600 hover:text-sky-800 font-semibold shrink-0"
        >
          {showMoreDetails ? '[- Hide Customer]' : '[+ Customer / Phone]'}
        </button>
      </div>

      {/* Main Entry Bar Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="grid grid-cols-12 gap-2 items-center bg-slate-50/90 p-2 rounded-xs border border-slate-200">
          {/* 1. Service Selector (4 cols) */}
          <div className="col-span-12 sm:col-span-4">
            <label className="block text-[9px] uppercase font-mono font-bold text-slate-500 mb-0.5">
              Service / Item
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xs px-2 py-1.5 text-xs font-medium text-slate-900 focus:border-sky-500 outline-none"
            >
              {services.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name} — {formatINR(srv.default_unit_price)}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Quantity (2 cols) */}
          <div className="col-span-6 sm:col-span-2">
            <label className="block text-[9px] uppercase font-mono font-bold text-slate-500 mb-0.5">
              Qty
            </label>
            <input
              ref={qtyInputRef}
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-white border border-slate-300 rounded-xs px-2 py-1.5 text-xs font-mono font-bold text-slate-900 text-center focus:border-sky-500 outline-none"
            />
          </div>

          {/* 3. Unit Price (2 cols) */}
          <div className="col-span-6 sm:col-span-2">
            <label className="block text-[9px] uppercase font-mono font-bold text-slate-500 mb-0.5">
              Rate (₹)
            </label>
            <input
              type="number"
              step="0.5"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-xs px-2 py-1.5 text-xs font-mono font-bold text-slate-900 text-right focus:border-sky-500 outline-none"
            />
          </div>

          {/* 4. Payment Mode (2 cols) */}
          <div className="col-span-6 sm:col-span-2">
            <label className="block text-[9px] uppercase font-mono font-bold text-slate-500 mb-0.5">
              Payment
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
              className="w-full bg-white border border-slate-300 rounded-xs px-2 py-1.5 text-xs font-bold text-slate-900 focus:border-sky-500 outline-none"
            >
              <option value="CASH">CASH (பணம்)</option>
              <option value="UPI">UPI (GPay/QR)</option>
              <option value="DUE">DUE (பாக்கி)</option>
            </select>
          </div>

          {/* 5. Submit Button (2 cols) */}
          <div className="col-span-6 sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3 rounded-xs text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log {formatINR(rowTotal)}</span>
            </button>
          </div>
        </div>

        {/* Optional Customer Inputs */}
        {showMoreDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-100/80 p-2 rounded-xs border border-slate-200">
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xs border border-slate-300">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={customerRef}
                onChange={(e) => setCustomerRef(e.target.value)}
                placeholder="Customer Name / Department"
                className="w-full text-xs text-slate-900 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xs border border-slate-300">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="WhatsApp Phone (10 digits)"
                className="w-full text-xs font-mono text-slate-900 outline-none"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
