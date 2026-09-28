import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config/database.js";
import { env } from "../config/env.js";
import { randomUUID } from "node:crypto";
import {
  decryptSecret,
  verifyTwoFactor,
} from "../services/twoFactorService.js";
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 2 * 60 * 60 * 1000,
  path: "/",
};
export async function login(req, res) {
  const { email, password, otp } = req.validated;
  const [rows] = await db.execute(
    "SELECT id,name,email,password_hash,role,two_factor_secret,two_factor_enabled FROM users WHERE email = ? AND is_active = 1 LIMIT 1",
    [email],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password." });
  if (
    user.two_factor_enabled &&
    (!otp || !(await verifyTwoFactor(otp, decryptSecret(user.two_factor_secret))))
  )
    return res
      .status(401)
      .json({
        success: false,
        code: "OTP_REQUIRED",
        message: otp
          ? "Invalid authentication code."
          : "Enter your authentication code.",
      });
  const sid = randomUUID();
  const safe = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    sid,
  };
  await db.execute(
    "INSERT INTO user_sessions(id,user_id,user_agent,ip_address,last_seen_at,expires_at) VALUES(?,?,?,?,UTC_TIMESTAMP(),UTC_TIMESTAMP()+INTERVAL 2 HOUR)",
    [sid, user.id, req.get("user-agent") || "", req.ip],
  );
  const token = jwt.sign(safe, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  res
    .cookie("access_token", token, cookieOptions)
    .json({ success: true, data: safe });
}
export async function logout(req, res) {
  const token = req.cookies.access_token;
  try {
    const user = jwt.verify(token, env.JWT_SECRET);
    if (user.sid)
      await db.execute(
        "UPDATE user_sessions SET revoked_at=UTC_TIMESTAMP() WHERE id=?",
        [user.sid],
      );
  } catch (error) {
    void error;
  }
  res
    .clearCookie("access_token", { ...cookieOptions, maxAge: undefined })
    .json({ success: true, message: "Signed out." });
}
export function me(req, res) {
  res.json({ success: true, data: req.user });
}
