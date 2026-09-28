import { Router } from 'express';
import { z } from 'zod';
import { login, logout, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router=Router();const loginSchema=z.object({email:z.email(),password:z.string().min(8).max(128)});
router.post('/login',validate(loginSchema),asyncHandler(login));router.post('/logout',logout);router.get('/me',requireAuth,me);export default router;

