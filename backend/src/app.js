import express from "express";
import { uploadDirectory } from "./config/storage.js";
import { db } from "./config/database.js";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import publicContentRoutes from "./routes/publicContentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import learningRoutes from "./routes/learningRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import adminContentRoutes from "./routes/adminContentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import publicAiRoutes from "./routes/publicAiRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminToolsRoutes from "./routes/adminToolsRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
export const app = express();
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  "/uploads",
  express.static(uploadDirectory, {
    fallthrough: false,
    maxAge: env.NODE_ENV === "production" ? "7d" : 0,
  }),
);
app.get("/api/health", (req, res) =>
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "fahizhub-api",
      uptime_seconds: Math.round(process.uptime()),
    },
  }),
);
app.get("/api/ready", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({
      success: true,
      data: { status: "ready", database: "connected" },
    });
  } catch {
    res
      .status(503)
      .json({ success: false, message: "Database is unavailable." });
  }
});
app.get("/sitemap.xml", async (req, res, next) => {
  try {
    const site = env.CLIENT_URL.replace(/\/$/, "");
    const staticPaths = [
      "",
      "about",
      "projects",
      "skills",
      "education",
      "experience",
      "achievements",
      "services",
      "resume",
      "meetings",
      "contact",
      "ai",
    ];
    const [projects] = await db.query(
      "SELECT slug,updated_at FROM projects WHERE is_published=1 ORDER BY updated_at DESC",
    );
    const entries = [
      ...staticPaths.map((path) => ({
        url: `${site}/${path}`,
        updated_at: null,
      })),
      ...projects.map((project) => ({
        url: `${site}/projects/${project.slug}`,
        updated_at: project.updated_at,
      })),
    ];
    const urls = entries
      .map(
        (entry) =>
          `  <url><loc>${entry.url}</loc>${entry.updated_at ? `<lastmod>${new Date(entry.updated_at).toISOString()}</lastmod>` : ""}</url>`,
      )
      .join("\n");
    res
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
  } catch (error) {
    next(error);
  }
});
app.get("/robots.txt", (req, res) => {
  const site = env.CLIENT_URL.replace(/\/$/, "");
  res
    .type("text/plain")
    .send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${site}/sitemap.xml\n`,
    );
});
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/content", publicContentRoutes);
app.use(
  "/api/messages",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  messageRoutes,
);
app.use("/api/tasks", taskRoutes);
app.use(
  "/api/meetings",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  meetingRoutes,
);
app.use("/api/student", studentRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/ai", aiRoutes);
app.use(
  "/api/public-ai",
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  publicAiRoutes,
);
app.use("/api/uploads", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/admin-content", adminContentRoutes);
app.use("/api/admin-tools", adminToolsRoutes);
app.use(
  "/api/analytics",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  analyticsRoutes,
);
app.use(notFound);
app.use(errorHandler);
