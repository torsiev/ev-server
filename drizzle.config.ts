import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    host: process.env['DB_HOST'] ?? 'localhost',
    user: process.env['DB_USER'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_NAME'] ?? 'ev-server',
    port: Number(process.env['DB_PORT']),
  },
} satisfies Config;
