import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
const cookieOptions={httpOnly:true,secure:env.NODE_ENV==='production',sameSite:'lax',maxAge:2*60*60*1000,path:'/'};
export async function login(req,res){const {email,password}=req.validated;const [rows]=await db.execute('SELECT id, name, email, password_hash, role FROM users WHERE email = ? AND is_active = 1 LIMIT 1',[email]);const user=rows[0];if(!user||!await bcrypt.compare(password,user.password_hash))return res.status(401).json({success:false,message:'Invalid email or password.'});const safe={id:user.id,name:user.name,email:user.email,role:user.role};const token=jwt.sign(safe,env.JWT_SECRET,{expiresIn:env.JWT_EXPIRES_IN});res.cookie('access_token',token,cookieOptions).json({success:true,data:safe})}
export function logout(req,res){res.clearCookie('access_token',{...cookieOptions,maxAge:undefined}).json({success:true,message:'Signed out.'})}
export function me(req,res){res.json({success:true,data:req.user})}

