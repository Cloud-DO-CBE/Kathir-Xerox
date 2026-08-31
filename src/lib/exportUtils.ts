import * as XLSX from 'xlsx';
import { Transaction, DailyBook } from '@/types';
import { formatINR, formatDateDisplay } from './formatters';

export function exportDaybookToExcel(
  transactions: Transaction[],
  dateStr: string,
  bookSummary?: { totalCash: number; totalUpi: number; totalDue: number; totalGross: number }
) {
  // 1. Transactions Sheet
  const txRows = transactions.map((tx, idx) => ({
    'S.No': idx + 1,
    'Token No': tx.token_no,
    'Time': new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    'Customer': tx.customer_ref || 'Walk-in',
    'Phone': tx.customer_phone || '-',
    'Items Summary': tx.items.map((i) => `${i.item_name} (x${i.quantity})`).join(', '),
    'Payment Mode': tx.payment_mode,
    'Cash (₹)': tx.cash_amount || 0,
    'UPI (₹)': tx.upi_amount || 0,
    'Due (₹)': tx.due_amount || 0,
    'Grand Total (₹)': tx.grand_total,
    'Notes': tx.notes || '',
  }));

  // 2. Line Items Sheet
  const itemRows: any[] = [];
  transactions.forEach((tx) => {
    tx.items.forEach((item) => {
      itemRows.push({
        'Token No': tx.token_no,
        'Time': new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        'Category': item.category,
        'Item Name': item.item_name,
        'Quantity': item.quantity,
        'Unit Rate (₹)': item.unit_price,
        'Subtotal (₹)': item.subtotal,
        'Payment Mode': tx.payment_mode,
        'Customer': tx.customer_ref || 'Walk-in',
      });
    });
  });

  // 3. Summary Sheet
  const summaryRows = [
    { 'Metric': 'Register Date', 'Value': formatDateDisplay(dateStr) },
    { 'Metric': 'Total Orders / Tokens', 'Value': transactions.length },
    { 'Metric': 'Cash In Hand (₹)', 'Value': bookSummary?.totalCash ?? 0 },
    { 'Metric': 'UPI / Online Collection (₹)', 'Value': bookSummary?.totalUpi ?? 0 },
    { 'Metric': 'Pending Dues (₹)', 'Value': bookSummary?.totalDue ?? 0 },
    { 'Metric': 'Gross Day Collection (₹)', 'Value': bookSummary?.totalGross ?? 0 },
    { 'Metric': 'Export Timestamp', 'Value': new Date().toLocaleString('en-IN') },
  ];

  const wb = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Day Summary');

  const wsTx = XLSX.utils.json_to_sheet(txRows);
  XLSX.utils.book_append_sheet(wb, wsTx, 'Transactions');

  const wsItems = XLSX.utils.json_to_sheet(itemRows);
  XLSX.utils.book_append_sheet(wb, wsItems, 'Line Items');

  const fileName = `Kathir_Xerox_Daybook_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
