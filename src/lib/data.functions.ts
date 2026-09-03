import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireCloudflareAuth } from "@/integrations/cloudflare/auth-middleware";
import { getDatabase } from "@/lib/cloudflare.server";
import { assertSameOrigin, checkRateLimit } from "@/lib/security.server";
import type {
  Task,
  BudgetItem,
  Vendor,
  Guest,
  Milestone,
  Note,
  DocRef,
  RundownItem,
  SeserahanItem,
  CommandContact,
} from "@/lib/types";

export const KINDS = [
  "event",
  "tasks",
  "budget",
  "vendors",
  "guests",
  "milestones",
  "notes",
  "documents",
  "rundown",
  "seserahan",
  "command",
] as const;
export type DataKind = (typeof KINDS)[number];

export const emptyEvent = {
  name: "",
  type: "",
  date: "",
  location: "",
  guestEstimate: 0,
  budget: 0,
};

export type EventData = typeof emptyEvent & {
  savingsTarget?: number;
  savingsSaved?: number;
  savingsStartMonth?: string;
  savingsMonthlySplit?: number;
  adat?: string;
  brideName?: string;
  groomName?: string;
  ceremonyTypes?: string[];
  venueStatus?: "not_decided" | "shortlisted" | "booked";
  venueName?: string;
  budgetPayer?: "couple" | "bride_family" | "groom_family" | "shared" | "other";
  planningTeam?: string[];
};

export type WorkspaceData = {
  event: EventData;
  tasks: Task[];
  budget: BudgetItem[];
  vendors: Vendor[];
  guests: Guest[];
  milestones: Milestone[];
  notes: Note[];
  documents: DocRef[];
  rundown: RundownItem[];
  seserahan: SeserahanItem[];
  command: { contacts: CommandContact[] };
};

export function emptyWorkspaceData(): WorkspaceData {
  return {
    event: { ...emptyEvent },
    tasks: [],
    budget: [],
    vendors: [],
    guests: [],
    milestones: [],
    notes: [],
    documents: [],
    rundown: [],
    seserahan: [],
    command: { contacts: [] },
  };
}

export async function resolveWorkspace(userId: string): Promise<string | null> {
  const workspace = await getDatabase()
    .prepare("SELECT id FROM workspaces WHERE owner_id = ? ORDER BY created_at ASC LIMIT 1")
    .bind(userId)
    .first<{ id: string }>();
  return workspace?.id ?? null;
}

/** Workspace accessible to user as owner OR member (editor/viewer) */
export async function resolveAccessibleWorkspace(userId: string): Promise<string | null> {
  const owned = await resolveWorkspace(userId);
  if (owned) return owned;
  const member = await getDatabase()
    .prepare("SELECT workspace_id FROM workspace_members WHERE user_id = ? LIMIT 1")
    .bind(userId)
    .first<{ workspace_id: string }>();
  return member?.workspace_id ?? null;
}

export async function resolveMemberRole(
  workspaceId: string,
  userId: string,
): Promise<string | null> {
  const member = await getDatabase()
    .prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
    .bind(workspaceId, userId)
    .first<{ role: string }>();
  return member?.role ?? null;
}

const MAX_PAYLOAD_BYTES = 1_000_000; // 1MB per kind

function isSafeHttpUrlForData(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" ||
      (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1"))
    );
  } catch {
    return false;
  }
}

function validatePayload(kind: DataKind, payload: unknown): void {
  const json = JSON.stringify(payload);
  if (json.length > MAX_PAYLOAD_BYTES) {
    throw new Error(`Payload too large for ${kind} (max 1MB)`);
  }
  // Block prototype pollution keys at top level
  if (payload && typeof payload === "object") {
    const keys = Array.isArray(payload) ? [] : Object.keys(payload as Record<string, unknown>);
    if (keys.includes("__proto__") || keys.includes("constructor") || keys.includes("prototype")) {
      throw new Error("Invalid payload keys");
    }
  }
  // Per-kind: validate DocRef URLs to prevent stored javascript: XSS
  if (kind === "documents" && Array.isArray(payload)) {
    for (const doc of payload as Array<Record<string, unknown>>) {
      if (typeof doc.url === "string" && doc.url.length > 0) {
        // Allow https: and same-origin /api/documents/... links (relative handled client-side),
        // but reject javascript:, data:, etc.
        if (
          /^\s*javascript:/i.test(doc.url) ||
          /^\s*data:/i.test(doc.url) ||
          /^\s*vbscript:/i.test(doc.url)
        ) {
          throw new Error("Invalid document URL: only https:// and /api/documents/… are allowed.");
        }
        if (doc.url.startsWith("http://") || doc.url.startsWith("https://")) {
          if (!isSafeHttpUrlForData(doc.url)) throw new Error("Invalid document URL.");
        }
        // also cap URL length
        if (doc.url.length > 2048) throw new Error("Document URL too long.");
      }
    }
  }
}

export const loadWorkspaceData = createServerFn({ method: "GET" })
  .middleware([requireCloudflareAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const workspaceId = await resolveAccessibleWorkspace(userId);
    if (!workspaceId) {
      return {
        workspaceId: null as string | null,
        role: null as string | null,
        data: emptyWorkspaceData(),
      };
    }
    const role = await resolveMemberRole(workspaceId, userId);
    const rows = await getDatabase()
      .prepare("SELECT kind, payload FROM workspace_data WHERE workspace_id = ?")
      .bind(workspaceId)
      .all<{ kind: string; payload: string }>();
    const map = new Map<string, unknown>(
      (rows.results ?? []).map((row) => [row.kind, JSON.parse(row.payload)]),
    );
    const data = emptyWorkspaceData();
    for (const kind of KINDS) {
      const value = map.get(kind);
      if (value !== undefined) (data as Record<string, unknown>)[kind] = value;
    }
    return { workspaceId, role, data };
  });

export const saveWorkspaceData = createServerFn({ method: "POST" })
  .middleware([requireCloudflareAuth])
  .inputValidator((d) => z.object({ kind: z.enum(KINDS), payload: z.unknown() }).parse(d))
  .handler(async ({ data, context }) => {
    assertSameOrigin();
    checkRateLimit({ key: "save-workspace", limit: 60, windowMs: 60_000 });
    validatePayload(data.kind as DataKind, data.payload);
    const { userId } = context;
    const workspaceId = await resolveAccessibleWorkspace(userId);
    if (!workspaceId) throw new Error("No workspace found");
    const role = await resolveMemberRole(workspaceId, userId);
    if (role === "viewer") {
      throw new Error(
        "You have read-only access to this workspace. Ask the owner to change your role if you need to make edits.",
      );
    }
    await getDatabase()
      .prepare(
        `INSERT INTO workspace_data (workspace_id, kind, payload, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(workspace_id, kind) DO UPDATE SET payload = excluded.payload, updated_at = CURRENT_TIMESTAMP`,
      )
      .bind(workspaceId, data.kind, JSON.stringify(data.payload))
      .run();
    return { ok: true };
  });
