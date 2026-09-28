import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function requireAuth(req,res,next){const token=req.cookies.access_token;if(!token)return res.status(401).json({success:false,message:'Authentication required.'});try{req.user=jwt.verify(token,env.JWT_SECRET);next()}catch{return res.status(401).json({success:false,message:'Your session is invalid or expired.'})}}

