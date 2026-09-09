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
  venueType?: string;
  budgetPayer?: "couple" | "bride_family" | "groom_family" | "shared" | "other";
  planningTeam?: string[];
  // research-based extensions
  akadDate?: string;
  resepsiDate?: string;
  timeSlot?: string;
  religion?: string;
  guestsBride?: number;
  guestsGroom?: number;
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

// ── Per-kind Zod schemas (bounded, prevents storage DoS / injection) ──
const MAX_ARRAY = 2000;
const MAX_STR = 500;
const shortStr = z.string().max(MAX_STR);
const longStr = z.string().max(5000);
const idStr = z.string().max(120);

const eventSchema = z
  .object({
    name: z.string().max(200).optional(),
    type: z.string().max(100).optional(),
    date: z.string().max(30).optional(),
    location: z.string().max(300).optional(),
    guestEstimate: z.number().min(0).max(100000).optional(),
    budget: z.number().min(0).max(1e13).optional(),
    savingsTarget: z.number().min(0).max(1e13).optional(),
    savingsSaved: z.number().min(0).max(1e13).optional(),
    savingsStartMonth: z.string().max(20).optional(),
    savingsMonthlySplit: z.number().min(0).max(1).optional(),
    adat: z.string().max(100).optional(),
    brideName: z.string().max(100).optional(),
    groomName: z.string().max(100).optional(),
    ceremonyTypes: z.array(z.string().max(50)).max(20).optional(),
    venueStatus: z.enum(["not_decided", "shortlisted", "booked"]).optional(),
    venueName: z.string().max(200).optional(),
    budgetPayer: z.enum(["couple", "bride_family", "groom_family", "shared", "other"]).optional(),
    planningTeam: z.array(z.string().max(100)).max(50).optional(),
  })
  .passthrough();

const docRefSchema = z.object({
  id: idStr,
  title: z.string().max(300),
  kind: z.enum(["Contract", "Invoice", "Moodboard", "Reference", "Rundown", "Floor plan"]),
  vendor: z.string().max(200).optional(),
  url: z.string().max(2048),
  filePath: z.string().max(500).optional(),
  mimeType: z.string().max(200).optional(),
  size: z
    .number()
    .min(0)
    .max(50 * 1024 * 1024)
    .optional(),
  addedAt: z.string().max(50).optional(),
});

const taskSchema = z
  .object({
    id: idStr,
    title: z.string().max(300),
    category: z.string().max(100).optional(),
    due: z.string().max(30).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    assignee: z.string().max(100).optional(),
    link: z.string().max(2048).optional(),
  })
  .passthrough();

const budgetSchema = z
  .object({
    id: idStr,
    category: z.string().max(100),
    vendor: z.string().max(200).optional(),
    amount: z.number().min(0).max(1e13),
    paid: z.number().min(0).max(1e13).optional(),
    committed: z.number().min(0).max(1e13).optional(),
    status: z.enum(["paid", "partial", "due", "planned"]).optional(),
    dueDate: z.string().max(30).optional(),
    payer: z.enum(["couple", "bride_family", "groom_family", "shared", "other"]).optional(),
    payments: z
      .array(
        z
          .object({
            id: idStr,
            amount: z.number().min(0).max(1e13),
            date: z.string().max(30),
            payer: z.enum(["couple", "bride_family", "groom_family", "shared", "other"]).optional(),
            note: z.string().max(500).optional(),
          })
          .passthrough(),
      )
      .max(200)
      .optional(),
  })
  .passthrough();

const vendorSchema = z
  .object({
    id: idStr,
    name: z.string().max(200),
    category: z.string().max(100).optional(),
    contact: z.string().max(200).optional(),
    phone: z.string().max(30).optional(),
    packageName: z.string().max(200).optional(),
    quoted: z.number().min(0).max(1e13).optional(),
    final: z.number().min(0).max(1e13).optional(),
    status: z.enum(["researching", "shortlisted", "booked", "cancelled"]).optional(),
  })
  .passthrough();

const guestSchema = z
  .object({
    id: idStr,
    name: z.string().max(200),
    side: z.enum(["Bride", "Groom", "Both"]).optional(),
    pax: z.number().min(0).max(100).optional(),
    invited: z.boolean().optional(),
    rsvp: z.enum(["pending", "yes", "no", "maybe"]).optional(),
    phone: z.string().max(30).optional(),
    email: z.string().max(254).optional(),
    table: z.string().max(100).optional(),
    dietaryNotes: z.string().max(500).optional(),
    checkedIn: z.boolean().optional(),
  })
  .passthrough();

const perKindSchemas: Record<DataKind, z.ZodTypeAny> = {
  event: eventSchema,
  tasks: z.array(taskSchema).max(MAX_ARRAY),
  budget: z.array(budgetSchema).max(MAX_ARRAY),
  vendors: z.array(vendorSchema).max(MAX_ARRAY),
  guests: z.array(guestSchema).max(MAX_ARRAY),
  milestones: z
    .array(
      z
        .object({
          id: idStr,
          title: shortStr,
          date: z.string().max(30),
          kind: z.enum(["venue", "vendor", "fitting", "legal", "payment", "review"]),
          done: z.boolean().optional(),
        })
        .passthrough(),
    )
    .max(MAX_ARRAY),
  notes: z
    .array(
      z
        .object({
          id: idStr,
          title: shortStr,
          body: longStr.optional(),
          tag: z.string().max(50).optional(),
          date: z.string().max(30).optional(),
        })
        .passthrough(),
    )
    .max(MAX_ARRAY),
  documents: z.array(docRefSchema).max(500),
  rundown: z
    .array(
      z
        .object({
          id: idStr,
          time: z.string().max(20),
          title: shortStr,
          location: z.string().max(300).optional(),
          pic: z.string().max(200).optional(),
          notes: longStr.optional(),
          status: z.enum(["planned", "done"]).optional(),
        })
        .passthrough(),
    )
    .max(MAX_ARRAY),
  seserahan: z
    .array(
      z
        .object({
          id: idStr,
          name: shortStr,
          category: z.string().max(100).optional(),
          quantity: z.number().min(0).max(10000).optional(),
          estimatedCost: z.number().min(0).max(1e13).optional(),
          actualCost: z.number().min(0).max(1e13).optional(),
          status: z.enum(["to_buy", "bought", "wrapped", "ready"]).optional(),
          payer: z.enum(["couple", "bride_family", "groom_family", "shared", "other"]).optional(),
          assignedTo: z.string().max(100).optional(),
          link: z.string().max(2048).optional(),
          notes: z.string().max(2000).optional(),
        })
        .passthrough(),
    )
    .max(MAX_ARRAY),
  command: z
    .object({
      contacts: z
        .array(
          z
            .object({
              id: idStr,
              name: shortStr,
              role: z.string().max(100).optional(),
              phone: z.string().max(30),
              type: z.enum(["vendor", "family", "emergency"]).optional(),
              notes: z.string().max(1000).optional(),
            })
            .passthrough(),
        )
        .max(500),
    })
    .passthrough(),
};

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
  // Zod per-kind validation
  const schema = perKindSchemas[kind];
  if (schema) {
    const result = schema.safeParse(payload);
    if (!result.success) {
      throw new Error(
        `Invalid payload for ${kind}: ${result.error.issues[0]?.message ?? "validation failed"}`,
      );
    }
  }
  // Extra: validate DocRef URLs to prevent stored javascript: XSS (defence in depth)
  if (kind === "documents" && Array.isArray(payload)) {
    for (const doc of payload as Array<Record<string, unknown>>) {
      if (typeof doc.url === "string" && doc.url.length > 0) {
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
    const data = emptyWorkspaceData();
    for (const row of rows.results ?? []) {
      if (!KINDS.includes(row.kind as DataKind)) continue;
      try {
        const parsed = JSON.parse(row.payload) as unknown;
        const result = perKindSchemas[row.kind as DataKind].safeParse(parsed);
        if (result.success) {
          (data as Record<string, unknown>)[row.kind] = result.data;
        }
      } catch {
        // Ignore one corrupt kind and keep the rest of the workspace usable.
      }
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
