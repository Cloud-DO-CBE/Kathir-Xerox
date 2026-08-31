import { NextResponse } from 'next/server';
import { generateCustomerReceiptText } from '@/lib/whatsappUtils';
import { Transaction } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transaction, targetPhone, shopName }: { transaction: Transaction; targetPhone?: string; shopName?: string } = body;

    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaction object required' }, { status: 400 });
    }

    const messageText = generateCustomerReceiptText(transaction, shopName || 'Kathir Xerox');
    const recipient = targetPhone || transaction.customer_phone || process.env.OWNER_WHATSAPP_PHONE || '9842100000';

    // If an external WhatsApp API provider (e.g. UltraMsg / GreenAPI / Meta Cloud API) is configured in .env:
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappApiToken = process.env.WHATSAPP_API_TOKEN;

    if (whatsappApiUrl && whatsappApiToken) {
      try {
        const res = await fetch(whatsappApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${whatsappApiToken}`,
          },
          body: JSON.stringify({
            to: recipient,
            body: messageText,
          }),
        });
        const result = await res.json();
        return NextResponse.json({ success: true, apiDispatched: true, result, messageText, recipient });
      } catch (err: any) {
        console.error('WhatsApp API Gateway error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      apiDispatched: false,
      message: 'WhatsApp text generated for client/webhook dispatch',
      recipient,
      messageText,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
