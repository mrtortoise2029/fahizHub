import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: new URL('../../.env', import.meta.url), quiet: true });
const database = process.env.DB_NAME || 'fahizhub';
if (!/^[a-zA-Z0-9_]+$/.test(database)) throw new Error('DB_NAME may contain only letters, numbers, and underscores.');
const connection = await mysql.createConnection({ host:process.env.DB_HOST||'localhost', port:Number(process.env.DB_PORT||3306), user:process.env.DB_USER||'root', password:process.env.DB_PASSWORD||'', multipleStatements:true });

try {
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE \`${database}\``);
  await connection.query('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(255) PRIMARY KEY, checksum CHAR(64) NULL, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
  const [columns] = await connection.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='schema_migrations' AND COLUMN_NAME='checksum'", [database]);
  if (!columns.length) await connection.query('ALTER TABLE schema_migrations ADD COLUMN checksum CHAR(64) NULL AFTER name');
  const files=(await readdir(new URL('../../database/migrations/',import.meta.url))).filter((file)=>file.endsWith('.sql')).sort();
  for(const file of files){
    const raw=await readFile(new URL(`../../database/migrations/${file}`,import.meta.url),'utf8');
    const checksum=createHash('sha256').update(raw).digest('hex');
    const sql=raw.replace(/^\s*USE\s+`?fahizhub`?\s*;/i,`USE \`${database}\`;`);
    const [[done]]=await connection.execute('SELECT name,checksum FROM schema_migrations WHERE name=?',[file]);
    if(done){
      if(done.checksum&&done.checksum!==checksum)throw new Error(`Applied migration ${file} has been modified.`);
      if(!done.checksum)await connection.execute('UPDATE schema_migrations SET checksum=? WHERE name=?',[checksum,file]);
      continue;
    }
    await connection.beginTransaction();
    try{await connection.query(sql);await connection.execute('INSERT INTO schema_migrations(name,checksum) VALUES(?,?)',[file,checksum]);await connection.commit();console.log(`Applied ${file}`);}catch(error){await connection.rollback();throw error;}
  }
  console.log('Database migrations are current.');
} finally { await connection.end(); }
