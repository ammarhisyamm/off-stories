import { getCookie, getRequest, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { getDatabase } from "@/lib/cloudflare.server";

const SESSION_COOKIE = "offstories_session";
const GOOGLE_STATE_COOKIE = "offstories_google_state";
const SESSION_DAYS = 30;
const PASSWORD_ITERATIONS = 100_000;

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
  return toBase64(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))),
  );
}

async function derivePassword(password: string, salt: Uint8Array<ArrayBuffer>) {
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
  for (let index = 0; index < candidate.byteLength; index += 1)
    difference |= candidate[index] ^ expected[index];
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

function googleStateCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: new URL(getRequest().url).protocol === "https:",
    path: "/",
    maxAge: 10 * 60,
  };
}

function googleConfig(): { GOOGLE_CLIENT_ID: string; GOOGLE_CLIENT_SECRET: string } {
  const runtimeEnv = env as unknown as {
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
  };
  if (!runtimeEnv.GOOGLE_CLIENT_ID || !runtimeEnv.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google sign-in is not configured yet.");
  }
  return {
    GOOGLE_CLIENT_ID: runtimeEnv.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: runtimeEnv.GOOGLE_CLIENT_SECRET,
  };
}

function googleCallbackUrl() {
  return new URL("/auth/callback", getRequest().url).toString();
}

export function createGoogleAuthorizationUrl() {
  const { GOOGLE_CLIENT_ID } = googleConfig();
  const state = toBase64(crypto.getRandomValues(new Uint8Array(32)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  setCookie(GOOGLE_STATE_COOKIE, state, googleStateCookieOptions());
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: googleCallbackUrl(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function completeGoogleAuthorization(code: string, state: string) {
  const expectedState = getCookie(GOOGLE_STATE_COOKIE);
  deleteCookie(GOOGLE_STATE_COOKIE, { path: "/" });
  if (!expectedState || expectedState !== state)
    throw new Error("Google sign-in session expired. Please try again.");

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = googleConfig();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: googleCallbackUrl(),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) throw new Error("Google sign-in could not be completed.");
  const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenPayload.access_token) throw new Error("Google did not return an access token.");

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${tokenPayload.access_token}` },
  });
  if (!profileResponse.ok) throw new Error("Google profile could not be verified.");
  const profile = (await profileResponse.json()) as {
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (!profile.email || !profile.email_verified)
    throw new Error("Google account email is not verified.");

  const database = getDatabase();
  const email = profile.email.toLowerCase();
  const existing = await database
    .prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string }>();
  if (existing) {
    await database
      .prepare(
        "UPDATE users SET display_name = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      )
      .bind(
        profile.name?.trim() || email.split("@")[0] || "You",
        profile.picture ?? null,
        existing.id,
      )
      .run();
    await createSession(existing.id);
    return { id: existing.id, email };
  }

  const userId = randomId();
  const workspaceId = randomId();
  await database.batch([
    database
      .prepare("INSERT INTO users (id, email, display_name, avatar_url) VALUES (?, ?, ?, ?)")
      .bind(
        userId,
        email,
        profile.name?.trim() || email.split("@")[0] || "You",
        profile.picture ?? null,
      ),
    database
      .prepare("INSERT INTO workspaces (id, name, owner_id) VALUES (?, ?, ?)")
      .bind(workspaceId, "My Wedding", userId),
    database
      .prepare("INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'owner')")
      .bind(workspaceId, userId),
  ]);
  await createSession(userId);
  return { id: userId, email };
}

export async function createSession(userId: string) {
  const token = toBase64(crypto.getRandomValues(new Uint8Array(32)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const db = getDatabase();
  // Enforce max concurrent sessions (3) — rotate oldest out
  const MAX_SESSIONS = 3;
  const sessions = await db
    .prepare("SELECT id FROM sessions WHERE user_id = ? ORDER BY expires_at ASC")
    .bind(userId)
    .all<{ id: string }>();
  if ((sessions.results?.length ?? 0) >= MAX_SESSIONS) {
    const toDelete = (sessions.results ?? []).slice(
      0,
      (sessions.results?.length ?? 0) - MAX_SESSIONS + 1,
    );
    for (const s of toDelete) {
      await db.prepare("DELETE FROM sessions WHERE id = ?").bind(s.id).run();
    }
  }
  await db
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
      `SELECT users.id, users.email, users.display_name, users.avatar_url, sessions.expires_at
       FROM sessions JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = ? AND sessions.expires_at > CURRENT_TIMESTAMP`,
    )
    .bind(await digest(token))
    .first<{
      id: string;
      email: string;
      display_name: string;
      avatar_url: string | null;
      expires_at: string;
    }>();
  if (!session) return null;
  // Idle timeout: if session is older than 7 days without activity, force re-login
  // We use expires_at sliding window — extend on activity if > 50% elapsed
  const expiresMs = new Date(session.expires_at).getTime();
  const now = Date.now();
  const totalMs = SESSION_DAYS * 24 * 60 * 60 * 1000;
  if (expiresMs - now < totalMs * 0.5) {
    const newExpires = new Date(now + totalMs).toISOString();
    await getDatabase()
      .prepare("UPDATE sessions SET expires_at = ? WHERE id = ?")
      .bind(newExpires, await digest(token))
      .run();
  }
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
    await getDatabase()
      .prepare("DELETE FROM sessions WHERE id = ?")
      .bind(await digest(token))
      .run();
  }
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export { randomId };
