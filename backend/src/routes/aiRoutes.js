import { Router } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await db.execute('SELECT id,title,context_enabled,created_at,updated_at FROM ai_conversations WHERE user_id=? ORDER BY updated_at DESC', [req.user.id]);
  res.json({ success: true, data: rows });
}));

router.post('/', validate(z.object({ title: z.string().min(1).max(255).default('New conversation'), context_enabled: z.boolean().default(false) })), asyncHandler(async (req, res) => {
  const [result] = await db.execute('INSERT INTO ai_conversations(user_id,title,context_enabled) VALUES(?,?,?)', [req.user.id, req.validated.title, req.validated.context_enabled]);
  res.status(201).json({ success: true, data: { id: result.insertId, ...req.validated } });
}));

router.get('/:id/messages', asyncHandler(async (req, res) => {
  const [rows] = await db.execute('SELECT m.id,m.role,m.content,m.created_at FROM ai_messages m JOIN ai_conversations c ON c.id=m.conversation_id WHERE c.id=? AND c.user_id=? ORDER BY m.created_at', [req.params.id, req.user.id]);
  res.json({ success: true, data: rows });
}));

router.post('/:id/messages', validate(z.object({ message: z.string().trim().min(1).max(12000) })), asyncHandler(async (req, res) => {
  if (!env.GEMINI_API_KEY) return res.status(503).json({ success: false, message: 'Add GEMINI_API_KEY to .env to enable Fahiz AI.' });
  const [[conversation]] = await db.execute('SELECT * FROM ai_conversations WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });

  await db.execute("INSERT INTO ai_messages(conversation_id,role,content) VALUES(?,'user',?)", [conversation.id, req.validated.message]);
  const [history] = await db.execute('SELECT role,content FROM ai_messages WHERE conversation_id=? ORDER BY created_at DESC LIMIT 20', [conversation.id]);
  let context = '';
  if (conversation.context_enabled) {
    const [tasks, projects] = await Promise.all([
      db.query("SELECT title,priority,due_at,status FROM tasks WHERE status!='completed' ORDER BY due_at LIMIT 10"),
      db.query('SELECT title,status FROM projects ORDER BY updated_at DESC LIMIT 10'),
    ]);
    context = `Personal context (use only when relevant): Active tasks: ${JSON.stringify(tasks[0])}. Projects: ${JSON.stringify(projects[0])}.`;
  }

  const transcript = history.reverse().map((message) => `${message.role === 'assistant' ? 'Assistant' : 'User'}: ${message.content}`).join('\n\n');
  const input = [context, 'Continue this conversation as Fahiz AI. Give a clear, useful response to the latest user message.', transcript].filter(Boolean).join('\n\n');
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({ model: env.GEMINI_MODEL, input }),
  });
  const body = await response.json();
  if (!response.ok) {
    const invalidKey = response.status === 400 && /api key not valid/i.test(body.error?.message || '');
    throw Object.assign(new Error(invalidKey ? 'The configured Gemini API key is invalid. Create a Gemini API key in Google AI Studio and update GEMINI_API_KEY in .env.' : body.error?.message || 'AI request failed.'), { status: response.status === 401 || response.status === 403 ? 401 : 502 });
  }

  const answer = body.steps?.filter((step) => step.type === 'model_output').flatMap((step) => step.content || []).filter((part) => part.type === 'text').map((part) => part.text).join('\n') || 'No response was generated.';
  await db.execute("INSERT INTO ai_messages(conversation_id,role,content) VALUES(?,'assistant',?)", [conversation.id, answer]);
  await db.execute('UPDATE ai_conversations SET updated_at=CURRENT_TIMESTAMP WHERE id=?', [conversation.id]);
  res.json({ success: true, data: { role: 'assistant', content: answer } });
}));

router.patch('/:id', validate(z.object({ title: z.string().min(1).max(255), context_enabled: z.boolean() })), asyncHandler(async (req, res) => {
  await db.execute('UPDATE ai_conversations SET title=?,context_enabled=? WHERE id=? AND user_id=?', [req.validated.title, req.validated.context_enabled, req.params.id, req.user.id]);
  res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await db.execute('DELETE FROM ai_conversations WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  res.status(204).end();
}));

export default router;
