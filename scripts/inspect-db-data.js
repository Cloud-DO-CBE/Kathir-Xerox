const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_8jiO1uLGmVEp@ep-steep-fire-axto81cy.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require');

async function checkAll() {
  const [settings] = await sql`SELECT count(*) FROM shop_settings;`;
  const [services] = await sql`SELECT count(*) FROM services;`;
  const [books] = await sql`SELECT count(*) FROM daily_books;`;
  const [txs] = await sql`SELECT count(*) FROM transactions;`;
  const [items] = await sql`SELECT count(*) FROM transaction_items;`;
  const [dues] = await sql`SELECT count(*) FROM customer_dues;`;

  console.log('=== NEON POSTGRESQL RECORD COUNTS ===');
  console.log('1. shop_settings     :', settings.count);
  console.log('2. services (catalog):', services.count);
  console.log('3. daily_books       :', books.count);
  console.log('4. transactions      :', txs.count);
  console.log('5. transaction_items :', items.count);
  console.log('6. customer_dues     :', dues.count);

  if (Number(books.count) > 0) {
    const bookData = await sql`SELECT date, status, total_amount, total_transactions FROM daily_books ORDER BY date DESC LIMIT 5;`;
    console.log('\n--- Daily Books in Neon ---');
    console.table(bookData);
  } else {
    console.log('\nDaily Books: 0 records');
  }

  if (Number(txs.count) > 0) {
    const txData = await sql`SELECT token_no, payment_mode, grand_total, customer_ref, timestamp FROM transactions ORDER BY timestamp DESC LIMIT 5;`;
    console.log('\n--- Transactions in Neon ---');
    console.table(txData);
  } else {
    console.log('Transactions: 0 records');
  }

  if (Number(dues.count) > 0) {
    const dueData = await sql`SELECT customer_ref, total_due, customer_phone FROM customer_dues LIMIT 5;`;
    console.log('\n--- Customer Dues in Neon ---');
    console.table(dueData);
  } else {
    console.log('Customer Dues: 0 records');
  }

  const sampleServices = await sql`SELECT name, category, default_unit_price, unit_label FROM services LIMIT 5;`;
  console.log('\n--- Sample Services in Neon ---');
  console.table(sampleServices);
}

checkAll().catch(console.error);
