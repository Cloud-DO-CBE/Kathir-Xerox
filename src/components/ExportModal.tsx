'use client';

import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { Transaction } from '@/types';
import { exportDaybookToExcel } from '@/lib/exportUtils';
import { formatINR, formatDateDisplay, getTodayDateString } from '@/lib/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currentDate?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currentDate,
}) => {
  const [exportScope, setExportScope] = useState<'TODAY' | 'ALL'>('TODAY');
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const targetDate = currentDate || getTodayDateString();

  const transactionsToExport =
    exportScope === 'TODAY'
      ? transactions.filter((t) => t.timestamp.split('T')[0] === targetDate)
      : transactions;

  const totalGross = transactionsToExport.reduce((acc, t) => acc + (t.grand_total || 0), 0);
  const totalCash = transactionsToExport.reduce((acc, t) => acc + (t.cash_amount || 0), 0);
  const totalUpi = transactionsToExport.reduce((acc, t) => acc + (t.upi_amount || 0), 0);
  const totalDue = transactionsToExport.reduce((acc, t) => acc + (t.due_amount || 0), 0);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportDaybookToExcel(transactionsToExport, targetDate, {
        totalGross,
        totalCash,
        totalUpi,
        totalDue,
      });
      setIsExporting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Export Merchant Daybook</h3>
              <p className="text-[11px] text-emerald-300">Microsoft Excel (.xlsx) format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Select Data Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportScope('TODAY')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  exportScope === 'TODAY'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">Selected Day Only</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {formatDateDisplay(targetDate)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('ALL')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  exportScope === 'ALL'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">All Stored History</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {transactions.length} Total Records
                </div>
              </button>
            </div>
          </div>

          {/* Export Preview Summary Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between font-medium text-slate-600">
              <span>Total Transactions:</span>
              <strong className="font-mono text-slate-900">{transactionsToExport.length} bills</strong>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>Gross Collection:</span>
              <strong className="font-mono text-emerald-700">{formatINR(totalGross)}</strong>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>Cash Total:</span>
              <strong className="font-mono text-emerald-700">{formatINR(totalCash)}</strong>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>UPI / Online Total:</span>
              <strong className="font-mono text-sky-700">{formatINR(totalUpi)}</strong>
            </div>
            {totalDue > 0 && (
              <div className="flex justify-between font-medium text-amber-700">
                <span>Pending Due:</span>
                <strong className="font-mono">{formatINR(totalDue)}</strong>
              </div>
            )}
          </div>

          {/* Sheets included info */}
          <div className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-lg">
            📑 <strong>Included Workbook Sheets:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Sheet 1: Day Summary Ledger metrics</li>
              <li>Sheet 2: Token-wise Transactions & Payment Modes</li>
              <li>Sheet 3: Itemized Service Line breakdown</li>
            </ul>
          </div>

          {/* Action */}
          <button
            onClick={handleExport}
            disabled={isExporting || transactionsToExport.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {success ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Generating Excel...' : 'Download Excel Spreadsheet'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
