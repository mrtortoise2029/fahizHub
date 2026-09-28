import { Router } from 'express';
import { db } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/profile', asyncHandler(async (req, res) => {
  const [rows] = await db.query(`SELECT u.name, p.headline, p.hero_title, p.hero_subtitle, p.short_bio, p.long_bio, p.current_focus, p.profile_image_url, p.timezone,
    (SELECT setting_value FROM app_settings WHERE setting_key='public_email') public_email,
    (SELECT setting_value FROM app_settings WHERE setting_key='github_url') github_url,
    (SELECT setting_value FROM app_settings WHERE setting_key='linkedin_url') linkedin_url
    FROM profile p JOIN users u ON u.id = p.user_id LIMIT 1`);
  if (!rows[0]) return res.status(404).json({ success: false, message: 'Profile content has not been configured yet.' });
  res.json({ success: true, data: rows[0] });
}));

router.get('/skills', asyncHandler(async (req, res) => {
  const [rows] = await db.query(`SELECT sc.id AS category_id, sc.name AS category, s.id, s.name, s.icon
    FROM skill_categories sc JOIN skills s ON s.category_id = sc.id
    WHERE s.is_published = 1 ORDER BY sc.display_order, s.display_order, s.name`);
  const grouped = rows.reduce((categories, skill) => {
    let category = categories.find((item) => item.id === skill.category_id);
    if (!category) { category = { id: skill.category_id, name: skill.category, skills: [] }; categories.push(category); }
    category.skills.push({ id: skill.id, name: skill.name, icon: skill.icon });
    return categories;
  }, []);
  res.json({ success: true, data: grouped });
}));

router.get('/education', asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT id,institution,degree,status,credits_completed,cgpa,start_date,end_date,description FROM education WHERE is_published=1 ORDER BY display_order,start_date DESC');
  res.json({ success: true, data: rows });
}));

router.get('/experience', asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT id,organization,title,previous_title,description,start_date,end_date FROM experience WHERE is_published=1 ORDER BY display_order,start_date DESC');
  res.json({ success: true, data: rows });
}));

export default router;
