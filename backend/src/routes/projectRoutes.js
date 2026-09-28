import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { removeEntityUploads } from '../services/uploadCleanup.js';

const router = Router();
const projectSchema = z.object({
  title: z.string().trim().min(2).max(190),
  slug: z.string().trim().min(2).max(190).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  subtitle: z.string().trim().max(255).default(''),
  short_description: z.string().trim().min(10),
  overview: z.string().trim().default(''),
  problem: z.string().trim().default(''),
  solution: z.string().trim().default(''),
  features: z.string().default(''),
  challenges: z.string().trim().default(''),
  lessons_learned: z.string().trim().default(''),
  contribution: z.string().trim().default(''),
  category: z.string().trim().max(80).default(''),
  status: z.string().trim().max(80).default('Active'),
  github_url: z.union([z.url(), z.literal('')]).default(''),
  live_url: z.union([z.url(), z.literal('')]).default(''),
  is_published: z.boolean().default(false),
});

const featureJson = (value) => JSON.stringify(value.split('\n').map((item) => item.trim()).filter(Boolean));

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await db.query(`SELECT p.id,p.slug,p.title,p.subtitle,p.short_description AS description,p.category,p.status,p.github_url,p.live_url,p.thumbnail_url,JSON_ARRAYAGG(s.name) AS technologies FROM projects p LEFT JOIN project_skills ps ON ps.project_id=p.id LEFT JOIN skills s ON s.id=ps.skill_id WHERE p.is_published=1 GROUP BY p.id ORDER BY p.display_order,p.created_at DESC`);
  res.json({ success: true, data: rows.map((project) => ({ ...project, technologies: (project.technologies || []).filter(Boolean) })) });
}));

router.get('/admin/all', requireAuth, asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM projects ORDER BY display_order,updated_at DESC');
  res.json({ success: true, data: rows.map((project) => ({
    ...project,
    features: Array.isArray(project.features) ? project.features.join('\n') : '',
  })) });
}));

router.post('/', requireAuth, validate(projectSchema), asyncHandler(async (req, res) => {
  const p = req.validated;
  const [result] = await db.execute(`INSERT INTO projects(title,slug,subtitle,short_description,overview,problem,solution,features,challenges,lessons_learned,contribution,category,status,github_url,live_url,is_published) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [p.title,p.slug,p.subtitle,p.short_description,p.overview,p.problem,p.solution,featureJson(p.features),p.challenges,p.lessons_learned,p.contribution,p.category,p.status,p.github_url||null,p.live_url||null,p.is_published]);
  const [[created]] = await db.execute('SELECT * FROM projects WHERE id=?', [result.insertId]);
  res.status(201).json({ success: true, data: created });
}));

router.put('/:id', requireAuth, validate(projectSchema), asyncHandler(async (req, res) => {
  const p = req.validated;
  const [result] = await db.execute(`UPDATE projects SET title=?,slug=?,subtitle=?,short_description=?,overview=?,problem=?,solution=?,features=?,challenges=?,lessons_learned=?,contribution=?,category=?,status=?,github_url=?,live_url=?,is_published=? WHERE id=?`, [p.title,p.slug,p.subtitle,p.short_description,p.overview,p.problem,p.solution,featureJson(p.features),p.challenges,p.lessons_learned,p.contribution,p.category,p.status,p.github_url||null,p.live_url||null,p.is_published,req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Project not found.' });
  const [[updated]] = await db.execute('SELECT * FROM projects WHERE id=?', [req.params.id]);
  res.json({ success: true, data: updated });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const [result] = await db.execute('DELETE FROM projects WHERE id=?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Project not found.' });
  await removeEntityUploads('project_image',req.params.id);
  res.status(204).end();
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const [rows] = await db.execute(`SELECT p.*,JSON_ARRAYAGG(s.name) AS technologies FROM projects p LEFT JOIN project_skills ps ON ps.project_id=p.id LEFT JOIN skills s ON s.id=ps.skill_id WHERE p.slug=? AND p.is_published=1 GROUP BY p.id LIMIT 1`, [req.params.slug]);
  if (!rows[0]) return res.status(404).json({ success: false, message: 'Project not found.' });
  rows[0].technologies = (rows[0].technologies || []).filter(Boolean);
  const [images] = await db.execute('SELECT id,url,alt_text,display_order FROM project_images WHERE project_id=? ORDER BY display_order,id', [rows[0].id]);
  rows[0].images = images;
  res.json({ success: true, data: rows[0] });
}));

export default router;
