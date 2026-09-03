import { createFileRoute } from "@tanstack/react-router";
import { requireCurrentUser } from "@/lib/auth.server";
import { getDocumentsBucket } from "@/lib/cloudflare.server";
import { resolveAccessibleWorkspace, resolveMemberRole } from "@/lib/data.functions";

export const Route = createFileRoute("/api/documents/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const user = await requireCurrentUser();
        const workspaceId = await resolveAccessibleWorkspace(user.id);
        const key = params._splat;
        if (!workspaceId || !key || !key.startsWith(`${workspaceId}/`)) {
          return new Response("Not found", { status: 404 });
        }
        if (!(await resolveMemberRole(workspaceId, user.id))) {
          return new Response("Forbidden", { status: 403 });
        }
        const object = await getDocumentsBucket().get(key);
        if (!object) return new Response("Not found", { status: 404 });
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("cache-control", "private, no-store");
        headers.set("x-content-type-options", "nosniff");
        headers.set("content-security-policy", "default-src 'none'; frame-ancestors 'none'");
        // Force download disposition remains as stored; add nosniff to prevent MIME-sniff XSS
        return new Response(object.body, { headers });
      },
    },
  },
});
