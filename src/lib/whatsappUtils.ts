import { Transaction, DailyBook, AppSettings } from '@/types';
import { formatINR, formatDateDisplay, formatTimeDisplay } from './formatters';

/**
 * Strips all special Markdown symbols (*, _, ~, `, ━, •)
 * to output clean, readable, plain merchant text on any mobile device.
 */
export function cleanPlainText(text: string): string {
  return text
    .replace(/[*_~`]/g, '')
    .replace(/[━─—═]/g, '-')
    .replace(/[•●■◆]/g, '-')
    .trim();
}

/**
 * Builds a direct WhatsApp Web / App dispatch URL.
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
    ? cleanPhone
    : cleanPhone.length === 10
    ? `91${cleanPhone}`
    : cleanPhone;

  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMsg}`;
}

export interface DailyDigestData {
  date: string;
  totalTransactions: number;
  totalGross: number;
  totalCash: number;
  totalUpi: number;
  totalDue: number;
  categories: { [key: string]: { qty: number; amount: number } };
  transactions: Transaction[];
}

export function computeDailyDigestData(transactions: Transaction[], dateStr: string): DailyDigestData {
  const dayTx = transactions.filter((t) => !dateStr || t.timestamp.startsWith(dateStr));
  let totalGross = 0;
  let totalCash = 0;
  let totalUpi = 0;
  let totalDue = 0;
  const categories: { [key: string]: { qty: number; amount: number } } = {};

  dayTx.forEach((tx) => {
    totalGross += tx.grand_total || 0;
    totalCash += tx.cash_amount || 0;
    totalUpi += tx.upi_amount || 0;
    totalDue += tx.due_amount || 0;

    (tx.items || []).forEach((item) => {
      const cat = item.category || 'OTHER';
      if (!categories[cat]) {
        categories[cat] = { qty: 0, amount: 0 };
      }
      categories[cat].qty += item.quantity || 1;
      categories[cat].amount += item.subtotal || 0;
    });
  });

  return {
    date: dateStr,
    totalTransactions: dayTx.length,
    totalGross,
    totalCash,
    totalUpi,
    totalDue,
    categories,
    transactions: dayTx,
  };
}

/**
 * Formats a Digital Receipt in clean plain merchant text without any Markdown symbols.
 */
export function generatePlainReceiptText(tx: Transaction, shopName = 'Kathir Xerox & E-Service Centre'): string {
  const dateStr = formatDateDisplay(tx.timestamp);
  const timeStr = formatTimeDisplay(tx.timestamp);
  
  const lines: string[] = [
    shopName,
    'Digital Bill Receipt',
    '----------------------------------------',
    `Token No: ${tx.token_no}`,
    `Date: ${dateStr} ${timeStr}`,
  ];

  if (tx.customer_ref) {
    const phonePart = tx.customer_phone ? ` (${tx.customer_phone})` : '';
    lines.push(`Customer: ${tx.customer_ref}${phonePart}`);
  }

  lines.push('----------------------------------------');
  lines.push('Items:');

  (tx.items || []).forEach((item, index) => {
    const unitPriceFormatted = formatINR(item.unit_price);
    const subtotalFormatted = formatINR(item.subtotal);
    lines.push(`${index + 1}. ${item.item_name}`);
    lines.push(`   Qty: ${item.quantity} x ${unitPriceFormatted} = ${subtotalFormatted}`);
  });

  lines.push('----------------------------------------');
  lines.push(`Grand Total: ${formatINR(tx.grand_total)}`);
  lines.push(`Payment Mode: ${tx.payment_mode}`);

  if (tx.payment_mode === 'DUE' || tx.due_amount > 0) {
    lines.push(`Pending Due Amount: ${formatINR(tx.due_amount)}`);
  }

  if (tx.notes) {
    lines.push(`Notes: ${tx.notes}`);
  }

  lines.push('----------------------------------------');
  lines.push('Thank you! Please visit again.');
  lines.push('Kathir Xerox - Tamil Nadu');

  return lines.join('\n');
}

export const generateCustomerReceiptText = generatePlainReceiptText;

/**
 * Formats the 9:00 PM Daily Closing Digest in clean plain text.
 */
export function generatePlainDailyDigest(
  input: Transaction[] | DailyDigestData,
  dateStr?: string,
  settings?: AppSettings
): string {
  let digestData: DailyDigestData;
  if (Array.isArray(input)) {
    digestData = computeDailyDigestData(input, dateStr || new Date().toISOString().split('T')[0]);
  } else {
    digestData = input;
  }

  const formattedDate = formatDateDisplay(digestData.date);
  const lines: string[] = [
    settings?.shopName || 'Kathir Xerox & E-Service Centre',
    'Daily Closing Daybook Digest',
    `Date: ${formattedDate}`,
    '----------------------------------------',
    'FINANCIAL SUMMARY:',
    `Total Gross Revenue: ${formatINR(digestData.totalGross)}`,
    `Cash In Hand: ${formatINR(digestData.totalCash)}`,
    `UPI / Digital Inflow: ${formatINR(digestData.totalUpi)}`,
    `Pending Customer Dues: ${formatINR(digestData.totalDue)}`,
    `Total Transactions Logged: ${digestData.totalTransactions} bills`,
    '----------------------------------------',
    'CATEGORY BREAKDOWN:',
  ];

  const categoryLabels: { [key: string]: string } = {
    XEROX: 'Xerox & Copies',
    PRINT: 'Printouts & Photos',
    E_SERVICE: 'E-Sevai Online Services',
    LAMINATION: 'Lamination & Binding',
    STATIONERY: 'Stationery Items',
    OTHER: 'Other Services',
  };

  Object.entries(digestData.categories || {}).forEach(([catKey, data]) => {
    const label = categoryLabels[catKey] || catKey;
    lines.push(`- ${label}: ${data.qty} units | ${formatINR(data.amount)}`);
  });

  lines.push('----------------------------------------');
  lines.push('Generated automatically by Kathir Xerox Daybook Core.');

  return lines.join('\n');
}

export const generateDailyDigestText = generatePlainDailyDigest;

/**
 * Formats a Customer Due Payment Reminder in clean plain text.
 */
export function generateDueReminderText(
  customerName: string,
  amount: number,
  shopName = 'Kathir Xerox',
  upiId = 'kathirxerox@okaxis'
): string {
  return [
    `Dear ${customerName},`,
    '',
    `This is a gentle payment reminder from ${shopName}.`,
    `Your outstanding pending balance is: ${formatINR(amount)}.`,
    '',
    `You can pay directly via GPay / PhonePe / Paytm to our UPI ID:`,
    `${upiId}`,
    '',
    `Kindly settle at your earliest convenience.`,
    `Thank you!`,
    shopName,
  ].join('\n');
}

export function triggerAutoWhatsAppMessage(tx: Transaction, settings?: AppSettings) {
  if (typeof window === 'undefined') return;
  const message = generateCustomerReceiptText(tx, settings?.shopName);
  if (tx.customer_phone) {
    const url = buildWhatsAppLink(tx.customer_phone, message);
    window.open(url, '_blank');
  }
}
