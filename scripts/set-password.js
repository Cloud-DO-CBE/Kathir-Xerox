const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_8jiO1uLGmVEp@ep-steep-fire-axto81cy.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require');

async function updatePassword() {
  const result = await sql`
    UPDATE shop_settings 
    SET access_password = '1', updated_at = NOW() 
    WHERE id = 'default' 
    RETURNING *;
  `;
  console.log('UPDATED SHOP SETTINGS:', result);
}

updatePassword().catch(console.error);
