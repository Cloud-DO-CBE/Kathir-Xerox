const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('@prisma/client');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const connectionString = 'postgresql://neondb_owner:npg_8jiO1uLGmVEp@ep-steep-fire-axto81cy.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  console.log('Testing Prisma with Neon adapter...');
  const settings = await prisma.shopSettings.findUnique({ where: { id: 'default' } });
  console.log('Prisma query result:', settings);
  const servicesCount = await prisma.service.count();
  console.log('Services count:', servicesCount);
  await pool.end();
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
