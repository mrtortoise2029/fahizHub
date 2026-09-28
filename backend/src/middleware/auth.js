import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { db } from "../config/database.js";
export async function requireAuth(req, res, next) {
  const token = req.cookies.access_token;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    if (req.user.sid) {
      const [[session]] = await db.execute(
        "SELECT id FROM user_sessions WHERE id=? AND user_id=? AND revoked_at IS NULL AND expires_at>UTC_TIMESTAMP()",
        [req.user.sid, req.user.id],
      );
      if (!session) throw new Error("Session revoked");
      await db.execute(
        "UPDATE user_sessions SET last_seen_at=UTC_TIMESTAMP() WHERE id=?",
        [req.user.sid],
      );
    }
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      res.on("finish", () => {
        if (res.statusCode < 400)
          db.execute(
            "INSERT INTO audit_logs(user_id,action,entity_type,metadata,ip_address) VALUES(?,?,?,?,?)",
            [
              req.user.id,
              `${req.method} ${req.baseUrl}${req.path}`,
              "api",
              JSON.stringify({ status: res.statusCode }),
              req.ip,
            ],
          ).catch(() => {});
      });
    }
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Your session is invalid or expired." });
  }
}
