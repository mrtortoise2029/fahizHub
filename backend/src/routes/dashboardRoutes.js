import { Router } from 'express';
import { db } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router=Router();
router.use(requireAuth);

router.get('/',asyncHandler(async(req,res)=>{
  const[countResult,tasksResult,meetingsResult,messagesResult,learningResult]=await Promise.all([
    db.query(`SELECT (SELECT COUNT(*) FROM projects WHERE is_published=1) projects,(SELECT COUNT(*) FROM messages WHERE status='new') unread_messages,(SELECT COUNT(*) FROM meetings WHERE status='pending') pending_meetings,(SELECT COUNT(*) FROM tasks WHERE status!='completed' AND due_at<CURRENT_TIMESTAMP) overdue_tasks`),
    db.query("SELECT id,title,priority,due_at,status FROM tasks WHERE status!='completed' ORDER BY due_at IS NULL,due_at LIMIT 5"),
    db.query("SELECT id,type,name,start_time_utc,status FROM meetings WHERE start_time_utc>=CURRENT_TIMESTAMP AND status IN('pending','confirmed') ORDER BY start_time_utc LIMIT 5"),
    db.query('SELECT id,name,subject,status,created_at FROM messages ORDER BY created_at DESC LIMIT 5'),
    db.query("SELECT id,title,status,progress FROM learning_goals WHERE status!='completed' ORDER BY updated_at DESC LIMIT 5"),
  ]);
  res.json({success:true,data:{counts:countResult[0][0],tasks:tasksResult[0],meetings:meetingsResult[0],messages:messagesResult[0],learning:learningResult[0]}});
}));

router.get('/notifications',asyncHandler(async(req,res)=>{const[rows]=await db.query('SELECT * FROM notifications ORDER BY is_read,created_at DESC LIMIT 30');res.json({success:true,data:rows})}));
router.patch('/notifications/:id',asyncHandler(async(req,res)=>{const[result]=await db.execute('UPDATE notifications SET is_read=1 WHERE id=?',[req.params.id]);if(!result.affectedRows)return res.status(404).json({success:false,message:'Notification not found.'});res.json({success:true})}));

export default router;
