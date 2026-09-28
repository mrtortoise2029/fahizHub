import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router=Router();
const booking=z.object({type:z.string().trim().min(2).max(120),name:z.string().trim().min(2).max(120),email:z.email(),message:z.string().max(3000).default(''),start_time:z.iso.datetime(),end_time:z.iso.datetime(),timezone:z.string().max(80).default('Asia/Dhaka')}).refine((v)=>new Date(v.end_time)>new Date(v.start_time),{message:'End time must be after start time.'});
router.post('/',validate(booking),asyncHandler(async(req,res)=>{const m=req.validated;if(new Date(m.start_time)<=new Date())return res.status(400).json({success:false,message:'Please choose a future time.'});try{const [result]=await db.execute('INSERT INTO meetings(type,name,email,message,start_time_utc,end_time_utc,timezone) VALUES (?,?,?,?,?,?,?)',[m.type,m.name,m.email,m.message,new Date(m.start_time),new Date(m.end_time),m.timezone]);await db.execute("INSERT INTO notifications(type,title,body,entity_type,entity_id) VALUES ('meeting','New meeting request',?,'meeting',?)",[m.type,result.insertId]);res.status(201).json({success:true,message:'Your meeting request has been submitted.'})}catch(error){if(error.code==='ER_DUP_ENTRY')return res.status(409).json({success:false,message:'That time was just booked. Please choose another.'});throw error}}));
router.get('/',requireAuth,asyncHandler(async(req,res)=>{const [rows]=await db.query('SELECT * FROM meetings ORDER BY start_time_utc DESC');res.json({success:true,data:rows})}));
router.patch('/:id',requireAuth,validate(z.object({status:z.enum(['pending','confirmed','completed','cancelled','rejected']),admin_notes:z.string().max(5000).default('')})),asyncHandler(async(req,res)=>{const [result]=await db.execute('UPDATE meetings SET status=?,admin_notes=? WHERE id=?',[req.validated.status,req.validated.admin_notes,req.params.id]);if(!result.affectedRows)return res.status(404).json({success:false,message:'Meeting not found.'});res.json({success:true})}));
export default router;

