import { Router } from 'express';
import { db } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router=Router();
router.get('/',asyncHandler(async(req,res)=>{const [rows]=await db.query(`SELECT p.id,p.slug,p.title,p.subtitle,p.short_description AS description,p.category,p.status,p.github_url,p.live_url,JSON_ARRAYAGG(s.name) AS technologies FROM projects p LEFT JOIN project_skills ps ON ps.project_id=p.id LEFT JOIN skills s ON s.id=ps.skill_id WHERE p.is_published=1 GROUP BY p.id ORDER BY p.display_order,p.created_at DESC`);res.json({success:true,data:rows})}));
router.get('/:slug',asyncHandler(async(req,res)=>{const [rows]=await db.execute('SELECT * FROM projects WHERE slug=? AND is_published=1 LIMIT 1',[req.params.slug]);if(!rows[0])return res.status(404).json({success:false,message:'Project not found.'});res.json({success:true,data:rows[0]})}));export default router;

