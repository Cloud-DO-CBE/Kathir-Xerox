const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_8jiO1uLGmVEp@ep-steep-fire-axto81cy.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require');

async function main() {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`;
  console.log('TABLES IN DB:', tables);
  if (tables.some(t => t.table_name === 'shop_settings')) {
    const settings = await sql`SELECT * FROM shop_settings;`;
    console.log('SHOP SETTINGS IN DB:', settings);
  }
}

main().catch(console.error);
