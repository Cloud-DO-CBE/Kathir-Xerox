'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Layers, 
  CreditCard, 
  Wallet, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Transaction, ServiceCategory } from '@/types';
import { formatINR, formatNumber, formatDateDisplay } from '@/lib/formatters';

interface AnalyticsSectionProps {
  transactions: Transaction[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ transactions }) => {
  const [timeFilter, setTimeFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('WEEK');

  // Filter transactions based on date
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.timestamp);
    if (timeFilter === 'TODAY') {
      return tx.timestamp.split('T')[0] === todayStr;
    } else if (timeFilter === 'WEEK') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return txDate >= sevenDaysAgo;
    } else if (timeFilter === 'MONTH') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return txDate >= thirtyDaysAgo;
    }
    return true;
  });

  // 1. Revenue & Payment Breakdown
  let totalRevenue = 0;
  let totalCash = 0;
  let totalUpi = 0;
  let totalDue = 0;

  filteredTransactions.forEach((tx) => {
    totalRevenue += tx.grand_total || 0;
    totalCash += tx.cash_amount || 0;
    totalUpi += tx.upi_amount || 0;
    totalDue += tx.due_amount || 0;
  });

  // 2. Category Breakdown
  const categoryMap: { [key in ServiceCategory]?: { label: string; amount: number; count: number; color: string } } = {
    XEROX: { label: 'Xerox & Copies', amount: 0, count: 0, color: 'bg-sky-500' },
    PRINT: { label: 'Printouts & Photos', amount: 0, count: 0, color: 'bg-indigo-500' },
    E_SERVICE: { label: 'E-Sevai Online Services', amount: 0, count: 0, color: 'bg-emerald-500' },
    LAMINATION: { label: 'Lamination & Binding', amount: 0, count: 0, color: 'bg-amber-500' },
    STATIONERY: { label: 'Stationery Items', amount: 0, count: 0, color: 'bg-purple-500' },
    OTHER: { label: 'Other Services', amount: 0, count: 0, color: 'bg-slate-500' },
  };

  filteredTransactions.forEach((tx) => {
    tx.items.forEach((item) => {
      const cat = item.category || 'OTHER';
      if (categoryMap[cat]) {
        categoryMap[cat]!.amount += item.subtotal;
        categoryMap[cat]!.count += item.quantity;
      }
    });
  });

  const categoryList = Object.entries(categoryMap)
    .map(([catKey, data]) => ({
      category: catKey as ServiceCategory,
      ...data!,
      percentage: totalRevenue > 0 ? Math.round((data!.amount / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // 3. Hourly Rush Distribution (8 AM to 9 PM)
  const hourlyBuckets: { [hour: number]: { count: number; revenue: number; label: string } } = {};
  for (let h = 8; h <= 21; h++) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    hourlyBuckets[h] = { count: 0, revenue: 0, label: `${displayH} ${ampm}` };
  }

  filteredTransactions.forEach((tx) => {
    const txHour = new Date(tx.timestamp).getHours();
    if (hourlyBuckets[txHour]) {
      hourlyBuckets[txHour].count += 1;
      hourlyBuckets[txHour].revenue += tx.grand_total;
    }
  });

  const maxHourlyCount = Math.max(...Object.values(hourlyBuckets).map((h) => h.count), 1);

  // 4. Top Selling Services List
  const serviceVolumeMap: { [name: string]: { name: string; category: string; qty: number; revenue: number } } = {};
  filteredTransactions.forEach((tx) => {
    tx.items.forEach((item) => {
      if (!serviceVolumeMap[item.item_name]) {
        serviceVolumeMap[item.item_name] = {
          name: item.item_name,
          category: item.category,
          qty: 0,
          revenue: 0,
        };
      }
      serviceVolumeMap[item.item_name].qty += item.quantity;
      serviceVolumeMap[item.item_name].revenue += item.subtotal;
    });
  });

  const topServices = Object.values(serviceVolumeMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return (
    <div className="space-y-3">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-xs border border-slate-200 shadow-2xs font-mono text-xs">
          {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setTimeFilter(filterKey)}
              className={`px-3 py-1 rounded-xs font-bold transition-all border ${
                timeFilter === filterKey
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
              }`}
            >
              {filterKey === 'TODAY' && 'Today'}
              {filterKey === 'WEEK' && 'Last 7 Days'}
              {filterKey === 'MONTH' && 'Last 30 Days'}
              {filterKey === 'ALL' && 'All Time'}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-slate-500">
          Showing {filteredTransactions.length} transactions
        </span>
      </div>

      {/* 4 Financial Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-xs border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Total Revenue</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatINR(totalRevenue)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{filteredTransactions.length} bills recorded</span>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-3 rounded-xs border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 block">Cash Register</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-1">
            {formatINR(totalCash)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{totalRevenue > 0 ? Math.round((totalCash / totalRevenue) * 100) : 0}% of total</span>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-3 rounded-xs border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700 block">UPI Inflow</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-sky-700 mt-1">
            {formatINR(totalUpi)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{totalRevenue > 0 ? Math.round((totalUpi / totalRevenue) * 100) : 0}% of total</span>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-3 rounded-xs border border-amber-300 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 block">Pending Dues</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-700 mt-1">
            {formatINR(totalDue)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Customer khata balances</span>
        </div>
      </div>

      {/* Grid: Category Breakdown + Peak Hours Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Category Breakdown */}
        <div className="lg:col-span-6 bg-white/80 backdrop-blur-md p-3.5 rounded-xs border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-sky-600" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                  Revenue by Category (வருவாய் பிரிவு)
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-900 font-mono">
                {formatINR(totalRevenue)}
              </span>
            </div>

            <div className="space-y-2.5">
              {categoryList.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-xs ${cat.color}`}></span>
                      {cat.label}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatINR(cat.amount)}{' '}
                      <span className="text-[10px] font-normal text-slate-400">
                        ({cat.percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-xs overflow-hidden">
                    <div
                      className={`h-full ${cat.color} transition-all duration-500`}
                      style={{ width: `${Math.max(2, cat.percentage)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peak Transaction Hours */}
        <div className="lg:col-span-6 bg-white/80 backdrop-blur-md p-3.5 rounded-xs border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                  Peak Rush Hours (8 AM – 9 PM)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Hourly Density</span>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1 items-end h-40 pt-4 pb-2 border-b border-slate-200">
              {Object.entries(hourlyBuckets).map(([hour, data]) => {
                const heightPercent = Math.round((data.count / maxHourlyCount) * 100);
                const isRush = data.count >= maxHourlyCount * 0.7 && data.count > 0;

                return (
                  <div key={hour} className="flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="text-[8px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.count}
                    </div>
                    <div
                      className={`w-full rounded-xs transition-all ${
                        isRush
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : data.count > 0
                          ? 'bg-sky-500 hover:bg-sky-600'
                          : 'bg-slate-100'
                      }`}
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                      title={`${data.label}: ${data.count} bills (${formatINR(data.revenue)})`}
                    ></div>
                    <span className="text-[8px] font-mono text-slate-400 rotate-45 sm:rotate-0 mt-1 whitespace-nowrap">
                      {data.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-amber-500"></span> Rush Hour Peak
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-sky-500"></span> Standard Flow
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 6 High Volume Services Table */}
      <div className="bg-white/80 backdrop-blur-md p-3 rounded-xs border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">
            Top Performing Services by Revenue
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left corporate-table border-collapse">
            <thead>
              <tr>
                <th className="py-1.5 px-2">Service Name</th>
                <th className="py-1.5 px-2">Category</th>
                <th className="py-1.5 px-2 text-center">Volume / Units</th>
                <th className="py-1.5 px-2 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topServices.map((srv, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-2 font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-xs bg-slate-100 text-slate-700 font-bold font-mono flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    {srv.name}
                  </td>
                  <td className="py-1.5 px-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-xs border border-slate-200">
                      {srv.category}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-800">
                    {formatNumber(srv.qty)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                    {formatINR(srv.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
