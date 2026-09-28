import { Router } from "express";
import { z } from "zod";
import { db } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { DateTime } from "luxon";
import { verifyTurnstile } from "../middleware/turnstile.js";
import { sendAdminEmail, sendEmail } from "../services/emailService.js";
import { createCalendarEvent } from "../services/googleCalendarService.js";
const router = Router();
const booking = z
  .object({
    type: z.string().trim().min(2).max(120),
    name: z.string().trim().min(2).max(120),
    email: z.email(),
    message: z.string().max(3000).default(""),
    start_time: z.iso.datetime(),
    end_time: z.iso.datetime(),
    timezone: z.string().max(80).default("Asia/Dhaka"),
  })
  .refine((v) => new Date(v.end_time) > new Date(v.start_time), {
    message: "End time must be after start time.",
  });
router.get(
  "/slots",
  asyncHandler(async (req, res) => {
    const date = z.iso.date().safeParse(req.query.date);
    if (!date.success)
      return res
        .status(400)
        .json({ success: false, message: "Provide a valid date." });
    const [[unavailable]] = await db.execute(
      "SELECT COUNT(*) count FROM unavailable_dates WHERE date=?",
      [date.data],
    );
    if (unavailable.count) return res.json({ success: true, data: [] });
    const day = DateTime.fromISO(date.data).weekday % 7;
    const [availability] = await db.execute(
      "SELECT * FROM availability WHERE day_of_week=? AND is_active=1 ORDER BY start_time",
      [day],
    );
    const slots = [];
    for (const a of availability) {
      let cursor = DateTime.fromISO(`${date.data}T${a.start_time}`, {
        zone: a.timezone,
      });
      let end = DateTime.fromISO(`${date.data}T${a.end_time}`, {
        zone: a.timezone,
      });
      if (end <= cursor) end = end.plus({ days: 1 });
      while (cursor.plus({ hours: 1 }) <= end) {
        const finish = cursor.plus({ hours: 1 });
        const [[busy]] = await db.execute(
          "SELECT (SELECT COUNT(*) FROM meetings WHERE status IN('pending','confirmed') AND start_time_utc<? AND end_time_utc>?) + (SELECT COUNT(*) FROM blocked_slots WHERE start_time_utc<? AND end_time_utc>?) count",
          [
            finish.toUTC().toJSDate(),
            cursor.toUTC().toJSDate(),
            finish.toUTC().toJSDate(),
            cursor.toUTC().toJSDate(),
          ],
        );
        if (!busy.count && cursor > DateTime.now())
          slots.push({
            start: cursor.toUTC().toISO(),
            end: finish.toUTC().toISO(),
            label: cursor.toFormat("h:mm a"),
            timezone: a.timezone,
          });
        cursor = finish;
      }
    }
    res.json({ success: true, data: slots });
  }),
);
router.post(
  "/",
  verifyTurnstile,
  validate(booking),
  asyncHandler(async (req, res) => {
    const m = req.validated;
    if (new Date(m.start_time) <= new Date())
      return res
        .status(400)
        .json({ success: false, message: "Please choose a future time." });
    const local = DateTime.fromISO(m.start_time, { setZone: true }).setZone(
      m.timezone,
    );
    const day = local.weekday % 7;
    const [[unavailable]] = await db.execute(
      "SELECT COUNT(*) count FROM unavailable_dates WHERE date=?",
      [local.toISODate()],
    );
    if (unavailable.count)
      return res
        .status(400)
        .json({ success: false, message: "That date is unavailable." });
    const [availability] = await db.execute(
      "SELECT * FROM availability WHERE day_of_week=? AND is_active=1",
      [day],
    );
    const requestedEnd = local.plus({ hours: 1 });
    const allowed = availability.some((item) => {
      const opening = DateTime.fromISO(
        `${local.toISODate()}T${item.start_time}`,
        { zone: item.timezone },
      );
      let closing = DateTime.fromISO(`${local.toISODate()}T${item.end_time}`, {
        zone: item.timezone,
      });
      if (closing <= opening) closing = closing.plus({ days: 1 });
      return local >= opening && requestedEnd <= closing;
    });
    if (!allowed)
      return res.status(400).json({
        success: false,
        message: "That time is outside configured availability.",
      });
    const [[busy]] = await db.execute(
      "SELECT (SELECT COUNT(*) FROM meetings WHERE status IN('pending','confirmed') AND start_time_utc<? AND end_time_utc>?) + (SELECT COUNT(*) FROM blocked_slots WHERE start_time_utc<? AND end_time_utc>?) count",
      [
        new Date(m.end_time),
        new Date(m.start_time),
        new Date(m.end_time),
        new Date(m.start_time),
      ],
    );
    if (busy.count)
      return res.status(409).json({
        success: false,
        message: "That time was just booked. Please choose another.",
      });
    try {
      const [result] = await db.execute(
        "INSERT INTO meetings(type,name,email,message,start_time_utc,end_time_utc,timezone) VALUES (?,?,?,?,?,?,?)",
        [
          m.type,
          m.name,
          m.email,
          m.message,
          new Date(m.start_time),
          new Date(m.end_time),
          m.timezone,
        ],
      );
      await db.execute(
        "INSERT INTO notifications(type,title,body,entity_type,entity_id) VALUES ('meeting','New meeting request',?,'meeting',?)",
        [m.type, result.insertId],
      );
      await sendAdminEmail({
        subject: `New meeting request: ${m.type}`,
        text: `${m.name} (${m.email}) requested ${local.toFormat("DDD t ZZZZ")}.\n\n${m.message}`,
      });
      res.status(201).json({
        success: true,
        message: "Your meeting request has been submitted.",
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY")
        return res.status(409).json({
          success: false,
          message: "That time was just booked. Please choose another.",
        });
      throw error;
    }
  }),
);
router.get(
  "/availability",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [rows] = await db.query(
      "SELECT * FROM availability ORDER BY day_of_week,start_time",
    );
    res.json({ success: true, data: rows });
  }),
);
router.post(
  "/availability",
  requireAuth,
  validate(
    z
      .object({
        day_of_week: z.coerce.number().int().min(0).max(6),
        start_time: z.string().regex(/^\d{2}:\d{2}$/),
        end_time: z.string().regex(/^\d{2}:\d{2}$/),
        timezone: z.string().max(80),
      })
      .refine((v) => v.end_time !== v.start_time, {
        message: "Start and end time must be different.",
      }),
  ),
  asyncHandler(async (req, res) => {
    const a = req.validated;
    const [r] = await db.execute(
      "INSERT INTO availability(day_of_week,start_time,end_time,timezone) VALUES(?,?,?,?)",
      [a.day_of_week, a.start_time, a.end_time, a.timezone],
    );
    res.status(201).json({ success: true, data: { id: r.insertId, ...a } });
  }),
);
router.delete(
  "/availability/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    await db.execute("DELETE FROM availability WHERE id=?", [req.params.id]);
    res.status(204).end();
  }),
);
router.get(
  "/blocks",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [dates, slots] = await Promise.all([
      db.query("SELECT * FROM unavailable_dates ORDER BY date"),
      db.query("SELECT * FROM blocked_slots ORDER BY start_time_utc"),
    ]);
    res.json({ success: true, data: { dates: dates[0], slots: slots[0] } });
  }),
);
router.post(
  "/unavailable-dates",
  requireAuth,
  validate(
    z.object({ date: z.iso.date(), reason: z.string().max(255).default("") }),
  ),
  asyncHandler(async (req, res) => {
    const [r] = await db.execute(
      "INSERT INTO unavailable_dates(date,reason) VALUES(?,?) ON DUPLICATE KEY UPDATE reason=VALUES(reason)",
      [req.validated.date, req.validated.reason],
    );
    res
      .status(201)
      .json({ success: true, data: { id: r.insertId, ...req.validated } });
  }),
);
router.delete(
  "/unavailable-dates/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    await db.execute("DELETE FROM unavailable_dates WHERE id=?", [
      req.params.id,
    ]);
    res.status(204).end();
  }),
);
router.post(
  "/blocked-slots",
  requireAuth,
  validate(
    z
      .object({
        start_time: z.iso.datetime(),
        end_time: z.iso.datetime(),
        reason: z.string().max(255).default(""),
      })
      .refine((v) => new Date(v.end_time) > new Date(v.start_time), {
        message: "End time must be after start time.",
      }),
  ),
  asyncHandler(async (req, res) => {
    const [r] = await db.execute(
      "INSERT INTO blocked_slots(start_time_utc,end_time_utc,reason) VALUES(?,?,?)",
      [
        new Date(req.validated.start_time),
        new Date(req.validated.end_time),
        req.validated.reason,
      ],
    );
    res.status(201).json({ success: true, data: { id: r.insertId } });
  }),
);
router.delete(
  "/blocked-slots/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    await db.execute("DELETE FROM blocked_slots WHERE id=?", [req.params.id]);
    res.status(204).end();
  }),
);
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [rows] = await db.query(
      "SELECT * FROM meetings ORDER BY start_time_utc DESC",
    );
    res.json({ success: true, data: rows });
  }),
);
router.patch(
  "/:id",
  requireAuth,
  validate(
    z.object({
      status: z.enum([
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
      ]),
      admin_notes: z.string().max(5000).default(""),
    }),
  ),
  asyncHandler(async (req, res) => {
    const [[meeting]] = await db.execute("SELECT * FROM meetings WHERE id=?", [
      req.params.id,
    ]);
    if (!meeting)
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found." });
    await db.execute("UPDATE meetings SET status=?,admin_notes=? WHERE id=?", [
      req.validated.status,
      req.validated.admin_notes,
      req.params.id,
    ]);
    let calendar_synced = false;
    if (req.validated.status === "confirmed") {
      try {
        calendar_synced = await createCalendarEvent(meeting);
      } catch (error) {
        console.error("Calendar sync failed:", error.message);
      }
    }
    if (["confirmed", "cancelled", "rejected"].includes(req.validated.status))
      await sendEmail({
        to: meeting.email,
        subject: `Meeting ${req.validated.status}: ${meeting.type}`,
        text: `Hello ${meeting.name},\n\nYour meeting request for ${new Date(meeting.start_time_utc).toLocaleString()} has been ${req.validated.status}.\n\n${req.validated.admin_notes || ""}`,
      });
    res.json({ success: true, data: { calendar_synced } });
  }),
);
export default router;
