import { logger } from 'app/logger';
import arg from 'arg';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
import { APP_ENV } from 'types/common';
import seed from './seed';

(async () => {
  try {
    const args = arg({
      '--help': Boolean,
      '--create': Boolean,
      '--migrate': Boolean,
      '--drop': Boolean,
      '--fresh': Boolean,
      '--seed': Boolean,

      // Aliases
      '-h': '--help',
      '-m': '--migrate',
    });

    // Default action when no arguments are passed
    if (Object.keys(args).length === 1) {
      await createDb();
      await migrateDb();
      process.exit(0);
    }

    if (args['--help']) {
      process.stdout.write(
        'CLI helper for database operations\n\n' +
          'Options:\n' +
          '-h, --help\t\tShow help\n' +
          '--create\t\tCreate database\n' +
          '-m, --migrate\t\tMigrate database\n' +
          '--drop\t\t\tDrop database\n' +
          '--fresh\t\t\tDrop and recreate database\n' +
          '--seed\t\t\tSeed database\n',
      );
      process.exit(0);
    }

    if (args['--fresh']) {
      await dropDb();
      await createDb();
      await migrateDb();
      process.exit(0);
    }

    if (args['--create']) {
      await createDb();
    }

    if (args['--migrate']) {
      await migrateDb();
    }

    if (args['--seed']) {
      await seedDb();
    }

    if (args['--drop']) {
      await dropDb();
    }
  } catch (err) {
    logger.error((err as Error).message, { service: 'DB CLI' });
    process.exit(1);
  }
})();

/**
 * Connect to the database and return a connection object.
 *
 * Database connection will auto close if the code is done executing
 */
async function getConn() {
  const connection = await mysql.createConnection({
    host: process.env['DB_HOST'],
    user: process.env['DB_USER'],
    password: process.env['DB_PASSWORD'],
    port: Number(process.env['DB_PORT']),
  });

  return {
    connection,
    [Symbol.asyncDispose]: async () => {
      await connection.end();
    },
  };
}

async function createDb() {
  const dbName = process.env['DB_NAME'];
  logger.info(`Creating ${dbName} database`, {
    service: 'DB CLI',
  });
  await using db = await getConn();
  await db.connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
  logger.info(`Database ${dbName} created`, {
    service: 'DB CLI',
  });
}

async function migrateDb() {
  logger.info('Starting database migration', { service: 'DB CLI' });
  await using db = await getConn();
  await db.connection.query(`USE ${process.env['DB_NAME']}`);
  await migrate(drizzle(db.connection), {
    migrationsFolder: './drizzle',
  });
  logger.info('Migration complete', { service: 'DB CLI' });
}

async function dropDb() {
  if (process.env['APP_ENV'] === APP_ENV.PROD) {
    throw new Error('Cannot drop database in production environment');
  }
  const dbName = process.env['DB_NAME'];
  logger.info(`Dropping ${dbName} database`, {
    service: 'DB CLI',
  });
  await using db = await getConn();
  await db.connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
  logger.info(`Database ${dbName} dropped`, {
    service: 'DB CLI',
  });
}

async function seedDb() {
  logger.info('Seeding database', { service: 'DB CLI' });
  await using mysql = await getConn();
  await mysql.connection.query(`USE ${process.env['DB_NAME']}`);
  const db = drizzle(mysql.connection);

  await seed(db);

  logger.info('Seeding complete', { service: 'DB CLI' });
}
