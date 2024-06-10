import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2';

export const connection = mysql.createPool({
  host: process.env['DB_HOST'],
  user: process.env['DB_USER'],
  password: process.env['DB_PASSWORD'],
  database: process.env['DB_NAME'],
  port: Number(process.env['DB_PORT']),
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
});

export const db = drizzle(connection);
