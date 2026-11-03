import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_FILE || path.join(here, '../data/csbams.dev.sqlite');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
export default db;
