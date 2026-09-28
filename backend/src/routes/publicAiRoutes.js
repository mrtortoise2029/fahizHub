import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyTurnstile } from '../middleware/turnstile.js';
import { db } from '../config/database.js';
import { createHash, randomUUID } from 'node:crypto';

const router = Router();
const messageSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(2000) })).max(6).default([]),
});
const feedbackSchema=z.object({interaction_id:z.string().max(255),rating:z.enum(['helpful','not_helpful']),question:z.string().max(2000).default(''),comment:z.string().max(1000).default('')});

router.post('/chat', verifyTurnstile, validate(messageSchema), asyncHandler(async (req, res) => {
  if (!env.GEMINI_API_KEY) return res.status(503).json({ success: false, message: 'The AI assistant is temporarily unavailable.' });
  const visitorHash=createHash('sha256').update(`${req.ip}:${req.get('user-agent')||''}:${env.JWT_SECRET}`).digest('hex');
  await db.execute('INSERT INTO public_ai_usage(visitor_hash,request_date,request_count) VALUES(?,CURRENT_DATE,1) ON DUPLICATE KEY UPDATE request_count=request_count+1',[visitorHash]);
  const[[usage]]=await db.execute('SELECT request_count FROM public_ai_usage WHERE visitor_hash=? AND request_date=CURRENT_DATE',[visitorHash]);
  if(usage.request_count>env.PUBLIC_AI_DAILY_LIMIT)return res.status(429).json({success:false,message:'Daily public AI limit reached. Please try again tomorrow.'});
  const [projects]=await db.query(`SELECT title,slug,short_description FROM projects WHERE is_published=1 AND (publish_at IS NULL OR publish_at<=UTC_TIMESTAMP()) AND (expires_at IS NULL OR expires_at>UTC_TIMESTAMP()) ORDER BY display_order LIMIT 12`);
  const [skills]=await db.query('SELECT name FROM skills WHERE is_published=1 ORDER BY display_order LIMIT 30');
  const [[profile]]=await db.query('SELECT headline,short_bio,current_focus FROM profile LIMIT 1');
  const publicContext=JSON.stringify({profile:profile||{},skills:skills.map((item)=>item.name),projects:projects.map(({title,short_description})=>({title,description:short_description}))});
  const transcript = [...req.validated.history, { role: 'user', content: req.validated.message }]
    .map((item) => `${item.role === 'assistant' ? 'Assistant' : 'User'}: ${item.content}`)
    .join('\n\n');
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ model: env.GEMINI_MODEL, store: false, generation_config: { max_output_tokens: env.PUBLIC_AI_MAX_OUTPUT_TOKENS, thinking_level: 'low' }, input: `You are Fahiz AI, a helpful public assistant on Fahiz Ahmed's professional website. Only use the supplied public context for claims about Fahiz. If it does not contain an answer, say so and suggest the contact page. Never claim access to private data. Answer clearly and professionally.\n\nPublic context: ${publicContext}\n\nConversation:\n${transcript}` }),
  });
  const body = await response.json();
  if (!response.ok) throw Object.assign(new Error(body.error?.message || 'The AI assistant is unavailable.'), { status: 502 });
  const answer = body.steps?.filter((step) => step.type === 'model_output').flatMap((step) => step.content || []).filter((part) => part.type === 'text').map((part) => part.text).join('\n') || 'No response was generated.';
  const site=env.CLIENT_URL.replace(/\/$/,'');const normalized=req.validated.message.toLowerCase();const sources=[];
  if(normalized.includes('project'))projects.slice(0,4).forEach((project)=>sources.push({title:project.title,url:`${site}/projects/${project.slug}`}));
  if(normalized.includes('skill')||normalized.includes('technology'))sources.push({title:'Skills',url:`${site}/skills`});
  if(!sources.length)sources.push({title:'About Fahiz',url:`${site}/about`});
  res.json({ success: true, data: { role: 'assistant', content: answer, interaction_id: randomUUID(), sources } });
}));

router.post('/feedback',validate(feedbackSchema),asyncHandler(async(req,res)=>{const value=req.validated;await db.execute('INSERT INTO ai_feedback(interaction_id,rating,question,comment) VALUES(?,?,?,?)',[value.interaction_id,value.rating,value.question,value.comment||null]);res.status(201).json({success:true})}));

export default router;
