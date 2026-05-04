import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const dbUrl = new URL(process.env.DATABASE_URL);
const dbHost = dbUrl.hostname;
const dbName = dbUrl.pathname.slice(1);

console.log('[DB] ========================================');
console.log(`[DB] Database Host: ${dbHost}`);
console.log(`[DB] Database Name: ${dbName}`);
console.log('[DB] ========================================');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log(`[DB] PostgreSQL connected to: ${dbHost}/${dbName}`);
});

pool.on('error', (err) => {
  console.error('[DB] PostgreSQL connection error:', err.message);
});

// Export connection info for health checks
export const dbInfo = { host: dbHost, database: dbName };

export const db = drizzle(pool);
