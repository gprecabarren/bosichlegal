import "server-only";

import { cookies } from "next/headers";
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const cookieName = "bosich_admin_session";
const oneDay = 60 * 60 * 24;

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") return "dev-only-session-secret";
  throw new Error("ADMIN_SESSION_SECRET no está configurado.");
}

export function hashPassword(password: string) {
  const iterations = 210000;
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
}

export function verifyPassword(password: string) {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) return false;

  const [algorithm, iterations, salt, expected] = stored.split("$");
  if (algorithm !== "pbkdf2_sha256" || !iterations || !salt || !expected) return false;

  const actual = pbkdf2Sync(password, salt, Number(iterations), 32, "sha256");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

export async function createSession(username: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + oneDay;
  const value = `${username}.${expiresAt}`;
  const token = `${value}.${sign(value)}`;
  const cookieStore = await cookies();

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // The admin also uploads images through /api/admin, so the session must be
    // available to that protected route as well.
    path: "/",
    maxAge: oneDay,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const expiredCookie = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  };
  cookieStore.set(cookieName, "", { ...expiredCookie, path: "/" });
  // Clean up sessions issued before uploads were moved under /api/admin.
  cookieStore.set(cookieName, "", { ...expiredCookie, path: "/admin" });
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [username, expiresAt, signature] = parts;
  if (username !== process.env.ADMIN_USERNAME) return false;
  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;

  const value = `${username}.${expiresAt}`;
  const actual = Buffer.from(sign(value), "hex");
  const expected = Buffer.from(signature, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("No autorizado");
  }
}
