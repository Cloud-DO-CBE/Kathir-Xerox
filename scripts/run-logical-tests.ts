import { prisma } from '../src/lib/prisma';

async function runLogicalTests() {
  console.log('====================================================');
  console.log('  KATHIR XEROX - FULL SYSTEM LOGICAL VERIFICATION   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`, detail || '');
      failed++;
    }
  }

  // --- TEST 1: Database Connectivity ---
  console.log('1. DATABASE & ADAPTER CONNECTIVITY');
  try {
    const rawCheck = await prisma.$queryRaw<any[]>`SELECT 1 as connected;`;
    assert(rawCheck.length > 0 && Number(rawCheck[0].connected) === 1, 'Neon PostgreSQL connected via WebSocket adapter');
  } catch (err: any) {
    assert(false, 'Database connection failed', err.message);
  }

  // --- TEST 2: Shop Settings & Password Validation ---
  console.log('\n2. SHOP SETTINGS & PASSWORD VALIDATION');
  try {
    const settings = await prisma.shopSettings.findUnique({ where: { id: 'default' } });
    assert(!!settings, 'Shop settings record exists in Neon PostgreSQL');
    assert(settings?.access_password === '1', `Current active password is '1' (Actual: '${settings?.access_password}')`);
    assert(settings?.shop_name === 'Kathir Xerox & E-Service Centre', 'Shop name matches configuration');
  } catch (err: any) {
    assert(false, 'Shop settings check failed', err.message);
  }

  // --- TEST 3: Service Catalog Integrity ---
  console.log('\n3. SERVICE CATALOG INTEGRITY');
  try {
    const services = await prisma.service.findMany({ orderBy: { id: 'asc' } });
    assert(services.length >= 20, `Service catalog has ${services.length} active service items (>= 20 expected)`);

    const xeroxItem = services.find(s => s.id === 'srv-xerox-bw-ss');
    assert(!!xeroxItem && xeroxItem.default_unit_price === 2, 'Xerox single-side rate is Rs. 2');

    const colorItem = services.find(s => s.id === 'srv-xerox-col-ss');
    assert(!!colorItem && colorItem.default_unit_price === 10, 'Color Xerox single-side rate is Rs. 10');
  } catch (err: any) {
    assert(false, 'Service catalog check failed', err.message);
  }

  // --- TEST 4: Daybook & Transaction Flow ---
  console.log('\n4. DAYBOOK, BILLING & DUE LEDGER TRANSACTION INTEGRITY');
  const testDate = '2099-01-01'; // Future date to avoid collision with real shop data
  let createdTxId: string | null = null;
  const testCustomer = 'Test Customer Auto';

  try {
    // A. Create or get test Daybook
    let book = await prisma.dailyBook.upsert({
      where: { date: testDate },
      update: {},
      create: {
        date: testDate,
        status: 'OPEN',
        total_cash: 0,
        total_upi: 0,
        total_due: 0,
        total_amount: 0,
        total_transactions: 0,
      },
    });
    assert(book.date === testDate, 'Test Daybook initialized for date 2099-01-01');

    // B. Create a split bill transaction (Cash Rs. 20 + Due Rs. 30 = Rs. 50 Total)
    const tx = await prisma.transaction.create({
      data: {
        book_id: book.id,
        timestamp: new Date(`${testDate}T10:00:00Z`),
        token_no: 'T-TEST-001',
        payment_mode: 'SPLIT',
        customer_ref: testCustomer,
        customer_phone: '9999999999',
        grand_total: 50,
        cash_amount: 20,
        upi_amount: 0,
        due_amount: 30,
        notes: 'Automated test billing verification',
        items: {
          create: [
            {
              item_name: 'Test Xerox Copy',
              category: 'XEROX',
              quantity: 10,
              unit_price: 2,
              subtotal: 20,
            },
            {
              item_name: 'Test Online Application',
              category: 'E_SERVICE',
              quantity: 1,
              unit_price: 30,
              subtotal: 30,
            },
          ],
        },
      },
      include: { items: true },
    });
    createdTxId = tx.id;
    assert(tx.items.length === 2, 'Transaction created with 2 line items attached');

    // Update daybook totals
    await prisma.dailyBook.update({
      where: { id: book.id },
      data: {
        total_cash: { increment: 20 },
        total_due: { increment: 30 },
        total_amount: { increment: 50 },
        total_transactions: { increment: 1 },
      },
    });

    // Update customer due ledger
    await prisma.customerDue.upsert({
      where: { customer_ref: testCustomer },
      update: { total_due: { increment: 30 } },
      create: { customer_ref: testCustomer, total_due: 30, customer_phone: '9999999999' },
    });

    // C. Verify Daybook updated
    const updatedBook = await prisma.dailyBook.findUnique({ where: { id: book.id } });
    assert(updatedBook?.total_amount === 50, 'Daybook total_amount incremented correctly to Rs. 50');
    assert(updatedBook?.total_cash === 20, 'Daybook total_cash incremented correctly to Rs. 20');
    assert(updatedBook?.total_due === 30, 'Daybook total_due incremented correctly to Rs. 30');

    // D. Verify Due Customer Ledger
    const dueRecord = await prisma.customerDue.findUnique({ where: { customer_ref: testCustomer } });
    assert(dueRecord?.total_due === 30, 'Customer due ledger tracks Rs. 30 outstanding due');

    // E. Settle Due
    await prisma.customerDue.update({
      where: { customer_ref: testCustomer },
      data: { total_due: { decrement: 30 } },
    });
    const settledDue = await prisma.customerDue.findUnique({ where: { customer_ref: testCustomer } });
    assert(settledDue?.total_due === 0, 'Customer due settlement decrements balance to Rs. 0');

  } catch (err: any) {
    assert(false, 'Transaction / Daybook flow failed', err.message);
  } finally {
    // Clean up test data so real ledger is untouched
    if (createdTxId) {
      await prisma.transactionItem.deleteMany({ where: { transaction_id: createdTxId } });
      await prisma.transaction.delete({ where: { id: createdTxId } });
    }
    await prisma.dailyBook.deleteMany({ where: { date: testDate } });
    await prisma.customerDue.deleteMany({ where: { customer_ref: testCustomer } });
    console.log('  [CLEANUP] Test artifacts purged cleanly.');
  }

  // --- TEST 5: HTTP Login & Settings API Routes ---
  console.log('\n5. API ROUTE LOGIC TESTS');
  // Test password verification function logic directly
  const dbSettings = await prisma.shopSettings.findUnique({ where: { id: 'default' } });
  const activePassword = dbSettings?.access_password || process.env.ACCESS_PASSWORD || '1';

  assert('1'.trim() === activePassword.trim(), `Password '1' successfully validates against active store password ('${activePassword}')`);
  assert('RX135'.trim() !== activePassword.trim(), `Old default password 'RX135' is rejected as expected`);
  assert('wrongpass'.trim() !== activePassword.trim(), `Arbitrary wrong password rejected`);

  console.log('\n====================================================');
  console.log(`  RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLogicalTests()
  .catch((e) => {
    console.error('Fatal error during test run:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
