import { createFileRoute } from "@tanstack/react-router";
import { requireCloudflareAuth } from "@/integrations/cloudflare/auth-middleware";
import { getDocumentsBucket } from "@/lib/cloudflare.server";
import { resolveMemberRole, resolveWorkspace } from "@/lib/data.functions";

export const Route = createFileRoute("/api/documents/$")({
  server: {
    middleware: [requireCloudflareAuth],
    handlers: {
      GET: async ({ context, params }) => {
        const workspaceId = await resolveWorkspace(context.userId);
        const key = params._splat;
        if (!workspaceId || !key || !key.startsWith(`${workspaceId}/`)) {
          return new Response("Not found", { status: 404 });
        }
        if (!(await resolveMemberRole(workspaceId, context.userId))) {
          return new Response("Forbidden", { status: 403 });
        }
        const object = await getDocumentsBucket().get(key);
        if (!object) return new Response("Not found", { status: 404 });
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("cache-control", "private, no-store");
        return new Response(object.body, { headers });
      },
    },
  },
});
