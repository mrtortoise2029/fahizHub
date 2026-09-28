import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router=Router();router.use(requireAuth);
const schema=z.object({title:z.string().trim().min(2).max(255),notes:z.string().max(5000).default(''),priority:z.enum(['low','medium','high','urgent']).default('medium'),due_at:z.union([z.iso.datetime(),z.literal('')]).default(''),status:z.enum(['todo','in_progress','completed']).default('todo'),category_id:z.coerce.number().int().positive().nullable().optional()});
router.get('/categories',asyncHandler(async(req,res)=>{const [rows]=await db.query('SELECT * FROM task_categories ORDER BY name');res.json({success:true,data:rows})}));
router.get('/',asyncHandler(async(req,res)=>{const [rows]=await db.query(`SELECT t.*,c.name category FROM tasks t LEFT JOIN task_categories c ON c.id=t.category_id ORDER BY t.status='completed',t.due_at IS NULL,t.due_at,t.created_at DESC`);res.json({success:true,data:rows})}));
router.post('/',validate(schema),asyncHandler(async(req,res)=>{const t=req.validated;const [result]=await db.execute('INSERT INTO tasks(title,notes,priority,due_at,status,category_id,completed_at) VALUES (?,?,?,?,?,?,?)',[t.title,t.notes,t.priority,t.due_at?new Date(t.due_at):null,t.status,t.category_id||null,t.status==='completed'?new Date():null]);const [[created]]=await db.execute('SELECT * FROM tasks WHERE id=?',[result.insertId]);res.status(201).json({success:true,data:created})}));
router.put('/:id',validate(schema),asyncHandler(async(req,res)=>{const t=req.validated;const [result]=await db.execute('UPDATE tasks SET title=?,notes=?,priority=?,due_at=?,status=?,category_id=?,completed_at=? WHERE id=?',[t.title,t.notes,t.priority,t.due_at?new Date(t.due_at):null,t.status,t.category_id||null,t.status==='completed'?new Date():null,req.params.id]);if(!result.affectedRows)return res.status(404).json({success:false,message:'Task not found.'});res.json({success:true})}));
router.delete('/:id',asyncHandler(async(req,res)=>{const [result]=await db.execute('DELETE FROM tasks WHERE id=?',[req.params.id]);if(!result.affectedRows)return res.status(404).json({success:false,message:'Task not found.'});res.status(204).end()}));
export default router;

