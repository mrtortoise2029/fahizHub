import { Router } from "express";
import { z } from "zod";
import { db } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { removeEntityUploads } from "../services/uploadCleanup.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const catalogTable = (type) =>
  type === "achievements"
    ? "achievements"
    : type === "services"
      ? "services"
      : null;
const credentialUrl = z.union([
  z.url(),
  z.string().regex(/^\/uploads\/[a-zA-Z0-9._-]+$/),
  z.literal(""),
]);
const schedule = {
  publish_at: z.string().default(""),
  expires_at: z.string().default(""),
};
const achievement = z.object({
  type: z.enum([
    "achievement",
    "certification",
    "award",
    "workshop",
    "competition",
    "leadership",
    "event",
  ]),
  title: z.string().min(2).max(255),
  issuer: z.string().max(190).default(""),
  description: z.string().max(5000).default(""),
  event_date: z.string().default(""),
  credential_url: credentialUrl.default(""),
  is_published: z.boolean().default(false),
  ...schedule,
});
const service = z.object({
  title: z.string().min(2).max(190),
  description: z.string().min(10).max(5000),
  technologies: z.string().default(""),
  process: z.string().max(5000).default(""),
  availability: z.string().max(190).default(""),
  is_published: z.boolean().default(false),
  ...schedule,
});
const technologyJson = (value) =>
  JSON.stringify(
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

router.get(
  "/achievements",
  asyncHandler(async (req, res) => {
    const [rows] = await db.query(
      "SELECT * FROM achievements WHERE is_published=1 AND (publish_at IS NULL OR publish_at<=UTC_TIMESTAMP()) AND (expires_at IS NULL OR expires_at>UTC_TIMESTAMP()) ORDER BY event_date DESC,created_at DESC",
    );
    res.json({ success: true, data: rows });
  }),
);
router.get(
  "/services",
  asyncHandler(async (req, res) => {
    const [rows] = await db.query(
      "SELECT * FROM services WHERE is_published=1 AND (publish_at IS NULL OR publish_at<=UTC_TIMESTAMP()) AND (expires_at IS NULL OR expires_at>UTC_TIMESTAMP()) ORDER BY display_order,created_at",
    );
    res.json({ success: true, data: rows });
  }),
);
router.get(
  "/admin/:type",
  requireAuth,
  asyncHandler(async (req, res) => {
    const table = catalogTable(req.params.type);
    if (!table)
      return res
        .status(404)
        .json({ success: false, message: "Catalog not found." });
    const [rows] = await db.query(
      `SELECT * FROM ${table} ORDER BY created_at DESC`,
    );
    res.json({ success: true, data: rows });
  }),
);

router.post(
  "/achievements",
  requireAuth,
  validate(achievement),
  asyncHandler(async (req, res) => {
    const a = req.validated;
    const [r] = await db.execute(
      "INSERT INTO achievements(type,title,issuer,description,event_date,credential_url,is_published,publish_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?)",
      [
        a.type,
        a.title,
        a.issuer,
        a.description,
        a.event_date || null,
        a.credential_url || null,
        a.is_published,
        a.publish_at || null,
        a.expires_at || null,
      ],
    );
    res.status(201).json({ success: true, data: { id: r.insertId, ...a } });
  }),
);
router.put(
  "/achievements/:id",
  requireAuth,
  validate(achievement),
  asyncHandler(async (req, res) => {
    const a = req.validated;
    const [result] = await db.execute(
      "UPDATE achievements SET type=?,title=?,issuer=?,description=?,event_date=?,credential_url=?,is_published=?,publish_at=?,expires_at=? WHERE id=?",
      [
        a.type,
        a.title,
        a.issuer,
        a.description,
        a.event_date || null,
        a.credential_url || null,
        a.is_published,
        a.publish_at || null,
        a.expires_at || null,
        req.params.id,
      ],
    );
    if (!result.affectedRows)
      return res
        .status(404)
        .json({ success: false, message: "Achievement not found." });
    res.json({ success: true });
  }),
);
router.post(
  "/services",
  requireAuth,
  validate(service),
  asyncHandler(async (req, res) => {
    const s = req.validated;
    const [r] = await db.execute(
      "INSERT INTO services(title,description,technologies,process,availability,is_published,publish_at,expires_at) VALUES(?,?,?,?,?,?,?,?)",
      [
        s.title,
        s.description,
        technologyJson(s.technologies),
        s.process,
        s.availability,
        s.is_published,
        s.publish_at || null,
        s.expires_at || null,
      ],
    );
    res.status(201).json({ success: true, data: { id: r.insertId, ...s } });
  }),
);
router.put(
  "/services/:id",
  requireAuth,
  validate(service),
  asyncHandler(async (req, res) => {
    const s = req.validated;
    const [result] = await db.execute(
      "UPDATE services SET title=?,description=?,technologies=?,process=?,availability=?,is_published=?,publish_at=?,expires_at=? WHERE id=?",
      [
        s.title,
        s.description,
        technologyJson(s.technologies),
        s.process,
        s.availability,
        s.is_published,
        s.publish_at || null,
        s.expires_at || null,
        req.params.id,
      ],
    );
    if (!result.affectedRows)
      return res
        .status(404)
        .json({ success: false, message: "Service not found." });
    res.json({ success: true });
  }),
);
router.delete(
  "/:type/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const table = catalogTable(req.params.type);
    if (!table)
      return res
        .status(404)
        .json({ success: false, message: "Catalog not found." });
    const [result] = await db.execute(`DELETE FROM ${table} WHERE id=?`, [
      req.params.id,
    ]);
    if (!result.affectedRows)
      return res
        .status(404)
        .json({ success: false, message: "Catalog item not found." });
    if (table === "achievements")
      await removeEntityUploads("certificate", req.params.id);
    res.status(204).end();
  }),
);

export default router;
