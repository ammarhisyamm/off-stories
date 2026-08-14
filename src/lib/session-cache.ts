import { getSessionUser } from "@/lib/auth.functions";

type SessionResult = Awaited<ReturnType<typeof getSessionUser>>;

let cachedPromise: Promise<SessionResult> | null = null;

export function getCachedSessionUser(): Promise<SessionResult> {
  if (!cachedPromise) {
    cachedPromise = getSessionUser().catch((error) => {
      cachedPromise = null;
      throw error;
    });
  }
  return cachedPromise;
}

export function clearSessionCache() {
  cachedPromise = null;
}
