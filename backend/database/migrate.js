import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import db from '../config/db.js';
const here = path.dirname(fileURLToPath(import.meta.url)); db.exec(fs.readFileSync(path.join(here, 'schema.sql'), 'utf8')); console.log('Database schema is ready.');
