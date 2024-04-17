import { connection, db } from 'app/db';
import { logger } from 'app/logger';
import { migrate } from 'drizzle-orm/mysql2/migrator';

(async () => {
  await migrate(db, { migrationsFolder: './drizzle' });

  await connection.end();
  logger.info('Migration completed', { service: 'migration' });
})();
