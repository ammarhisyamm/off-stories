import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
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

export async function resolveWorkspace(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_workspace_id")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.active_workspace_id) return profile.active_workspace_id;
  const { data: ws } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();
  return ws?.id ?? null;
}

export async function resolveMemberRole(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  userId: string,
): Promise<string | null> {
  if (!workspaceId) return null;
  const { data: owner } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .eq("owner_id", userId)
    .maybeSingle();
  if (owner) return "owner";
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  return member?.role ?? null;
}

export const loadWorkspaceData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const workspaceId = await resolveWorkspace(supabase, userId);
    if (!workspaceId) {
      return {
        workspaceId: null as string | null,
        role: null as string | null,
        data: emptyWorkspaceData(),
      };
    }
    const role = await resolveMemberRole(supabase, workspaceId, userId);
    const { data: rows } = await supabase
      .from("workspace_data")
      .select("kind,payload")
      .eq("workspace_id", workspaceId);
    const map = new Map<string, unknown>((rows ?? []).map((r) => [r.kind, r.payload]));
    const data = emptyWorkspaceData();
    for (const kind of KINDS) {
      const value = map.get(kind);
      if (value !== undefined) (data as Record<string, unknown>)[kind] = value;
    }
    return { workspaceId, role, data };
  });

export const saveWorkspaceData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ kind: z.enum(KINDS), payload: z.unknown() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await resolveWorkspace(supabase, userId);
    if (!workspaceId) throw new Error("No workspace found");
    const role = await resolveMemberRole(supabase, workspaceId, userId);
    if (role === "viewer") {
      throw new Error(
        "You have read-only access to this workspace. Ask the owner to change your role if you need to make edits.",
      );
    }
    const { error } = await supabase
      .from("workspace_data")
      .upsert(
        { workspace_id: workspaceId, kind: data.kind, payload: data.payload },
        { onConflict: "workspace_id,kind" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
