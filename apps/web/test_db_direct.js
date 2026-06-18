import 'dotenv/config';
import postgres from 'postgres';

async function test() {
  const url = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/formforge";
  console.log("Connecting to", url);
  const sql = postgres(url);
  
  try {
    const res = await sql`SELECT * FROM landing_upvotes`;
    console.log("Current rows:", res);
    
    if (res.length === 0) {
        console.log("Inserting row 1...");
        await sql`INSERT INTO landing_upvotes (id, count) VALUES (1, 0) ON CONFLICT (id) DO NOTHING`;
    }
    
    const updateRes = await sql`UPDATE landing_upvotes SET count = count + 1, updated_at = NOW() WHERE id = 1 RETURNING *`;
    console.log("Update result:", updateRes);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
  }
}

test();
