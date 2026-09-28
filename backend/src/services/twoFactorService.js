import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { env } from "../config/env.js";
const key = createHash("sha256").update(env.JWT_SECRET).digest();
export const createTwoFactor = async (email) => {
  const secret = generateSecret();
  return {
    secret,
    qr_code: await QRCode.toDataURL(
      generateURI({ issuer: "FahizHub", label: email, secret }),
    ),
  };
};
export const verifyTwoFactor = async (token, secret) =>
  (await verify({ token, secret })).valid;
export function encryptSecret(secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64");
}
export function decryptSecret(value) {
  const input = Buffer.from(value, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, input.subarray(0, 12));
  decipher.setAuthTag(input.subarray(12, 28));
  return Buffer.concat([
    decipher.update(input.subarray(28)),
    decipher.final(),
  ]).toString("utf8");
}
