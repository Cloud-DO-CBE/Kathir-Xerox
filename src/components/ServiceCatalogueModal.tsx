'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Plus, 
  Edit2, 
  Check, 
  Save, 
  IndianRupee,
  Layers,
  MessageSquare,
  Phone,
  Store,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  KeyRound,
  Trash2
} from 'lucide-react';
import { ServiceItem, ServiceCategory } from '@/types';
import { formatINR } from '@/lib/formatters';
import { db, AppSettings, DEFAULT_SETTINGS } from '@/lib/db';

interface ServiceCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceItem[];
  onSaveServices: (updated: ServiceItem[]) => void;
}

export const ServiceCatalogueModal: React.FC<ServiceCatalogueModalProps> = ({
  isOpen,
  onClose,
  services,
  onSaveServices,
}) => {
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'WHATSAPP' | 'SECURITY'>('SERVICES');
  const [items, setItems] = useState<ServiceItem[]>(services);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordSavedMessage, setPasswordSavedMessage] = useState(false);
  
  // Custom item form
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNameTa, setNewNameTa] = useState('');
  const [newCat, setNewCat] = useState<ServiceCategory>('XEROX');
  const [newPrice, setNewPrice] = useState(10);
  const [newUnit, setNewUnit] = useState('page');

  useEffect(() => {
    setItems(services);
    setSettings(db.getSettings());
  }, [services, isOpen]);

  if (!isOpen) return null;

  const handlePriceChange = (id: string, price: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, default_unit_price: price } : item))
    );
  };

  const handleToggleActive = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_active: !item.is_active } : item))
    );
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the catalogue?`)) {
      db.deleteService(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      onSaveServices(items.filter((item) => item.id !== id));
    }
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem: ServiceItem = {
      id: `srv-custom-${Date.now()}`,
      name: newName.trim(),
      name_ta: newNameTa.trim() || undefined,
      category: newCat,
      default_unit_price: Number(newPrice),
      unit_label: newUnit.trim() || 'unit',
      is_active: true,
    };

    setItems((prev) => [...prev, newItem]);
    setNewName('');
    setNewNameTa('');
    setIsAddingNew(false);
  };

  const handleSaveAll = async () => {
    onSaveServices(items);
    db.saveSettings(settings);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (e) {
      console.warn('Could not sync settings to DB:', e);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
              <Settings className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Shop Settings & Service Rates</h3>
              <p className="text-[11px] text-slate-400">Manage rate catalogue & automatic WhatsApp alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-100 px-4 pt-2 border-b border-slate-200 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'SERVICES'
                ? 'bg-white text-slate-900 shadow-2xs border-t border-x border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Service Rates (விலை பட்டியல்)</span>
          </button>

          <button
            onClick={() => setActiveTab('WHATSAPP')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'WHATSAPP'
                ? 'bg-white text-slate-900 shadow-2xs border-t border-x border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Digest</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('SECURITY');
              setNewPasswordInput(settings.accessPassword || 'RX135');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'SECURITY'
                ? 'bg-white text-slate-900 shadow-2xs border-t border-x border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-sky-600" />
            <span>Security & Password (கடவுச்சொல்)</span>
          </button>
        </div>

        {/* Tab Content 1: Service Rates */}
        {activeTab === 'SERVICES' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Add custom service trigger */}
            {!isAddingNew ? (
              <button
                onClick={() => setIsAddingNew(true)}
                className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 p-2.5 rounded-xl text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Custom Item or Rate</span>
              </button>
            ) : (
              <form onSubmit={handleAddNewItem} className="bg-slate-50 p-3 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Add New Service Item</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Service Name (English, e.g. Color Photo Print)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Tamil Name (e.g. புகைப்பட பிரிண்ட்)"
                    value={newNameTa}
                    onChange={(e) => setNewNameTa(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as ServiceCategory)}
                    className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 outline-none"
                  >
                    <option value="XEROX">Xerox</option>
                    <option value="PRINT">Print</option>
                    <option value="E_SERVICE">E-Service</option>
                    <option value="LAMINATION">Lamination</option>
                    <option value="STATIONERY">Stationery</option>
                    <option value="OTHER">Other</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Rate (₹)"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-mono font-bold"
                  />

                  <input
                    type="text"
                    placeholder="Unit (page/appl/card)"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2 py-1.5"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  Save Item to Catalogue
                </button>
              </form>
            )}

            {/* List of services with editable unit price */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    item.is_active ? 'bg-white border-slate-200' : 'bg-slate-100 border-slate-300 opacity-60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                        {item.category}
                      </span>
                      <span className="font-semibold text-slate-900 truncate">
                        {item.name}
                      </span>
                    </div>
                    {item.name_ta && (
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.name_ta}
                      </div>
                    )}
                  </div>

                  {/* Editable Price Input */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">₹</span>
                    <input
                      type="number"
                      value={item.default_unit_price}
                      onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                      className="w-16 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-right font-mono font-bold text-slate-900 text-xs focus:bg-white focus:border-emerald-500 outline-none"
                    />
                    <span className="text-[10px] text-slate-400 w-8 truncate">
                      /{item.unit_label || 'unit'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(item.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                        item.is_active
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {item.is_active ? 'Active' : 'Disabled'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      title="Delete / Remove Item"
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 2: Automatic WhatsApp Settings */}
        {activeTab === 'WHATSAPP' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Automatic message toggle */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      Automatic WhatsApp Message on Every Transaction
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      ஒவ்வொரு விற்பனை முடிந்ததும் வாடிக்கையாளர் / கடைக்காரருக்கு வாட்ஸ்அப் செய்தி
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableAutoWhatsAppTx}
                    onChange={(e) => setSettings({ ...settings, enableAutoWhatsAppTx: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="text-[11px] text-emerald-800 bg-white/80 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>When enabled, a WhatsApp receipt link & auto-dispatch popup is generated immediately after saving each bill.</span>
              </div>
            </div>

            {/* Recipient Mode */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-xs text-slate-800">Who should receive the message?</h4>
              
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="target"
                    checked={settings.autoWhatsAppTarget === 'CUSTOMER_AND_OWNER'}
                    onChange={() => setSettings({ ...settings, autoWhatsAppTarget: 'CUSTOMER_AND_OWNER' })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Customer (if phone entered), otherwise Owner</span>
                    <p className="text-[10px] text-slate-500">வாடிக்கையாளர் எண் இருந்தால் அவருக்கு, இல்லையெனில் கடைக்காரருக்கு</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="target"
                    checked={settings.autoWhatsAppTarget === 'CUSTOMER_ONLY'}
                    onChange={() => setSettings({ ...settings, autoWhatsAppTarget: 'CUSTOMER_ONLY' })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Customer Only</span>
                    <p className="text-[10px] text-slate-500">வாடிக்கையாளருக்கு மட்டும் (எண் உள்ள போது)</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="target"
                    checked={settings.autoWhatsAppTarget === 'OWNER_ONLY'}
                    onChange={() => setSettings({ ...settings, autoWhatsAppTarget: 'OWNER_ONLY' })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800">Shop Owner Only (Merchant Alert)</span>
                    <p className="text-[10px] text-slate-500">கடை உரிமையாளரின் வாட்ஸ்அப்பிற்கு மட்டும் உடனடி தகவல்</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Owner WhatsApp Number & UPI ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Owner WhatsApp Number:</span>
                </label>
                <input
                  type="text"
                  value={settings.ownerWhatsApp}
                  onChange={(e) => setSettings({ ...settings, ownerWhatsApp: e.target.value })}
                  placeholder="e.g. 9842100000"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>UPI ID (for bill & dues):</span>
                </label>
                <input
                  type="text"
                  value={settings.upiId}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  placeholder="e.g. kathirxerox@okaxis"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Security & Access Password */}
        {activeTab === 'SECURITY' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#46D8E7]" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    Daybook Access Password (கடவுச்சொல்)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Only authorized shop staff with this password can unlock the billing register and daybook.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Change Shop Access Password
              </label>

              <div className="space-y-2">
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => {
                    setNewPasswordInput(e.target.value);
                    setSettings({ ...settings, accessPassword: e.target.value.trim() });
                  }}
                  placeholder="Enter new password (e.g. RX135)"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold tracking-wider outline-none"
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">
                    Current Active Password: <code className="bg-slate-100 font-mono font-bold px-1.5 py-0.5 rounded text-slate-800">{settings.accessPassword || 'RX135'}</code>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setNewPasswordInput('RX135');
                      setSettings({ ...settings, accessPassword: 'RX135' });
                    }}
                    className="text-sky-700 hover:text-sky-900 font-semibold underline text-[11px]"
                  >
                    Reset to Default RX135
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Saving your settings will automatically update this password in your connected PostgreSQL database and local cache.
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings & Rates</span>
          </button>
        </div>
      </div>
    </div>
  );
};
