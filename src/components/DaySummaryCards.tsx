'use client';

import React from 'react';
import { 
  IndianRupee, 
  Wallet, 
  QrCode, 
  AlertCircle, 
  ShoppingBag, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { formatINR, formatNumber } from '@/lib/formatters';

interface DaySummaryCardsProps {
  totalGross: number;
  totalCash: number;
  totalUpi: number;
  totalDue: number;
  totalOrders: number;
  dateTitle?: string;
}

export const DaySummaryCards: React.FC<DaySummaryCardsProps> = ({
  totalGross,
  totalCash,
  totalUpi,
  totalDue,
  totalOrders,
  dateTitle,
}) => {
  const avgBill = totalOrders > 0 ? Math.round(totalGross / totalOrders) : 0;
  const cashPercent = totalGross > 0 ? Math.round((totalCash / totalGross) * 100) : 0;
  const upiPercent = totalGross > 0 ? Math.round((totalUpi / totalGross) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 mb-4">
      {/* 1. Net Gross Total */}
      <div className="col-span-2 lg:col-span-1 bg-[#0b0f19] text-white p-3 rounded-xs border border-slate-800 shadow-2xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-sky-400" />
            {dateTitle ? `${dateTitle} Gross` : "Net Gross"}
          </span>
          <span className="text-[9px] font-mono bg-sky-950 text-sky-400 border border-sky-800 px-1 rounded-xs">
            LIVE
          </span>
        </div>
        <div className="mt-1">
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {formatINR(totalGross)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Cash: {cashPercent}% | UPI: {upiPercent}%
          </div>
        </div>
      </div>

      {/* 2. Cash In Hand */}
      <div className="bg-white/95 p-3 rounded-xs border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1">
            <Wallet className="w-3 h-3 text-emerald-600" />
            Cash Register
          </span>
          <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded-xs">
            CASH
          </span>
        </div>
        <div className="mt-1">
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-700">
            {formatINR(totalCash)}
          </div>
          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
            ரோக்கப் பணம்
          </div>
        </div>
      </div>

      {/* 3. UPI / Bank Inflow */}
      <div className="bg-white/95 p-3 rounded-xs border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1">
            <QrCode className="w-3 h-3 text-sky-600" />
            UPI / Bank
          </span>
          <span className="text-[9px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-200 px-1 rounded-xs">
            ONLINE
          </span>
        </div>
        <div className="mt-1">
          <div className="text-lg sm:text-xl font-bold font-mono text-sky-700">
            {formatINR(totalUpi)}
          </div>
          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
            வங்கி கணக்கு
          </div>
        </div>
      </div>

      {/* 4. Customer Receivables / Dues */}
      <div className={`p-3 rounded-xs border shadow-2xs flex flex-col justify-between ${
        totalDue > 0 ? 'bg-amber-50/50 border-amber-300' : 'bg-white/95 border-slate-200/90'
      }`}>
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-900 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Receivables
          </span>
          <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-100 border border-amber-200 px-1 rounded-xs">
            KHATA
          </span>
        </div>
        <div className="mt-1">
          <div className="text-lg sm:text-xl font-bold font-mono text-amber-700">
            {formatINR(totalDue)}
          </div>
          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
            பாக்கி தொகை
          </div>
        </div>
      </div>

      {/* 5. Orders Count & Velocity */}
      <div className="bg-white/95 p-3 rounded-xs border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1">
            <ShoppingBag className="w-3 h-3 text-slate-600" />
            Transactions
          </span>
          <span className="text-[9px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1 rounded-xs">
            {totalOrders}
          </span>
        </div>
        <div className="mt-1">
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900">
            {totalOrders} <span className="text-xs font-normal text-slate-500 font-sans">bills</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Avg: <strong className="text-slate-800">{formatINR(avgBill)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
