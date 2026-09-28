import { Router } from "express";
import { rm, stat } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { z } from "zod";
import { db } from "../config/database.js";
import { uploadDirectory } from "../config/storage.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../services/emailService.js";

const router = Router();
router.use(requireAuth);
router.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const [
      media,
      emails,
      versions,
      audits,
      backups,
      analytics,
      feedback,
      sessions,
    ] = await Promise.all([
      db.query(
        "SELECT * FROM uploaded_files ORDER BY created_at DESC LIMIT 100",
      ),
      db.query("SELECT * FROM email_log ORDER BY created_at DESC LIMIT 100"),
      db.query(
        "SELECT id,entity_type,entity_id,change_note,created_at FROM content_versions ORDER BY created_at DESC LIMIT 50",
      ),
      db.query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100"),
      db.query("SELECT * FROM backup_runs ORDER BY created_at DESC LIMIT 30"),
      db.query(
        "SELECT DATE(created_at) day,event_type,COUNT(*) count FROM analytics_events WHERE created_at>=CURRENT_DATE-INTERVAL 30 DAY GROUP BY DATE(created_at),event_type ORDER BY day",
      ),
      db.query("SELECT rating,COUNT(*) count FROM ai_feedback GROUP BY rating"),
      db.execute(
        "SELECT id,user_agent,ip_address,last_seen_at,created_at FROM user_sessions WHERE user_id=? AND revoked_at IS NULL AND expires_at>UTC_TIMESTAMP() ORDER BY last_seen_at DESC",
        [req.user.id],
      ),
    ]);
    res.json({
      success: true,
      data: {
        media: media[0],
        emails: emails[0],
        versions: versions[0],
        audits: audits[0],
        backups: backups[0],
        analytics: analytics[0],
        feedback: feedback[0],
        sessions: sessions[0].map((row) => ({
          ...row,
          current: row.id === req.user.sid,
        })),
      },
    });
  }),
);
router.get(
  "/search",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || "").trim();
    if (q.length < 2) return res.json({ success: true, data: [] });
    const like = `%${q}%`;
    const [projects, messages, tasks, meetings] = await Promise.all([
      db.execute(
        "SELECT id,title label,'project' type FROM projects WHERE title LIKE ? LIMIT 10",
        [like],
      ),
      db.execute(
        "SELECT id,subject label,'message' type FROM messages WHERE subject LIKE ? OR name LIKE ? LIMIT 10",
        [like, like],
      ),
      db.execute(
        "SELECT id,title label,'task' type FROM tasks WHERE title LIKE ? LIMIT 10",
        [like],
      ),
      db.execute(
        "SELECT id,CONCAT(type,' — ',name) label,'meeting' type FROM meetings WHERE type LIKE ? OR name LIKE ? LIMIT 10",
        [like, like],
      ),
    ]);
    res.json({
      success: true,
      data: [...projects[0], ...messages[0], ...tasks[0], ...meetings[0]],
    });
  }),
);
router.patch(
  "/bulk-publish",
  validate(
    z.object({
      type: z.enum(["projects", "achievements", "services"]),
      ids: z.array(z.coerce.number().positive()).min(1).max(100),
      is_published: z.boolean(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const { type, ids, is_published } = req.validated;
    await db.query(`UPDATE ${type} SET is_published=? WHERE id IN (?)`, [
      is_published,
      ids,
    ]);
    res.json({ success: true });
  }),
);
router.delete(
  "/media/:id",
  asyncHandler(async (req, res) => {
    const [[file]] = await db.execute(
      "SELECT * FROM uploaded_files WHERE id=?",
      [req.params.id],
    );
    if (!file)
      return res
        .status(404)
        .json({ success: false, message: "File not found." });
    await db.execute("DELETE FROM project_images WHERE url=?", [file.url]);
    await db.execute("DELETE FROM uploaded_files WHERE id=?", [file.id]);
    await rm(path.join(uploadDirectory, file.stored_name), { force: true });
    res.status(204).end();
  }),
);
router.post(
  "/emails/:id/retry",
  asyncHandler(async (req, res) => {
    const [[email]] = await db.execute("SELECT * FROM email_log WHERE id=?", [
      req.params.id,
    ]);
    if (!email)
      return res
        .status(404)
        .json({ success: false, message: "Email record not found." });
    await sendEmail({
      to: email.recipient,
      subject: email.subject,
      text: email.body || "This is a retried notification from FahizHub.",
    });
    res.json({ success: true });
  }),
);
router.post(
  "/backups",
  asyncHandler(async (req, res) => {
    const filename = `fahizhub-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
    const [result] = await db.execute(
      "INSERT INTO backup_runs(filename,status) VALUES(?,'running')",
      [filename],
    );
    const child = spawn(
      process.execPath,
      [new URL("../../scripts/backupDatabase.js", import.meta.url).pathname],
      { stdio: "ignore", env: { ...process.env, BACKUP_FILENAME: filename } },
    );
    child.on("close", async (code) => {
      let size = null;
      try {
        const info = await stat(
          new URL(`../../../backups/${filename}`, import.meta.url),
        );
        size = info.size;
      } catch (error) {
        void error;
      }
      await db
        .execute(
          "UPDATE backup_runs SET status=?,size_bytes=?,error_message=?,completed_at=UTC_TIMESTAMP() WHERE id=?",
          [
            code === 0 ? "completed" : "failed",
            size,
            code === 0 ? null : `Backup process exited with code ${code}`,
            result.insertId,
          ],
        )
        .catch(() => {});
    });
    res
      .status(202)
      .json({
        success: true,
        data: { id: result.insertId, filename, status: "running" },
      });
  }),
);
router.post(
  "/versions/:id/restore",
  asyncHandler(async (req, res) => {
    const [[version]] = await db.execute(
      "SELECT * FROM content_versions WHERE id=?",
      [req.params.id],
    );
    if (!version || version.entity_type !== "project")
      return res
        .status(404)
        .json({ success: false, message: "Restorable version not found." });
    const snapshot =
      typeof version.snapshot === "string"
        ? JSON.parse(version.snapshot)
        : version.snapshot;
    const allowed = [
      "title",
      "slug",
      "subtitle",
      "short_description",
      "overview",
      "problem",
      "solution",
      "features",
      "challenges",
      "lessons_learned",
      "contribution",
      "architecture",
      "outcomes",
      "category",
      "status",
      "github_url",
      "live_url",
      "video_url",
      "is_published",
      "publish_at",
      "expires_at",
    ];
    const entries = allowed.filter((key) => Object.hasOwn(snapshot, key));
    await db.query(
      `UPDATE projects SET ${entries.map((key) => `${key}=?`).join(",")} WHERE id=?`,
      [
        ...entries.map((key) =>
          typeof snapshot[key] === "object"
            ? JSON.stringify(snapshot[key])
            : snapshot[key],
        ),
        version.entity_id,
      ],
    );
    res.json({ success: true });
  }),
);
export default router;
