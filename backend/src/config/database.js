import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';
import { env } from './env.js';

export const db = mysql.createPool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,

  ssl: {
    ca: readFileSync(
      new URL('./certs/ca.pem', import.meta.url),
      'utf8'
    ),
    rejectUnauthorized: true
  },

  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: 'Z'
});