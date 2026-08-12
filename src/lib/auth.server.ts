import { getCookie, getRequest, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { getDatabase } from "@/lib/cloudflare.server";

const SESSION_COOKIE = "offstories_session";
const SESSION_DAYS = 30;
const PASSWORD_ITERATIONS = 250_000;

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

function randomId() {
  return crypto.randomUUID();
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function digest(value: string) {
  return toBase64(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

async function derivePassword(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PASSWORD_ITERATIONS },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await derivePassword(password, salt);
  return `pbkdf2$${PASSWORD_ITERATIONS}$${toBase64(salt)}$${toBase64(derived)}`;
}

export async function verifyPassword(password: string, encoded: string | null) {
  if (!encoded) return false;
  const [algorithm, iterations, saltValue, hashValue] = encoded.split("$");
  if (algorithm !== "pbkdf2" || !iterations || !saltValue || !hashValue) return false;
  const count = Number(iterations);
  if (!Number.isSafeInteger(count) || count < 100_000) return false;
  const salt = fromBase64(saltValue);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: count },
    key,
    256,
  );
  const candidate = new Uint8Array(bits);
  const expected = fromBase64(hashValue);
  if (candidate.byteLength !== expected.byteLength) return false;
  let difference = 0;
  for (let index = 0; index < candidate.byteLength; index += 1) difference |= candidate[index] ^ expected[index];
  return difference === 0;
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: new URL(getRequest().url).protocol === "https:",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export async function createSession(userId: string) {
  const token = toBase64(crypto.getRandomValues(new Uint8Array(32))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await getDatabase()
    .prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(await digest(token), userId, expiresAt)
    .run();
  setCookie(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;
  const session = await getDatabase()
    .prepare(
      `SELECT users.id, users.email, users.display_name, users.avatar_url
       FROM sessions JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = ? AND sessions.expires_at > CURRENT_TIMESTAMP`,
    )
    .bind(await digest(token))
    .first<{ id: string; email: string; display_name: string; avatar_url: string | null }>();
  if (!session) return null;
  return {
    id: session.id,
    email: session.email,
    displayName: session.display_name,
    avatarUrl: session.avatar_url,
  };
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function destroySession() {
  const token = getCookie(SESSION_COOKIE);
  if (token) {
    await getDatabase().prepare("DELETE FROM sessions WHERE id = ?").bind(await digest(token)).run();
  }
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export { randomId };
