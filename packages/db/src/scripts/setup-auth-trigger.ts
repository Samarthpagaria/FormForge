import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = postgres(connectionString);

async function setup() {
  console.log("Setting up Supabase auth trigger...");
  
  try {
    // Create the trigger function
    await sql`
      CREATE OR REPLACE FUNCTION public.handle_user_sync() 
      RETURNS trigger AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          INSERT INTO public.users (id, email, name)
          VALUES (
            new.id::text, 
            new.email, 
            COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'Anonymous User')
          );
        ELSIF TG_OP = 'UPDATE' THEN
          UPDATE public.users 
          SET 
            email = new.email,
            name = COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'Anonymous User')
          WHERE id = new.id::text;
        END IF;
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    console.log("Trigger function created.");

    // Create the triggers
    await sql`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    `;
    await sql`
      DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
    `;
    await sql`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_user_sync();
    `;
    await sql`
      CREATE TRIGGER on_auth_user_updated
        AFTER UPDATE ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_user_sync();
    `;
    console.log("Triggers created successfully.");
  } catch (err) {
    console.error("Failed to setup trigger:", err);
  } finally {
    await sql.end();
  }
}

setup();
