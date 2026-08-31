'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileSpreadsheet, 
  Calculator, 
  BarChart3, 
  CalendarRange, 
  BookUser, 
  Settings, 
  X, 
  Store,
  CreditCard,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { formatINR } from '@/lib/formatters';
import { ShopLogo } from '@/components/ShopLogo';

interface GoogleSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  pendingDuesCount?: number;
  todayGross?: number;
  onOpenPosModal?: () => void;
  onOpenDigest?: () => void;
  onOpenServices?: () => void;
}

export const GoogleSidePanel: React.FC<GoogleSidePanelProps> = ({
  isOpen,
  onClose,
  pendingDuesCount = 0,
  todayGross = 0,
  onOpenPosModal,
  onOpenDigest,
  onOpenServices,
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'All Daybooks Hub',
      labelTa: 'அனைத்து பதிவேடுகள்',
      icon: FileSpreadsheet,
      badge: 'Hub',
    },
    {
      href: '/pos',
      label: 'POS Counter Billing',
      labelTa: 'பில்லிங் கவுண்டர்',
      icon: Calculator,
      isSpecial: true,
      shortcut: 'F2',
    },
    {
      href: '/analytics',
      label: 'Analytics & Insights',
      labelTa: 'விற்பனை ஆய்வுகள்',
      icon: BarChart3,
    },
    {
      href: '/archive',
      label: 'Date Archive Ledger',
      labelTa: 'பழைய பதிவுகள்',
      icon: CalendarRange,
    },
    {
      href: '/dues',
      label: 'Customer Dues (பாக்கி)',
      labelTa: 'வாடிக்கையாளர் பாக்கி',
      icon: BookUser,
      badge: pendingDuesCount > 0 ? `${pendingDuesCount} Due` : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
    },
    {
      href: '/services',
      label: 'Services & Pricing',
      labelTa: 'சேவை கட்டணங்கள்',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Side Panel Drawer (Light Glassmorphic Theme) */}
      <aside 
        className={`fixed md:sticky top-0 md:top-[49px] bottom-0 left-0 z-50 md:z-20 w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/90 transition-all duration-200 ease-in-out flex flex-col h-screen md:h-[calc(100vh-49px)] overflow-hidden shadow-xl md:shadow-none text-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-64 md:w-0 md:border-r-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <ShopLogo size="xs" />
            <div>
              <span className="font-serif font-bold text-slate-900 text-sm">Kathir Xerox</span>
              <p className="text-[9px] text-slate-500 font-sans">கதிர் ஜெராக்ஸ் • Daybook</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xs text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Quick POS button in sidebar */}
          <div className="mb-2 px-1">
            <button
              onClick={() => {
                if (onOpenPosModal) onOpenPosModal();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xs text-xs font-bold transition-all border border-slate-800 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5 text-sky-400" />
                <span>+ POS Counter Bill</span>
              </div>
              <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded-xs font-mono">F2</span>
            </button>
          </div>

          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            MODULES & REGISTERS
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-2.5 py-2 rounded-xs text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-sky-50 text-sky-950 font-bold border-l-2 border-sky-600 pl-2'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <div>
                    <p className="leading-tight text-xs">{item.label}</p>
                    <p className="text-[9px] text-slate-400 leading-none mt-0.5 font-sans">
                      {item.labelTa}
                    </p>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs ${
                    item.badgeColor || (isActive ? 'bg-sky-100 text-sky-900 border border-sky-200' : 'bg-slate-100 text-slate-600 border border-slate-200')
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 px-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1 py-1">
              LIVE SYSTEM STATUS
            </div>

            {/* Live Day Mini Card */}
            <div className="p-2.5 bg-white/90 rounded-xs border border-slate-200/90 shadow-2xs space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Today Gross:</span>
                <span className="font-bold text-slate-900">{formatINR(todayGross)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Pending Due:</span>
                <span className={`font-bold ${pendingDuesCount > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                  {pendingDuesCount} records
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-emerald-700 font-sans font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Auto-sync & Calculation Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-2.5 border-t border-slate-200/80 bg-white/60 text-xs space-y-1.5">
          <button
            onClick={async () => {
              localStorage.removeItem('kx_session_auth');
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
              } catch {}
              window.location.href = '/login';
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xs text-[11px] font-semibold transition-colors border border-transparent hover:border-rose-200"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-slate-400 group-hover:text-rose-600" />
              <span>Lock Register (பூட்டு)</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400">Sign out</span>
          </button>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
            <span>Kathir Xerox Core</span>
            <span>V2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
