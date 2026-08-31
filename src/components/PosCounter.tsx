'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  CheckCircle, 
  ShoppingBag, 
  User, 
  Phone, 
  IndianRupee, 
  FileText,
  CreditCard,
  Wallet,
  AlertCircle,
  Sparkles,
  Search
} from 'lucide-react';
import { ServiceItem, ServiceCategory, PaymentMode, TransactionItem } from '@/types';
import { formatINR } from '@/lib/formatters';

interface CartItem {
  service: ServiceItem;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface PosCounterProps {
  services: ServiceItem[];
  onCompleteOrder: (order: {
    items: {
      service_id: string;
      item_name: string;
      category: ServiceCategory;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }[];
    paymentMode: PaymentMode;
    grandTotal: number;
    cashAmount: number;
    upiAmount: number;
    dueAmount: number;
    customerRef?: string;
    customerPhone?: string;
    notes?: string;
  }, printReceipt?: boolean) => void;
}

export const PosCounter: React.FC<PosCounterProps> = ({
  services,
  onCompleteOrder,
}) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitUpi, setSplitUpi] = useState<number>(0);
  const [customerRef, setCustomerRef] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Categories list
  const categories: { key: ServiceCategory | 'ALL'; label: string; labelTa: string }[] = [
    { key: 'ALL', label: 'All Items', labelTa: 'அனைத்தும்' },
    { key: 'XEROX', label: 'Xerox', labelTa: 'ஜெராக்ஸ்' },
    { key: 'PRINT', label: 'Printouts', labelTa: 'பிரிண்ட்' },
    { key: 'E_SERVICE', label: 'E-Sevai', labelTa: 'இ-சேவை' },
    { key: 'LAMINATION', label: 'Lamination', labelTa: 'லேமினேஷன்' },
    { key: 'STATIONERY', label: 'Stationery', labelTa: 'ஸ்டேஷனரி' },
  ];

  // Filter services
  const filteredServices = services.filter((srv) => {
    const matchesCat = activeCategory === 'ALL' || srv.category === activeCategory;
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.name_ta && srv.name_ta.includes(searchQuery));
    return matchesCat && matchesSearch && srv.is_active;
  });

  // Cart operations
  const addToCart = (service: ServiceItem, addQty: number = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.service.id === service.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + addQty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          subtotal: newQty * updated[existingIdx].unitPrice,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            service,
            quantity: addQty,
            unitPrice: service.default_unit_price,
            subtotal: service.default_unit_price * addQty,
          },
        ];
      }
    });
  };

  const updateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: newQty,
        subtotal: newQty * updated[index].unitPrice,
      };
      return updated;
    });
  };

  const updateCartPrice = (index: number, newPrice: number) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        unitPrice: newPrice,
        subtotal: updated[index].quantity * newPrice,
      };
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerRef('');
    setCustomerPhone('');
    setNotes('');
  };

  // Grand Total calculation
  const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleComplete = (printBill: boolean = false) => {
    if (cart.length === 0) return;

    let cashAmount = 0;
    let upiAmount = 0;
    let dueAmount = 0;

    if (paymentMode === 'CASH') {
      cashAmount = grandTotal;
    } else if (paymentMode === 'UPI') {
      upiAmount = grandTotal;
    } else if (paymentMode === 'DUE') {
      dueAmount = grandTotal;
    } else if (paymentMode === 'SPLIT') {
      cashAmount = splitCash;
      upiAmount = splitUpi;
      dueAmount = Math.max(0, grandTotal - (cashAmount + upiAmount));
    }

    const orderPayload = {
      items: cart.map((c) => ({
        service_id: c.service.id,
        item_name: c.service.name,
        category: c.service.category,
        quantity: c.quantity,
        unit_price: c.unitPrice,
        subtotal: c.subtotal,
      })),
      paymentMode,
      grandTotal,
      cashAmount,
      upiAmount,
      dueAmount,
      customerRef: customerRef.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onCompleteOrder(orderPayload, printBill);
    clearCart();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left Column: Touch Catalogue & Multiplier (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                activeCategory === cat.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <div>{cat.label}</div>
              <div className="text-[9px] opacity-70 font-normal">{cat.labelTa}</div>
            </button>
          ))}
        </div>

        {/* Search Catalogue */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items by English or Tamil..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Grid of Touch Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
          {filteredServices.map((srv) => (
            <button
              key={srv.id}
              onClick={() => addToCart(srv, 1)}
              className="bg-white hover:bg-sky-50/60 p-3 rounded-xl border border-slate-200 hover:border-brand-400 shadow-xs flex flex-col justify-between text-left transition-all active:scale-[0.98] group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.2 rounded">
                    {srv.category}
                  </span>
                  <span className="text-xs font-extrabold font-mono text-emerald-700">
                    {formatINR(srv.default_unit_price)}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 line-clamp-2 group-hover:text-brand-700">
                  {srv.name}
                </div>
                {srv.name_ta && (
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                    {srv.name_ta}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-brand-600 font-semibold pt-2 border-t border-slate-100">
                <span>+ Add Item</span>
                <span className="bg-brand-50 text-brand-700 w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  +
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: POS Cart, Multipliers & Checkout (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between">
        <div>
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h2 className="text-sm font-bold text-slate-800">
                Current Bill Items ({cart.length})
              </h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="max-h-[220px] overflow-y-auto space-y-2 mb-3 pr-1">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <p className="text-xs">Cart is empty.</p>
                <p className="text-[11px] text-slate-400 mt-1">Tap items on the left to add.</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {item.service.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <span>Rate: ₹</span>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateCartPrice(index, parseFloat(e.target.value) || 0)}
                        className="w-12 bg-white border border-slate-300 rounded px-1 text-center font-bold text-slate-800 text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartQty(index, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateCartQty(index, parseInt(e.target.value) || 1)}
                      className="w-10 text-center font-mono font-bold text-slate-900 text-xs bg-transparent outline-none"
                    />
                    <button
                      onClick={() => updateCartQty(index, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right font-mono font-bold text-slate-900 min-w-[50px]">
                    {formatINR(item.subtotal)}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick Bulk Multiplier Shortcuts */}
          {cart.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-lg mb-3 text-[11px]">
              <span className="font-semibold text-slate-600 shrink-0">Quick Add to Last:</span>
              {[5, 10, 20, 50, 100].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (cart.length > 0) {
                      updateCartQty(cart.length - 1, cart[cart.length - 1].quantity + num);
                    }
                  }}
                  className="bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 font-mono font-bold text-slate-800 px-2 py-0.5 rounded shadow-xs"
                >
                  +{num}
                </button>
              ))}
            </div>
          )}

          {/* Customer Details */}
          <div className="space-y-1.5 mb-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={customerRef}
                onChange={(e) => setCustomerRef(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-500"
              />
              <input
                type="tel"
                placeholder="Phone (Optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Payment Mode Selection */}
          <div className="mb-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { mode: 'CASH', label: 'Cash', icon: Wallet },
                { mode: 'UPI', label: 'UPI / GPay', icon: CreditCard },
                { mode: 'DUE', label: 'Due / Khata', icon: AlertCircle },
                { mode: 'SPLIT', label: 'Split', icon: Sparkles },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setPaymentMode(mode as PaymentMode);
                    if (mode === 'SPLIT') {
                      setSplitCash(Math.floor(grandTotal / 2));
                      setSplitUpi(Math.ceil(grandTotal / 2));
                    }
                  }}
                  className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMode === mode
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>

            {/* Split inputs if SPLIT selected */}
            {paymentMode === 'SPLIT' && (
              <div className="mt-2 grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold">Cash (₹)</label>
                  <input
                    type="number"
                    value={splitCash}
                    onChange={(e) => setSplitCash(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold">UPI (₹)</label>
                  <input
                    type="number"
                    value={splitUpi}
                    onChange={(e) => setSplitUpi(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total & Checkout Bar */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-600">Grand Total:</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-700">
              {formatINR(grandTotal)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleComplete(false)}
              disabled={cart.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-sm transition-all active:scale-[0.98]"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete (₹)</span>
            </button>

            <button
              onClick={() => handleComplete(true)}
              disabled={cart.length === 0}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-sm transition-all active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill & Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
