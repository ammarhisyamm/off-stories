import { getDatabase } from "@/lib/cloudflare.server";

export type AuditAction =
  | "invite.create"
  | "invite.revoke"
  | "invite.accept"
  | "member.role_change"
  | "member.remove"
  | "member.leave"
  | "rsvp.create_link"
  | "rsvp.revoke_link"
  | "invitation.create"
  | "invitation.revoke";

export async function logAudit(opts: {
  workspaceId: string;
  actorId: string;
  action: AuditAction;
  targetId?: string | null;
  meta?: Record<string, unknown> | null;
}): Promise<void> {
  const { workspaceId, actorId, action, targetId, meta } = opts;
  try {
    await getDatabase()
      .prepare(
        `INSERT INTO audit_logs (id, workspace_id, actor_id, action, target_id, meta, created_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      )
      .bind(
        crypto.randomUUID(),
        workspaceId,
        actorId,
        action,
        targetId ?? null,
        meta ? JSON.stringify(meta).slice(0, 4000) : null,
      )
      .run();
  } catch (e) {
    // Table may not exist yet (migration not applied) — fallback to console
    console.log(
      JSON.stringify({
        audit: true,
        workspaceId,
        actorId,
        action,
        targetId,
        meta,
        error: e instanceof Error ? e.message : String(e),
      }),
    );
  }
}
