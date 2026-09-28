import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { login, logout, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { db } from "../config/database.js";
import {
  createTwoFactor,
  decryptSecret,
  encryptSecret,
  verifyTwoFactor,
} from "../services/twoFactorService.js";
const router = Router();
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  otp: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
});
router.post(
  "/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  validate(loginSchema),
  asyncHandler(login),
);
router.post("/logout", asyncHandler(logout));
router.get("/me", requireAuth, me);
router.post(
  "/2fa/setup",
  requireAuth,
  asyncHandler(async (req, res) => {
    const value = await createTwoFactor(req.user.email);
    await db.execute(
      "UPDATE users SET two_factor_secret=?,two_factor_enabled=0 WHERE id=?",
      [encryptSecret(value.secret), req.user.id],
    );
    res.json({
      success: true,
      data: { qr_code: value.qr_code, manual_key: value.secret },
    });
  }),
);
router.post(
  "/2fa/enable",
  requireAuth,
  validate(z.object({ otp: z.string().regex(/^\d{6}$/) })),
  asyncHandler(async (req, res) => {
    const [[user]] = await db.execute(
      "SELECT two_factor_secret FROM users WHERE id=?",
      [req.user.id],
    );
    if (
      !user?.two_factor_secret ||
      !(await verifyTwoFactor(req.validated.otp, decryptSecret(user.two_factor_secret)))
    )
      return res
        .status(400)
        .json({ success: false, message: "Invalid authentication code." });
    await db.execute("UPDATE users SET two_factor_enabled=1 WHERE id=?", [
      req.user.id,
    ]);
    res.json({ success: true });
  }),
);
router.delete(
  "/2fa",
  requireAuth,
  validate(z.object({ otp: z.string().regex(/^\d{6}$/) })),
  asyncHandler(async (req, res) => {
    const [[user]] = await db.execute(
      "SELECT two_factor_secret FROM users WHERE id=?",
      [req.user.id],
    );
    if (
      !user?.two_factor_secret ||
      !(await verifyTwoFactor(req.validated.otp, decryptSecret(user.two_factor_secret)))
    )
      return res
        .status(400)
        .json({ success: false, message: "Invalid authentication code." });
    await db.execute(
      "UPDATE users SET two_factor_secret=NULL,two_factor_enabled=0 WHERE id=?",
      [req.user.id],
    );
    res.json({ success: true });
  }),
);
router.get(
  "/sessions",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [rows] = await db.execute(
      "SELECT id,user_agent,ip_address,last_seen_at,created_at FROM user_sessions WHERE user_id=? AND revoked_at IS NULL AND expires_at>UTC_TIMESTAMP() ORDER BY last_seen_at DESC",
      [req.user.id],
    );
    res.json({
      success: true,
      data: rows.map((row) => ({ ...row, current: row.id === req.user.sid })),
    });
  }),
);
router.delete(
  "/sessions/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    await db.execute(
      "UPDATE user_sessions SET revoked_at=UTC_TIMESTAMP() WHERE id=? AND user_id=?",
      [req.params.id, req.user.id],
    );
    res.status(204).end();
  }),
);
export default router;
