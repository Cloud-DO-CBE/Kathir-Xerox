/**
 * Kathir Xerox - Standalone 9:00 PM Daily Digest Cron Script
 * Run with: npm run cron:digest
 * Or execute in pm2/background process
 */

const http = require('http');

console.log('⏰ Kathir Xerox 9:00 PM Daily WhatsApp Cron Scheduler Started.');
console.log('Target schedule: 9:00 PM IST (21:00) every day.');

function checkAndTriggerDigest() {
  const now = new Date();
  // IST is UTC + 5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);

  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();

  console.log(`[${istDate.toISOString()}] Current IST Time: ${hours}:${String(minutes).padStart(2, '0')}`);

  // Trigger if 21:00
  if (hours === 21 && minutes === 0) {
    console.log('🚀 Triggering 9:00 PM Daily Digest Webhook...');
    
    // Call the local Next.js API endpoint
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/cron/whatsapp-digest?key=kathir_secret_token_9pm',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('✅ Daily Digest Response:', data);
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Cron trigger error: ${e.message}`);
    });

    req.end();
  }
}

// Check every 60 seconds
setInterval(checkAndTriggerDigest, 60000);
checkAndTriggerDigest();
