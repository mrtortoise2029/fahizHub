import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { login, logout, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router=Router();const loginSchema=z.object({email:z.email(),password:z.string().min(8).max(128)});
router.post('/login',rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-8',legacyHeaders:false}),validate(loginSchema),asyncHandler(login));router.post('/logout',logout);router.get('/me',requireAuth,me);export default router;
