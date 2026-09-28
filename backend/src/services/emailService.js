import nodemailer from 'nodemailer';
import { db } from '../config/database.js';
import { env } from '../config/env.js';

const configured=Boolean(env.SMTP_HOST&&env.SMTP_USER&&env.SMTP_PASSWORD&&env.EMAIL_FROM);
const transporter=configured?nodemailer.createTransport({host:env.SMTP_HOST,port:env.SMTP_PORT,secure:env.SMTP_SECURE,auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD}}):null;

export async function sendEmail({to,subject,text}){
  if(!to)return false;
  if(!transporter){await db.execute("INSERT INTO email_log(recipient,subject,body,status,error_message,last_attempt_at) VALUES(?,?,?,'skipped','SMTP is not configured',UTC_TIMESTAMP())",[to,subject,text]);return false;}
  try{await transporter.sendMail({from:env.EMAIL_FROM,to,subject,text});await db.execute("INSERT INTO email_log(recipient,subject,body,status,last_attempt_at) VALUES(?,?,?,'sent',UTC_TIMESTAMP())",[to,subject,text]);return true;}
  catch(error){await db.execute("INSERT INTO email_log(recipient,subject,body,status,error_message,last_attempt_at) VALUES(?,?,?,'failed',?,UTC_TIMESTAMP())",[to,subject,text,error.message]);return false;}
}

export async function sendAdminEmail(message){
  let recipient=env.ADMIN_NOTIFICATION_EMAIL;
  if(!recipient){const[[setting]]=await db.execute("SELECT setting_value FROM app_settings WHERE setting_key='public_email'");recipient=setting?.setting_value;}
  return recipient?sendEmail({...message,to:recipient}):false;
}
