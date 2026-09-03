'use client';

import React, { useState, useRef } from 'react';
import { useCustomerSearch } from '@/lib/useCustomerSearch';
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const { suggestions, isLoading, search, clearSuggestions } = useCustomerSearch();

  // Categories list
  const categories: { key: ServiceCategory | 'ALL'; labelTa: string; label: string }[] = [
    { key: 'ALL', labelTa: 'அனைத்தும்', label: 'All Items' },
    { key: 'XEROX', labelTa: 'ஜெராக்ஸ்', label: 'Xerox' },
    { key: 'PRINT', labelTa: 'பிரிண்ட்', label: 'Printouts' },
    { key: 'E_SERVICE', labelTa: 'இ-சேவை மையம்', label: 'E-Sevai' },
    { key: 'LAMINATION', labelTa: 'லேமினேஷன்', label: 'Lamination' },
    { key: 'STATIONERY', labelTa: 'ஸ்டேஷனரி', label: 'Stationery' },
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-black">
      {/* Left Column: Touch Catalogue & Multiplier (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs shrink-0 transition-all border ${
                activeCategory === cat.key
                  ? 'bg-black text-white border-black shadow-sm font-black'
                  : 'bg-white text-black hover:bg-slate-100 border-slate-300 font-bold'
              }`}
            >
              <div className="font-extrabold text-[12px] leading-tight">{cat.labelTa}</div>
              <div className="text-[9px] font-semibold opacity-90">{cat.label}</div>
            </button>
          ))}
        </div>

        {/* Search Catalogue */}
        <div className="relative">
          <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="பொருட்களை தேடுக / Search items (English or Tamil)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-black placeholder:text-slate-600 outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Grid of Touch Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
          {filteredServices.map((srv) => (
            <button
              key={srv.id}
              onClick={() => addToCart(srv, 1)}
              className="bg-white hover:bg-sky-50/70 p-3 rounded-xl border border-slate-300 hover:border-black shadow-xs flex flex-col justify-between text-left transition-all active:scale-[0.98] group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-black text-black uppercase tracking-wider bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                    {srv.category}
                  </span>
                  <span className="text-xs font-black font-mono text-emerald-800">
                    {formatINR(srv.default_unit_price)}
                  </span>
                </div>
                {/* Tamil Name First (Bold & Black) */}
                <div className="text-xs font-black text-black line-clamp-2 leading-snug">
                  {srv.name_ta || srv.name}
                </div>
                {/* English Name Below (Clear Black) */}
                {srv.name_ta && (
                  <div className="text-[10px] text-slate-800 font-bold line-clamp-1 mt-0.5">
                    {srv.name}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-black font-bold pt-2 border-t border-slate-200">
                <span>+ சேர் / Add</span>
                <span className="bg-black text-white w-5 h-5 rounded-full flex items-center justify-center font-black text-xs">
                  +
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: POS Cart, Multipliers & Checkout (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-300 shadow-sm p-4 flex flex-col justify-between text-black">
        <div>
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-300 mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <div>
                <h2 className="text-sm font-black text-black leading-tight">
                  தற்போதைய பில் உருப்படிகள் ({cart.length})
                </h2>
                <p className="text-[10px] text-slate-800 font-bold">Current Bill Items</p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-700 hover:text-rose-900 font-black flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                அழி / Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="max-h-[220px] overflow-y-auto space-y-2 mb-3 pr-1">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-700 font-medium">
                <p className="text-xs font-bold text-black">பில் பட்டியல் காலியாக உள்ளது</p>
                <p className="text-[11px] text-slate-600 mt-1">பொருட்களை சேர்க்க இடதுபுறம் உள்ள உருப்படிகளை தொடவும்</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">(Cart is empty • Tap items on the left to add)</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-50 p-2.5 rounded-xl border border-slate-300 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-black truncate leading-tight">
                      {item.service.name_ta || item.service.name}
                    </div>
                    {item.service.name_ta && (
                      <div className="text-[10px] text-slate-700 font-semibold truncate mt-0.5">
                        {item.service.name}
                      </div>
                    )}
                    <div className="text-[11px] text-black font-mono font-bold flex items-center gap-1 mt-0.5">
                      <span>விலை/Rate: ₹</span>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateCartPrice(index, parseFloat(e.target.value) || 0)}
                        className="w-12 bg-white border border-slate-400 rounded px-1 text-center font-bold text-black text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-white border border-slate-400 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartQty(index, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-black font-bold hover:bg-slate-200 rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateCartQty(index, parseInt(e.target.value) || 1)}
                      className="w-10 text-center font-mono font-black text-black text-xs bg-transparent outline-none"
                    />
                    <button
                      onClick={() => updateCartQty(index, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-black font-black hover:bg-slate-200 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right font-mono font-black text-black min-w-[55px]">
                    {formatINR(item.subtotal)}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-slate-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                    title="Remove Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick Bulk Multiplier Shortcuts */}
          {cart.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-lg mb-3 text-[11px] border border-slate-200">
              <span className="font-bold text-black shrink-0">எண்ணிக்கை / Add:</span>
              {[5, 10, 20, 50, 100].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (cart.length > 0) {
                      updateCartQty(cart.length - 1, cart[cart.length - 1].quantity + num);
                    }
                  }}
                  className="bg-white hover:bg-black hover:text-white border border-slate-300 font-mono font-black text-black px-2 py-0.5 rounded shadow-xs transition-colors"
                >
                  +{num}
                </button>
              ))}
            </div>
          )}

          {/* Customer Details with Autocomplete */}
          <div className="space-y-1.5 mb-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Customer Name with Autocomplete */}
              <div className="relative">
                <input
                  ref={customerInputRef}
                  type="text"
                  placeholder="வாடிக்கையாளர் பெயர் / Customer Name"
                  value={customerRef}
                  autoComplete="off"
                  onChange={(e) => {
                    setCustomerRef(e.target.value);
                    search(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (customerRef.length >= 1) {
                      search(customerRef);
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-black placeholder:text-slate-600 outline-none focus:border-black"
                />
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 top-full mt-0.5 left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg overflow-hidden">
                    {isLoading && (
                      <div className="px-3 py-1.5 text-[10px] text-slate-400 font-mono">Searching...</div>
                    )}
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={() => {
                          setCustomerRef(s.name);
                          if (s.phone) setCustomerPhone(s.phone);
                          clearSuggestions();
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 border-b border-slate-100 last:border-0 transition-colors"
                      >
                        <div className="font-bold text-black text-xs">{s.name}</div>
                        {s.phone && (
                          <div className="text-[10px] text-slate-500 font-mono">{s.phone}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="tel"
                placeholder="தொலைபேசி எண் / Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-black placeholder:text-slate-600 outline-none focus:border-black font-mono"
              />
            </div>
          </div>

          {/* Payment Mode Selection */}
          <div className="mb-3">
            <label className="block text-[11px] font-black text-black uppercase tracking-wider mb-1">
              கட்டண முறை / Payment Method
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { mode: 'CASH', labelTa: 'ரொக்கம்', label: 'Cash', icon: Wallet },
                { mode: 'UPI', labelTa: 'ஜிபே / UPI', label: 'UPI / GPay', icon: CreditCard },
                { mode: 'DUE', labelTa: 'கடன் பாக்கி', label: 'Due / Khata', icon: AlertCircle },
                { mode: 'SPLIT', labelTa: 'பிரிப்பு', label: 'Split', icon: Sparkles },
              ].map(({ mode, labelTa, label, icon: Icon }) => (
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
                  className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-0.5 transition-all ${
                    paymentMode === mode
                      ? 'bg-black text-white border-black shadow-sm font-black'
                      : 'bg-white text-black border-slate-300 hover:bg-slate-100 font-bold'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-black leading-none">{labelTa}</span>
                  <span className="text-[9px] opacity-80 leading-none">{label}</span>
                </button>
              ))}
            </div>

            {/* Split inputs if SPLIT selected */}
            {paymentMode === 'SPLIT' && (
              <div className="mt-2 grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-300 text-xs">
                <div>
                  <label className="block text-[10px] text-black font-black">ரொக்கம் / Cash (₹)</label>
                  <input
                    type="number"
                    value={splitCash}
                    onChange={(e) => setSplitCash(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-400 rounded px-2 py-1 font-mono font-black text-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-black font-black">ஜிபே / UPI (₹)</label>
                  <input
                    type="number"
                    value={splitUpi}
                    onChange={(e) => setSplitUpi(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-400 rounded px-2 py-1 font-mono font-black text-black"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total & Checkout Bar */}
        <div className="pt-3 border-t border-slate-300">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-sm font-black text-black">மொத்த தொகை / Grand Total:</span>
            </div>
            <span className="text-2xl font-black font-mono text-black">
              {formatINR(grandTotal)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleComplete(false)}
              disabled={cart.length === 0}
              className="bg-black hover:bg-slate-800 disabled:opacity-50 text-white font-black py-3 px-3 rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs shadow-sm transition-all active:scale-[0.98] border border-black"
            >
              <div className="flex items-center gap-1.5 font-black text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>விற்பனை சேமி</span>
              </div>
              <span className="text-[10px] text-slate-300 font-semibold">Save Order (₹)</span>
            </button>

            <button
              onClick={() => handleComplete(true)}
              disabled={cart.length === 0}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black py-3 px-3 rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs shadow-sm transition-all active:scale-[0.98] border border-emerald-800"
            >
              <div className="flex items-center gap-1.5 font-black text-sm">
                <Printer className="w-4 h-4 text-white" />
                <span>பில் அச்சிடு</span>
              </div>
              <span className="text-[10px] text-emerald-100 font-semibold">Print Bill & Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
