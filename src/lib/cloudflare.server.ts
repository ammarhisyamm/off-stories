import { env } from "cloudflare:workers";

export function getDatabase() {
  if (!env.DB) {
    throw new Error("Cloudflare D1 binding \"DB\" is not configured.");
  }

  return env.DB;
}

export function getDocumentsBucket() {
  if (!env.DOCUMENTS) {
    throw new Error('Cloudflare R2 binding "DOCUMENTS" is not configured.');
  }

  return env.DOCUMENTS;
}
