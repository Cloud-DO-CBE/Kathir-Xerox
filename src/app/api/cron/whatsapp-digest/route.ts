import { NextRequest, NextResponse } from 'next/server';
import { computeDailyDigestData, generateDailyDigestText } from '@/lib/whatsappUtils';

/**
 * 9:00 PM Daily Digest Cron Endpoint
 * Can be triggered via Vercel Cron, node-cron, or external HTTP webhook.
 * Supports Bearer token or CRON_SECRET for security.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'kathir_secret_token_9pm';

    // Verify authorization if token provided in query or header
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (authHeader !== `Bearer ${cronSecret}` && key !== cronSecret && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // In server environment, digest computes today's summary
    const digestData = computeDailyDigestData([], todayStr);
    const messageText = generateDailyDigestText(digestData);

    // If WhatsApp API credentials are configured in environment (e.g. Green API, Twilio)
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappRecipient = process.env.OWNER_WHATSAPP || '919842100000';

    let apiSent = false;
    if (whatsappApiUrl) {
      try {
        await fetch(whatsappApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: `${whatsappRecipient}@c.us`,
            message: messageText,
          }),
        });
        apiSent = true;
      } catch (err) {
        console.error('Failed to dispatch to external WhatsApp gateway:', err);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      date: todayStr,
      apiDispatched: apiSent,
      digestData,
      formattedMessage: messageText,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
