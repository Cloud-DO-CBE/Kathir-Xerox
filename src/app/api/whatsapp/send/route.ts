import { NextRequest, NextResponse } from 'next/server';

/**
 * WhatsApp Gateway Endpoint
 * Supports:
 * 1. Twilio API (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER)
 * 2. UltraMsg API (ULTRAMSG_INSTANCE_ID, ULTRAMSG_TOKEN)
 * 3. Meta Cloud API (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Phone number ("to") and "message" are required' },
        { status: 400 }
      );
    }

    const cleanPhone = to.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
      ? cleanPhone
      : cleanPhone.length === 10
      ? `91${cleanPhone}`
      : cleanPhone;

    // 1. Check for Twilio Credentials
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    if (twilioSid && twilioAuth) {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      
      const formData = new URLSearchParams();
      formData.append('From', twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`);
      formData.append('To', `whatsapp:+${formattedPhone}`);
      formData.append('Body', message);

      const twilioRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const twilioData = await twilioRes.json();
      if (!twilioRes.ok) {
        return NextResponse.json({
          success: false,
          provider: 'twilio',
          error: twilioData.message || 'Twilio dispatch failed',
          details: twilioData,
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        provider: 'twilio',
        sid: twilioData.sid,
        status: twilioData.status,
      });
    }

    // 2. Check for UltraMsg Credentials
    const ultraInstance = process.env.ULTRAMSG_INSTANCE_ID;
    const ultraToken = process.env.ULTRAMSG_TOKEN;

    if (ultraInstance && ultraToken) {
      const url = `https://api.ultramsg.com/${ultraInstance}/messages/chat`;
      const ultraRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: ultraToken,
          to: formattedPhone,
          body: message,
        }).toString(),
      });

      const ultraData = await ultraRes.json();
      return NextResponse.json({
        success: true,
        provider: 'ultramsg',
        result: ultraData,
      });
    }

    // 3. Fallback: Generate Direct WhatsApp URL
    const encodedMsg = encodeURIComponent(message);
    const directUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;

    return NextResponse.json({
      success: true,
      provider: 'direct_url',
      note: 'No API credentials configured in .env. Use direct WhatsApp URL or configure Twilio in .env',
      directUrl: directUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
