import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { db } from '../config/database.js';
import { uploadDirectory } from '../config/storage.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const receive = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 1 } });
const allowed = {
  project_image: new Set(['image/jpeg', 'image/png', 'image/webp']),
  certificate: new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  cv: new Set(['application/pdf']),
};
const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'application/pdf': '.pdf' };
const matchesSignature = (file) => {
  const hex = file.buffer.subarray(0, 12).toString('hex');
  if (file.mimetype === 'application/pdf') return file.buffer.subarray(0, 5).toString() === '%PDF-';
  if (file.mimetype === 'image/png') return hex.startsWith('89504e470d0a1a0a');
  if (file.mimetype === 'image/jpeg') return hex.startsWith('ffd8ff');
  if (file.mimetype === 'image/webp') return file.buffer.subarray(0, 4).toString() === 'RIFF' && file.buffer.subarray(8, 12).toString() === 'WEBP';
  return false;
};

router.get('/cv', asyncHandler(async (req, res) => {
  const [[file]] = await db.query("SELECT url,original_name,mime_type FROM uploaded_files WHERE kind='cv' ORDER BY created_at DESC LIMIT 1");
  if (!file) return res.status(404).json({ success: false, message: 'No CV has been uploaded yet.' });
  res.json({ success: true, data: file });
}));

const handleUpload = asyncHandler(async (req, res) => {
  const kind = req.params.kind;
  if (!allowed[kind]) return res.status(400).json({ success: false, message: 'Unsupported upload type.' });
  if (!req.file) return res.status(400).json({ success: false, message: 'Choose a file to upload.' });
  if (!allowed[kind].has(req.file.mimetype)) return res.status(400).json({ success: false, message: `Invalid file type for ${kind.replace('_', ' ')}.` });
  if (!matchesSignature(req.file)) return res.status(400).json({ success: false, message: 'The uploaded file content does not match its declared type.' });
  const entityId = req.params.entityId ? Number(req.params.entityId) : null;
  if (kind !== 'cv' && !entityId) return res.status(400).json({ success: false, message: 'A related record is required.' });
  if (kind !== 'cv') {
    const table = kind === 'project_image' ? 'projects' : 'achievements';
    const [[entity]] = await db.query(`SELECT id FROM ${table} WHERE id=?`, [entityId]);
    if (!entity) return res.status(404).json({ success: false, message: 'The related record was not found.' });
  }
  const [previous] = kind === 'cv'
    ? await db.query("SELECT id,stored_name FROM uploaded_files WHERE kind='cv'")
    : kind === 'certificate'
      ? await db.execute("SELECT id,stored_name FROM uploaded_files WHERE kind='certificate' AND entity_id=?",[entityId])
      : [[]];
  await mkdir(uploadDirectory, { recursive: true });
  const storedName = `${kind}-${randomUUID()}${extensions[req.file.mimetype]}`;
  const storedPath = path.join(uploadDirectory, storedName);
  await writeFile(storedPath, req.file.buffer, { flag: 'wx' });
  const url = `/uploads/${storedName}`;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    if (kind === 'cv') await connection.execute("DELETE FROM uploaded_files WHERE kind='cv'");
    if (kind === 'certificate') await connection.execute("DELETE FROM uploaded_files WHERE kind='certificate' AND entity_id=?",[entityId]);
    const [result] = await connection.execute('INSERT INTO uploaded_files(kind,entity_id,original_name,stored_name,mime_type,size_bytes,url) VALUES(?,?,?,?,?,?,?)', [kind, entityId, req.file.originalname, storedName, req.file.mimetype, req.file.size, url]);
    if (kind === 'project_image') {
      await connection.execute('INSERT INTO project_images(project_id,url,alt_text) VALUES(?,?,?)', [entityId, url, req.body.alt_text || req.file.originalname]);
      await connection.execute('UPDATE projects SET thumbnail_url=COALESCE(thumbnail_url,?) WHERE id=?', [url, entityId]);
    }
    if (kind === 'certificate') await connection.execute('UPDATE achievements SET credential_url=? WHERE id=?', [url, entityId]);
    await connection.commit();
    await Promise.all(previous.map((file)=>rm(path.join(uploadDirectory,file.stored_name),{force:true}).catch(()=>{})));
    res.status(201).json({ success: true, data: { id: result.insertId, kind, url, original_name: req.file.originalname } });
  } catch (error) {
    await connection.rollback();
    await rm(storedPath, { force: true });
    throw error;
  } finally {
    connection.release();
  }
});
router.post('/:kind', requireAuth, receive.single('file'), handleUpload);
router.post('/:kind/:entityId', requireAuth, receive.single('file'), handleUpload);

export default router;
