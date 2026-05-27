/**
 * Creates contact_inquiries table in Supabase.
 * Requires SUPABASE_DB_URL in .env (Database password from Supabase Dashboard).
 *
 * Get it: Project Settings → Database → Connection string → URI (Session pooler)
 * Run: npm run db:setup
 */
const fs = require("fs");
const path = require("path");

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[trimmed.slice(0, eq).trim()] = value;
  }
  return env;
}

function projectRefFromUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host.split(".")[0];
  } catch {
    return null;
  }
}

async function main() {
  const root = path.join(__dirname, "..");
  const env = parseEnv(path.join(root, ".env"));
  const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;

  if (!dbUrl) {
    const ref = projectRefFromUrl(env.SUPABASE_URL || "");
    console.error(`
Missing SUPABASE_DB_URL in .env

The anon API key cannot create tables. Add your database connection string:

1. Open Supabase Dashboard → Project Settings → Database
2. Under "Connection string", choose URI + Session pooler
3. Copy the string and replace [YOUR-PASSWORD] with your database password
4. Add to .env:

   SUPABASE_DB_URL=postgresql://postgres.xxxx:YOUR_PASSWORD@...

5. Run again: npm run db:setup
`);
    if (ref) {
      console.error(
        `Database settings: https://supabase.com/dashboard/project/${ref}/settings/database\n`
      );
    }
    process.exit(1);
  }

  let pg;
  try {
    pg = require("pg");
  } catch {
    console.error("Installing pg dependency… run: npm install");
    process.exit(1);
  }

  const sqlPath = path.join(root, "supabase", "schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to database. Running schema…");
    await client.query(sql);
    console.log("Done. Table contact_inquiries and RLS policies are ready.");
  } catch (err) {
    console.error("Schema failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
