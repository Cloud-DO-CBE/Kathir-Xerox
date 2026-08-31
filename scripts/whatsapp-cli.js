#!/usr/bin/env node

/**
 * Kathir Xerox - WhatsApp CLI Dispatcher
 * Usage:
 *   node scripts/whatsapp-cli.js --to=9876543210 --message="Test Message"
 *   node scripts/whatsapp-cli.js --test
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  args.forEach((arg) => {
    if (arg.startsWith('--')) {
      const parts = arg.slice(2).split('=');
      const key = parts[0];
      const val = parts.length > 1 ? parts.slice(1).join('=') : true;
      parsed[key] = val;
    }
  });

  return parsed;
}

async function sendWhatsAppViaTwilio(to, message) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  if (!twilioSid || !twilioAuth) {
    console.log('\x1b[33m[!] No Twilio credentials found in .env\x1b[0m');
    console.log('To send via Twilio API, set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
    const cleanPhone = to.replace(/[^0-9]/g, '');
    const directUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
    console.log(`\x1b[36m[Direct WhatsApp URL]:\x1b[0m ${directUrl}`);
    return;
  }

  const cleanPhone = to.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
    ? cleanPhone
    : cleanPhone.length === 10
    ? `91${cleanPhone}`
    : cleanPhone;

  const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
  const postData = new URLSearchParams({
    From: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
    To: `whatsapp:+${formattedPhone}`,
    Body: message,
  }).toString();

  const options = {
    hostname: 'api.twilio.com',
    port: 443,
    path: `/2010-04-01/Accounts/${twilioSid}/Messages.json`,
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`\x1b[32m[✓] Message sent successfully! SID: ${json.sid}\x1b[0m`);
            resolve(json);
          } else {
            console.error(`\x1b[31m[x] Twilio Error: ${json.message}\x1b[0m`);
            resolve(json);
          }
        } catch (e) {
          console.error('[x] Response parse error:', data);
          resolve(data);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`\x1b[31m[x] Request error: ${e.message}\x1b[0m`);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  const args = parseArgs();

  console.log('\x1b[34m========================================\x1b[0m');
  console.log('\x1b[1mKathir Xerox - WhatsApp CLI Gateway\x1b[0m');
  console.log('\x1b[34m========================================\x1b[0m');

  if (args.help || (!args.to && !args.test)) {
    console.log(`
Usage:
  node scripts/whatsapp-cli.js --to=<phone_number> --message="<plain text message>"
  node scripts/whatsapp-cli.js --test --to=<phone_number>

Options:
  --to       Target customer or owner mobile number (e.g. 9842100000)
  --message  Plain text merchant message to send
  --test     Send a sample receipt test message
    `);
    process.exit(0);
  }

  const to = args.to || process.env.OWNER_WHATSAPP_NUMBER || '9842100000';
  let message = args.message;

  if (args.test || !message) {
    message = [
      'Kathir Xerox & E-Service Centre',
      'Digital Bill Receipt (CLI Test)',
      '----------------------------------------',
      'Token No: TX-CLI-TEST',
      `Date: ${new Date().toLocaleDateString('en-IN')}`,
      'Customer: Walk-in Customer',
      '----------------------------------------',
      'Items:',
      '1. A4 Xerox Single Side x 10 = Rs. 20.00',
      '2. Aadhaar Card Download x 1 = Rs. 30.00',
      '----------------------------------------',
      'Grand Total: Rs. 50.00',
      'Payment Mode: CASH',
      '----------------------------------------',
      'Thank you! Please visit again.',
      'Kathir Xerox - Tamil Nadu',
    ].join('\n');
  }

  console.log(`\x1b[36mDispatching to:\x1b[0m ${to}`);
  console.log(`\x1b[36mMessage:\x1b[0m\n${message}\n`);

  await sendWhatsAppViaTwilio(to, message);
}

main().catch(console.error);
