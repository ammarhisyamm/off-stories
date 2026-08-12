import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireCloudflareAuth } from "@/integrations/cloudflare/auth-middleware";
import { getDatabase } from "@/lib/cloudflare.server";
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

export async function resolveMemberRole(workspaceId: string, userId: string): Promise<string | null> {
  const member = await getDatabase()
    .prepare("SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
    .bind(workspaceId, userId)
    .first<{ role: string }>();
  return member?.role ?? null;
}

export const loadWorkspaceData = createServerFn({ method: "GET" })
  .middleware([requireCloudflareAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const workspaceId = await resolveWorkspace(userId);
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
    const { userId } = context;
    const workspaceId = await resolveWorkspace(userId);
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
