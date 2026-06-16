const postgres = require('postgres');

async function fix() {
  const sql = postgres("postgresql://postgres:samarth%40%2312345@localhost:5432/formforge");
  
  try {
    console.log("Dropping constraints...");
    await sql`ALTER TABLE forms DROP CONSTRAINT IF EXISTS forms_user_id_users_id_fk;`;
    await sql`ALTER TABLE templates DROP CONSTRAINT IF EXISTS templates_user_id_users_id_fk;`;
    await sql`ALTER TABLE template_categories DROP CONSTRAINT IF EXISTS template_categories_user_id_users_id_fk;`;

    console.log("Altering column types...");
    await sql`ALTER TABLE users ALTER COLUMN id TYPE text USING id::text;`;
    await sql`ALTER TABLE forms ALTER COLUMN user_id TYPE text USING user_id::text;`;
    await sql`ALTER TABLE templates ALTER COLUMN user_id TYPE text USING user_id::text;`;
    await sql`ALTER TABLE template_categories ALTER COLUMN user_id TYPE text USING user_id::text;`;
    
    console.log("Successfully altered columns.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
  }
}

fix();
