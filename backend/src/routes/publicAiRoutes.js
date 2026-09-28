import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyTurnstile } from '../middleware/turnstile.js';
import { db } from '../config/database.js';
import { createHash } from 'node:crypto';

const router = Router();
const messageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(2000) })).max(6).default([]),
});

router.post('/chat', verifyTurnstile, validate(messageSchema), asyncHandler(async (req, res) => {
  if (!env.GEMINI_API_KEY) return res.status(503).json({ success: false, message: 'The AI assistant is temporarily unavailable.' });
  const visitorHash=createHash('sha256').update(`${req.ip}:${req.get('user-agent')||''}:${env.JWT_SECRET}`).digest('hex');
  await db.execute('INSERT INTO public_ai_usage(visitor_hash,request_date,request_count) VALUES(?,CURRENT_DATE,1) ON DUPLICATE KEY UPDATE request_count=request_count+1',[visitorHash]);
  const[[usage]]=await db.execute('SELECT request_count FROM public_ai_usage WHERE visitor_hash=? AND request_date=CURRENT_DATE',[visitorHash]);
  if(usage.request_count>env.PUBLIC_AI_DAILY_LIMIT)return res.status(429).json({success:false,message:'Daily public AI limit reached. Please try again tomorrow.'});
  const transcript = [...req.validated.history, { role: 'user', content: req.validated.message }]
    .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${item.content}`)
    .join('\n\n');
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({ model: env.GEMINI_MODEL, input: `You are Fahiz AI, a helpful public assistant on Fahiz Ahmed's professional website. Do not claim access to private data. Answer clearly and professionally.\n\n${transcript}` }),
  });
  const body = await response.json();
  if (!response.ok) throw Object.assign(new Error(body.error?.message || 'The AI assistant is unavailable.'), { status: 502 });
  const answer = body.steps?.filter((step) => step.type === 'model_output').flatMap((step) => step.content || []).filter((part) => part.type === 'text').map((part) => part.text).join('\n') || 'No response was generated.';
  res.json({ success: true, data: { role: 'assistant', content: answer } });
}));

export default router;
