import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const file='.env.staging';
if(!existsSync(file)){console.error('Missing .env.staging. Copy .env.example and supply staging-only values.');process.exit(1);}
const values={};
for(const raw of readFileSync(file,'utf8').split(/\r?\n/)){
  const line=raw.trim();if(!line||line.startsWith('#')||!line.includes('='))continue;
  const index=line.indexOf('=');const key=line.slice(0,index).trim();let value=line.slice(index+1).trim();
  if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
  values[key]=value;
}
const required=['DB_PASSWORD','MYSQL_ROOT_PASSWORD','JWT_SECRET','ADMIN_EMAIL','ADMIN_PASSWORD','CLIENT_URL','STAGING_URL','GEMINI_API_KEY','SMTP_HOST','SMTP_USER','SMTP_PASSWORD','EMAIL_FROM','TURNSTILE_SECRET_KEY','VITE_TURNSTILE_SITE_KEY'];
const missing=required.filter((key)=>!values[key]||/replace|change-this|example\.com/i.test(values[key]));
const errors=[];
if(missing.length)errors.push(`Missing or placeholder values: ${missing.join(', ')}`);
for(const key of ['CLIENT_URL','STAGING_URL'])if(values[key]&&!values[key].startsWith('https://'))errors.push(`${key} must use HTTPS.`);
if(values.JWT_SECRET&&values.JWT_SECRET.length<32)errors.push('JWT_SECRET must contain at least 32 characters.');
const docker=spawnSync('docker',['compose','version'],{encoding:'utf8'});
if(docker.error||docker.status!==0)errors.push('Docker Compose is not installed or unavailable.');
if(errors.length){for(const error of errors)console.error(`- ${error}`);process.exit(1);}
console.log('Staging preflight passed: required configuration and Docker Compose are available.');
