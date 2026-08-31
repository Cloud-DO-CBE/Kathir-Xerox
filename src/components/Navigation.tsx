'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Table, 
  Calculator, 
  BarChart3, 
  CalendarRange, 
  BookUser,
  Sparkles
} from 'lucide-react';

export const Navigation: React.FC<{ pendingDuesCount?: number }> = ({ pendingDuesCount = 0 }) => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Live Daybook',
      labelTa: 'நாள் பதிவேடு',
      icon: Table,
    },
    {
      href: '/pos',
      label: 'POS Billing',
      labelTa: 'பில்லிங் கவுண்டர்',
      icon: Calculator,
      highlight: true,
    },
    {
      href: '/analytics',
      label: 'Analytics',
      labelTa: 'விற்பனை ஆய்வுகள்',
      icon: BarChart3,
    },
    {
      href: '/archive',
      label: 'Date Archive',
      labelTa: 'பழைய பதிவுகள்',
      icon: CalendarRange,
    },
    {
      href: '/dues',
      label: 'Customer Dues',
      labelTa: 'பாக்கி கணக்கு',
      icon: BookUser,
      badge: pendingDuesCount > 0 ? pendingDuesCount : undefined,
    },
  ];

  return (
    <>
      {/* Desktop Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 px-4 py-2 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-brand-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium text-[11px]">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Auto Calculation Active
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Fixed for One-Thumb Counter Billing) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-2 py-1.5 shadow-2xl safe-area-inset-bottom">
        <div className="grid grid-cols-5 gap-1 items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 rounded-lg transition-all relative ${
                  isActive
                    ? 'text-sky-400 bg-slate-800/80 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-900 text-[9px] font-extrabold px-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
