import { db } from "../config/database.js";
import { env } from "../config/env.js";
import { decryptSecret, encryptSecret } from "./twoFactorService.js";
export const googleCalendarConfigured = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI,
);
export async function saveGoogleRefreshToken(token) {
  await db.execute(
    "INSERT INTO app_settings(setting_key,setting_value) VALUES('google_calendar_refresh_token',?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)",
    [encryptSecret(token)],
  );
}
export async function hasGoogleCalendar() {
  const [[row]] = await db.execute(
    "SELECT setting_value FROM app_settings WHERE setting_key='google_calendar_refresh_token'",
  );
  return Boolean(row?.setting_value);
}
async function accessToken() {
  const [[row]] = await db.execute(
    "SELECT setting_value FROM app_settings WHERE setting_key='google_calendar_refresh_token'",
  );
  if (!row?.setting_value) return null;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: decryptSecret(row.setting_value),
      grant_type: "refresh_token",
    }),
  });
  const body = await response.json();
  if (!response.ok)
    throw new Error(
      body.error_description || "Unable to refresh Google Calendar access.",
    );
  return body.access_token;
}
export async function createCalendarEvent(meeting) {
  const token = await accessToken();
  if (!token) return false;
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: meeting.type,
        description: meeting.message || "",
        start: {
          dateTime: new Date(meeting.start_time_utc).toISOString(),
          timeZone: meeting.timezone,
        },
        end: {
          dateTime: new Date(meeting.end_time_utc).toISOString(),
          timeZone: meeting.timezone,
        },
        attendees: [{ email: meeting.email, displayName: meeting.name }],
      }),
    },
  );
  if (!response.ok) throw new Error("Google Calendar event creation failed.");
  return true;
}
