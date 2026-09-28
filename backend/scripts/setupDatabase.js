import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const connection = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', multipleStatements: true });
try {
  const schema = await readFile(new URL('../../database/migrations/001_initial_schema.sql', import.meta.url), 'utf8');
  const seed = await readFile(new URL('../../database/seed/001_profile_content.sql', import.meta.url), 'utf8');
  await connection.query(schema);
  await connection.query(seed);
  const email = process.env.ADMIN_EMAIL; const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password === 'change-this-before-seeding') throw new Error('Set a secure ADMIN_EMAIL and ADMIN_PASSWORD in .env before setup.');
  const hash = await bcrypt.hash(password, 12);
  await connection.query('USE fahizhub; INSERT INTO users(name,email,password_hash) VALUES (?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),password_hash=VALUES(password_hash)', ['Fahiz Ahmed', email, hash]);
  console.log('Database schema, profile content, and admin account are ready.');
} finally { await connection.end(); }
