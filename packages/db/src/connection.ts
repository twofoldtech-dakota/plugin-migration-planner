import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const { Pool } = pg;

let _pool: pg.Pool | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb(connectionStringOverride?: string) {
  if (_db) return _db;

  const connectionString = connectionStringOverride || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  _pool = new Pool({
    connectionString,
    max: process.env.DB_POOL_SIZE ? parseInt(process.env.DB_POOL_SIZE, 10) : 5,
  });

  _db = drizzle(_pool, { schema });
  return _db;
}

export type Database = ReturnType<typeof getDb>;

export async function closeDb() {
  if (_pool) {
    await _pool.end();
    _pool = null;
    _db = null;
  }
}
