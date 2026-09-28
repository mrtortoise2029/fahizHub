import { readFile } from 'node:fs/promises';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: new URL('../../.env', import.meta.url), quiet: true });
const email=process.env.ADMIN_EMAIL;const password=process.env.ADMIN_PASSWORD;const database=process.env.DB_NAME||'fahizhub';
if(!email||!password||password==='change-this-before-seeding')throw new Error('Set a secure ADMIN_EMAIL and ADMIN_PASSWORD in .env before setup.');
if(!/^[a-zA-Z0-9_]+$/.test(database))throw new Error('DB_NAME may contain only letters, numbers, and underscores.');

await import('./migrateDatabase.js');
const connection=await mysql.createConnection({host:process.env.DB_HOST||'localhost',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',database,multipleStatements:true});
try{
  const rawSeed=await readFile(new URL('../../database/seed/001_profile_content.sql',import.meta.url),'utf8');
  const seed=rawSeed.replace(/^\s*USE\s+`?fahizhub`?\s*;/i,`USE \`${database}\`;`);
  await connection.query(seed);
  const hash=await bcrypt.hash(password,12);
  await connection.query('INSERT INTO users(name,email,password_hash) VALUES (?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),password_hash=VALUES(password_hash)',['Fahiz Ahmed',email,hash]);
  const[[user]]=await connection.query('SELECT id FROM users WHERE email=? LIMIT 1',[email]);
  await connection.query(`INSERT INTO profile(user_id,headline,hero_title,hero_subtitle,short_bio,long_bio,current_focus,timezone)
    VALUES (?,?,?,?,?,?,?,'Asia/Dhaka') ON DUPLICATE KEY UPDATE headline=VALUES(headline),hero_title=VALUES(hero_title),hero_subtitle=VALUES(hero_subtitle),short_bio=VALUES(short_bio),long_bio=VALUES(long_bio),current_focus=VALUES(current_focus),timezone=VALUES(timezone)`,[
    user.id,
    'Computer Science & Engineering Student | Software Developer | Full-Stack Developer in Progress',
    'Computer Science Student Building Practical Software Solutions.',
    'Exploring software engineering, full-stack development, intelligent systems, and practical technology through projects and continuous learning.',
    'Computer Science and Engineering student passionate about software development, full-stack web applications, problem solving, and building practical technology solutions.',
    'I am a Computer Science and Engineering student at United International University with a strong interest in software engineering, full-stack development, problem solving, and practical technology. I enjoy turning ideas into functional software products and continuously improving my technical and professional skills through academic projects, personal projects, leadership activities, and hands-on development.',
    'Currently learning and building with React, Node.js, databases, AI APIs, and modern software engineering practices.',
  ]);
  console.log('Database schema, profile content, and admin account are ready.');
}finally{await connection.end();}
