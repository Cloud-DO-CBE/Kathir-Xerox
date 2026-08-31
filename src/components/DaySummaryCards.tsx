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
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 mb-4 text-black">
      {/* 1. Net Gross Total */}
      <div className="col-span-2 lg:col-span-1 bg-black text-white p-3 rounded-xs border border-black shadow-2xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white font-mono uppercase tracking-wider font-black flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
            {dateTitle ? `${dateTitle} மொத்த வருவாய்` : "மொத்த வருவாய்"}
          </span>
          <span className="text-[9px] font-mono font-black bg-white text-black px-1.5 py-0.2 rounded-xs">
            நேரலை
          </span>
        </div>
        <div className="mt-1">
          <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
            {formatINR(totalGross)}
          </div>
          <div className="text-[10px] text-slate-200 font-mono font-semibold mt-0.5">
            ரொக்கம்: {cashPercent}% | ஜிபே: {upiPercent}%
          </div>
        </div>
      </div>

      {/* 2. Cash In Hand */}
      <div className="bg-white p-3 rounded-xs border border-slate-300 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-black flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-black" />
            ரொக்கப் பணம்
          </span>
          <span className="text-[9px] font-mono font-black text-black bg-slate-100 border border-slate-300 px-1 rounded-xs">
            CASH
          </span>
        </div>
        <div className="mt-1">
          <div className="text-lg sm:text-xl font-black font-mono text-black">
            {formatINR(totalCash)}
          </div>
          <div className="text-[10px] text-slate-800 font-bold mt-0.5">
            Cash in Hand
          </div>
        </div>
      </div>

      {/* 3. UPI / Bank Inflow */}
      <div className="bg-white p-3 rounded-xs border border-slate-300 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-black flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5 text-black" />
            ஜிபே / வங்கி
          </span>
          <span className="text-[9px] font-mono font-black text-black bg-slate-100 border border-slate-300 px-1 rounded-xs">
            UPI
          </span>
        </div>
        <div className="mt-1">
          <div className="text-lg sm:text-xl font-black font-mono text-black">
            {formatINR(totalUpi)}
          </div>
          <div className="text-[10px] text-slate-800 font-bold mt-0.5">
            UPI & Bank Inflow
          </div>
        </div>
      </div>

      {/* 4. Customer Receivables / Dues */}
      <div className={`p-3 rounded-xs border shadow-2xs flex flex-col justify-between ${
        totalDue > 0 ? 'bg-amber-100 border-amber-400' : 'bg-white border-slate-300'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-black flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-black" />
            பாக்கி தொகை
          </span>
          <span className="text-[9px] font-mono font-black text-black bg-amber-200 border border-amber-300 px-1 rounded-xs">
            DUE
          </span>
        </div>
        <div className="mt-1">
          <div className="text-lg sm:text-xl font-black font-mono text-black">
            {formatINR(totalDue)}
          </div>
          <div className="text-[10px] text-slate-900 font-bold mt-0.5">
            Customer Receivables
          </div>
        </div>
      </div>

      {/* 5. Orders Count & Velocity */}
      <div className="bg-white p-3 rounded-xs border border-slate-300 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-black flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-black" />
            பில் எண்ணிக்கை
          </span>
          <span className="text-[9px] font-mono font-black text-black bg-slate-100 border border-slate-300 px-1 rounded-xs">
            {totalOrders}
          </span>
        </div>
        <div className="mt-1">
          <div className="text-lg sm:text-xl font-black font-mono text-black">
            {totalOrders} <span className="text-xs font-bold text-slate-800 font-sans">பில்கள்</span>
          </div>
          <div className="text-[10px] text-slate-800 font-mono font-bold mt-0.5">
            சராசரி: <strong className="text-black">{formatINR(avgBill)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
